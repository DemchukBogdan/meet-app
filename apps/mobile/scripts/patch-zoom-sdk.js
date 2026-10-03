#!/usr/bin/env node
/**
 * Patches @zoom/meetingsdk-react-native after install:
 * 1. Strip jcenter() (Gradle 9 removed that DSL; Zoom 7.0.5 still calls it).
 * 2. Enable Picture-in-Picture + lock-screen keep-alive (CallKit on iOS,
 *    disablePIPMode on Android) which the stock RN wrapper does not wire up.
 *
 * Idempotent. Resolves the package from this repo root, so it works from any cwd:
 *   node scripts/patch-zoom-sdk.js
 *   npm run zoom:patch
 *
 * Wired to postinstall so a fresh npm install (local, CI, EAS) applies it.
 */
const fs = require('fs');
const path = require('path');

const PACKAGE_NAME = '@zoom/meetingsdk-react-native';
const projectRoot = path.join(__dirname, '..');
const KEEP_ALIVE_MARKER = '[with-zoom-pip]';
const JCENTER_LINE = /^[ \t]*jcenter\(\)[ \t]*\r?\n/gm;

const ANDROID_MINIMIZE_BLOCK = `      // Enable Zoom's custom floating mini-meeting window (uses SYSTEM_ALERT_WINDOW).
      // Without this the minimize button silently falls back to Android PIP, which
      // many emulators/devices don't support.
      if (zoomSDK.getZoomUIService() != null) {
        zoomSDK.getZoomUIService().enableMinimizeMeeting(true);
      }`;

const ANDROID_PIP_BLOCK = `      // [with-zoom-pip] PiP is enabled by default; minimize-meeting disables it.
      if (zoomSDK.getZoomUIService() != null) {
        zoomSDK.getZoomUIService().disablePIPMode(false);
        zoomSDK.getZoomUIService().enableMinimizeMeeting(false);
      }`;

function getPackageRoot() {
  try {
    const packageJsonPath = require.resolve(`${PACKAGE_NAME}/package.json`, {
      paths: [projectRoot],
    });
    return path.dirname(packageJsonPath);
  } catch {
    throw new Error(
      `${PACKAGE_NAME} is not installed. Run npm install first, then retry.`,
    );
  }
}

function writeIfChanged(
  filePath,
  nextContents,
  alreadyMessage,
  updatedMessage,
) {
  const current = fs.existsSync(filePath)
    ? fs.readFileSync(filePath, 'utf8')
    : '';
  if (current === nextContents) {
    console.log(alreadyMessage);
    return;
  }
  fs.writeFileSync(filePath, nextContents);
  console.log(updatedMessage);
}

function patchJcenter(packageRoot) {
  const gradlePath = path.join(packageRoot, 'android', 'build.gradle');
  if (!fs.existsSync(gradlePath)) {
    throw new Error(`Zoom Android Gradle file not found: ${gradlePath}`);
  }

  const contents = fs.readFileSync(gradlePath, 'utf8');
  const patched = contents.replace(JCENTER_LINE, '');
  writeIfChanged(
    gradlePath,
    patched,
    `[zoom sdk patch] jcenter already removed: ${gradlePath}`,
    `[zoom sdk patch] removed jcenter() from ${gradlePath}`,
  );
}

function copyKeepAliveSources(packageRoot) {
  const sourceDir = path.join(projectRoot, 'plugins', 'zoom-pip');
  const targetDir = path.join(packageRoot, 'ios');
  const files = ['ZoomMeetingKeepAlive.h', 'ZoomMeetingKeepAlive.m'];

  for (const fileName of files) {
    const sourcePath = path.join(sourceDir, fileName);
    const targetPath = path.join(targetDir, fileName);
    if (!fs.existsSync(sourcePath)) {
      throw new Error(`Zoom PiP helper missing: ${sourcePath}`);
    }
    writeIfChanged(
      targetPath,
      fs.readFileSync(sourcePath, 'utf8'),
      `[zoom sdk patch] already copied ${fileName}`,
      `[zoom sdk patch] copied ${fileName} into ${targetDir}`,
    );
  }
}

function patchIosZoomModule(packageRoot) {
  const modulePath = path.join(packageRoot, 'ios', 'RNZoomSDK.m');
  if (!fs.existsSync(modulePath)) {
    throw new Error(`Zoom iOS module not found: ${modulePath}`);
  }

  let contents = fs.readFileSync(modulePath, 'utf8');
  if (contents.includes(KEEP_ALIVE_MARKER)) {
    console.log(`[zoom sdk patch] iOS PiP already applied: ${modulePath}`);
    return;
  }

  if (!contents.includes('#import "RNZoomSDK.h"')) {
    throw new Error(`Unexpected Zoom iOS module contents: ${modulePath}`);
  }

  contents = contents.replace(
    '#import "RNZoomSDK.h"\n',
    `#import "RNZoomSDK.h"\n#import "ZoomMeetingKeepAlive.h"\n`,
  );

  const authHook = `        if (meetService) {
            meetService.delegate = self;
        }`;
  const authHookPatched = `        if (meetService) {
            meetService.delegate = self;
        }
        // [with-zoom-pip] Default-UI PiP needs this set before join/start.
        [ZoomMeetingKeepAlive enablePictureInPicture];`;
  if (!contents.includes(authHook)) {
    throw new Error(
      'Could not find onMobileRTCAuthReturn meeting-service hook',
    );
  }
  contents = contents.replace(authHook, authHookPatched);

  const stateHook = `- (void)onMeetingStateChange:(MobileRTCMeetingState)state {
    NSString *stateStr = [[RCTConvert MobileRTCMeetingStateValuesReversed] objectForKey:@(state)];
    [self sendEventWithName:@"onMeetingStateChange" body:@{@"state": stateStr ?: @"MobileRTCMeetingState_Idle"}];
}
@end`;
  const stateHookPatched = `- (void)onMeetingStateChange:(MobileRTCMeetingState)state {
    NSString *stateStr = [[RCTConvert MobileRTCMeetingStateValuesReversed] objectForKey:@(state)];
    [self sendEventWithName:@"onMeetingStateChange" body:@{@"state": stateStr ?: @"MobileRTCMeetingState_Idle"}];
    // [with-zoom-pip] Drive CallKit so iOS PiP and lock-screen audio stay alive.
    [ZoomMeetingKeepAlive handleMeetingState:state];
}

- (BOOL)onCheckIfMeetingVoIPCallRunning {
    return [ZoomMeetingKeepAlive isVoIPCallRunning];
}
@end`;
  if (!contents.includes(stateHook)) {
    throw new Error('Could not find onMeetingStateChange implementation');
  }
  contents = contents.replace(stateHook, stateHookPatched);

  fs.writeFileSync(modulePath, contents);
  console.log(`[zoom sdk patch] wired iOS PiP/CallKit into ${modulePath}`);
}

function patchIosPodspec(packageRoot) {
  const podspecPath = path.join(packageRoot, 'meetingsdk-react-native.podspec');
  if (!fs.existsSync(podspecPath)) {
    throw new Error(`Zoom podspec not found: ${podspecPath}`);
  }

  let contents = fs.readFileSync(podspecPath, 'utf8');
  if (contents.includes('s.frameworks') && contents.includes('CallKit')) {
    console.log(`[zoom sdk patch] CallKit already linked: ${podspecPath}`);
    return;
  }

  if (!contents.includes('s.dependency "React-Core"')) {
    throw new Error(`Unexpected Zoom podspec contents: ${podspecPath}`);
  }

  contents = contents.replace(
    's.dependency "React-Core"\n',
    's.dependency "React-Core"\n  s.frameworks = "CallKit"\n',
  );
  fs.writeFileSync(podspecPath, contents);
  console.log(`[zoom sdk patch] linked CallKit in ${podspecPath}`);
}

function patchAndroidZoomModule(packageRoot) {
  const modulePath = path.join(
    packageRoot,
    'android/src/main/java/com/reactnativezoom/sdk/RNZoomSDKModule.java',
  );
  if (!fs.existsSync(modulePath)) {
    throw new Error(`Zoom Android module not found: ${modulePath}`);
  }

  let contents = fs.readFileSync(modulePath, 'utf8');
  if (contents.includes(KEEP_ALIVE_MARKER)) {
    console.log(`[zoom sdk patch] Android PiP already applied: ${modulePath}`);
    return;
  }

  if (!contents.includes(ANDROID_MINIMIZE_BLOCK)) {
    throw new Error(
      'Could not find enableMinimizeMeeting block in RNZoomSDKModule.java',
    );
  }

  contents = contents.replace(ANDROID_MINIMIZE_BLOCK, ANDROID_PIP_BLOCK);
  fs.writeFileSync(modulePath, contents);
  console.log(`[zoom sdk patch] enabled Android PiP in ${modulePath}`);
}

function patchZoomSdk() {
  const packageRoot = getPackageRoot();
  patchJcenter(packageRoot);
  copyKeepAliveSources(packageRoot);
  patchIosZoomModule(packageRoot);
  patchIosPodspec(packageRoot);
  patchAndroidZoomModule(packageRoot);
}

try {
  patchZoomSdk();
} catch (error) {
  console.error(`[zoom sdk patch] ${error.message}`);
  process.exit(1);
}
