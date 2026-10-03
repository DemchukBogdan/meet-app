/**
 * Expo config plugin for @zoom/meetingsdk-react-native
 *
 * Zoom's official docs only cover bare React Native (manual gradle/pod edits).
 * This plugin reproduces those exact edits as an Expo config plugin, so they
 * are re-applied automatically every time `expo prebuild` regenerates the
 * native `android/` and `ios/` folders — no manual native-file editing needed
 * after upgrades or clean prebuilds.
 *
 * Docs: https://developers.zoom.us/docs/meeting-sdk/react-native/integrate/
 */
const fs = require('fs');
const path = require('path');
const {
  withAndroidManifest,
  withAppBuildGradle,
  withGradleProperties,
  withInfoPlist,
  withXcodeProject,
  withDangerousMod,
  createRunOncePlugin,
} = require('@expo/config-plugins');

const ZOOM_SDK_VERSION = '7.0.5'; // keep in sync with @zoom/meetingsdk-react-native version in package.json

// Permissions Zoom's Meeting SDK needs at runtime (camera/mic/screenshare/etc.)
const ANDROID_PERMISSIONS = [
  'android.permission.WRITE_EXTERNAL_STORAGE',
  'android.permission.INTERNET',
  'android.permission.ACCESS_NETWORK_STATE',
  'android.permission.ACCESS_WIFI_STATE',
  'android.permission.READ_PHONE_STATE',
  'android.permission.BLUETOOTH',
  'android.permission.BLUETOOTH_ADMIN',
  'android.permission.BLUETOOTH_CONNECT',
  'android.permission.BLUETOOTH_SCAN',
  'android.permission.MODIFY_AUDIO_SETTINGS',
  'android.permission.BROADCAST_STICKY',
  'android.permission.RECORD_AUDIO',
  'android.permission.CAMERA',
  'android.permission.WAKE_LOCK',
  'android.permission.CALL_PHONE',
  'android.permission.SYSTEM_ALERT_WINDOW',
  'android.permission.FOREGROUND_SERVICE',
  'android.permission.POST_NOTIFICATIONS',
  'android.permission.REORDER_TASKS',
];

// This one needs a maxSdkVersion attribute, so it's handled separately.
const READ_EXTERNAL_STORAGE = {
  name: 'android.permission.READ_EXTERNAL_STORAGE',
  maxSdkVersion: '32',
};

function withZoomAndroidManifest(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    manifest.manifest['uses-permission'] =
      manifest.manifest['uses-permission'] || [];
    const existing = manifest.manifest['uses-permission'];

    const hasPermission = (name) =>
      existing.some((p) => p.$['android:name'] === name);

    for (const name of ANDROID_PERMISSIONS) {
      if (!hasPermission(name)) {
        existing.push({ $: { 'android:name': name } });
      }
    }

    if (!hasPermission(READ_EXTERNAL_STORAGE.name)) {
      existing.push({
        $: {
          'android:name': READ_EXTERNAL_STORAGE.name,
          'android:maxSdkVersion': READ_EXTERNAL_STORAGE.maxSdkVersion,
        },
      });
    }

    // Zoom's AAR sets usesCleartextTraffic=false and allowBackup=false.
    // Expo debug wants cleartext for Metro (HTTP). A networkSecurityConfig
    // lets Zoom stay HTTPS-only while debug still talks to 10.0.2.2 / localhost.
    // When networkSecurityConfig is set, usesCleartextTraffic is ignored.
    const application = manifest.manifest.application?.[0];
    if (application) {
      application.$['android:usesCleartextTraffic'] = 'false';
      application.$['android:allowBackup'] = 'false';
      application.$['android:networkSecurityConfig'] =
        '@xml/network_security_config';
      const replaceAttrs = [
        'android:usesCleartextTraffic',
        'android:allowBackup',
        'android:networkSecurityConfig',
      ];
      const existingReplace = application.$['tools:replace']
        ? application.$['tools:replace'].split(',').map((s) => s.trim())
        : [];
      application.$['tools:replace'] = Array.from(
        new Set([...existingReplace, ...replaceAttrs]),
      ).join(',');
      manifest.manifest.$['xmlns:tools'] =
        manifest.manifest.$['xmlns:tools'] ||
        'http://schemas.android.com/tools';
    }

    return config;
  });
}

function withZoomAppBuildGradle(config) {
  return withAppBuildGradle(config, (config) => {
    const dependency = `implementation 'us.zoom.meetingsdk:zoomsdk:${ZOOM_SDK_VERSION}'`;
    if (!config.modResults.contents.includes('us.zoom.meetingsdk:zoomsdk')) {
      config.modResults.contents = config.modResults.contents.replace(
        /dependencies\s*{/,
        `dependencies {\n    ${dependency}`,
      );
    }
    return config;
  });
}

function withZoomNetworkSecurityConfig(config) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.platformProjectRoot;
      const mainXmlDir = path.join(projectRoot, 'app/src/main/res/xml');
      const debugXmlDir = path.join(projectRoot, 'app/src/debug/res/xml');
      fs.mkdirSync(mainXmlDir, { recursive: true });
      fs.mkdirSync(debugXmlDir, { recursive: true });

      fs.writeFileSync(
        path.join(mainXmlDir, 'network_security_config.xml'),
        `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="false" />
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">10.0.2.2</domain>
        <domain includeSubdomains="true">10.0.3.2</domain>
        <domain includeSubdomains="true">127.0.0.1</domain>
    </domain-config>
</network-security-config>
`,
      );

      // Debug Metro can bind to any LAN IP; allow HTTP for the whole debug build.
      fs.writeFileSync(
        path.join(debugXmlDir, 'network_security_config.xml'),
        `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="true" />
</network-security-config>
`,
      );

      return config;
    },
  ]);
}

function withZoomInfoPlist(config) {
  return withInfoPlist(config, (config) => {
    config.modResults.NSCameraUsageDescription =
      config.modResults.NSCameraUsageDescription ||
      'For people to see you during meetings, we need access to your camera.';
    config.modResults.NSMicrophoneUsageDescription =
      config.modResults.NSMicrophoneUsageDescription ||
      'For people to hear you during meetings, we need access to your microphone.';
    config.modResults.NSBluetoothAlwaysUsageDescription =
      config.modResults.NSBluetoothAlwaysUsageDescription ||
      'We will use Bluetooth to connect to wireless headphones during meetings.';
    config.modResults.NSBluetoothPeripheralUsageDescription =
      config.modResults.NSBluetoothPeripheralUsageDescription ||
      'We will use your Bluetooth to access your Bluetooth headphones.';
    config.modResults.NSPhotoLibraryUsageDescription =
      config.modResults.NSPhotoLibraryUsageDescription ||
      'For people to share, we need access to your photos.';
    config.modResults.NSLocalNetworkUsageDescription =
      config.modResults.NSLocalNetworkUsageDescription ||
      'Allow local network access so the development client can load JavaScript from Metro.';

    const backgroundModes = new Set(config.modResults.UIBackgroundModes || []);
    backgroundModes.add('audio');
    backgroundModes.add('voip');
    config.modResults.UIBackgroundModes = Array.from(backgroundModes);

    return config;
  });
}

function quoteXcodeValue(value) {
  const raw = String(value).replace(/^"+|"+$/g, '');
  return `"${raw}"`;
}

function addObjCLinkerFlag(flags) {
  const list = Array.isArray(flags)
    ? flags.map(quoteXcodeValue)
    : flags
      ? [quoteXcodeValue(flags)]
      : ['"$(inherited)"'];
  if (!list.some((flag) => flag.includes('-ObjC'))) {
    list.push('"-ObjC"');
  }
  return list;
}

function isZoomScreenShareConfig(buildSettings) {
  const infoPlist = String(buildSettings.INFOPLIST_FILE ?? '');
  const bundleId = String(buildSettings.PRODUCT_BUNDLE_IDENTIFIER ?? '');
  return (
    infoPlist.includes('ZoomScreenShare') ||
    bundleId.includes('ZoomScreenShare')
  );
}

function withZoomIosBuildSettings(config) {
  return withXcodeProject(config, (config) => {
    const project = config.modResults;
    const configurations = project.pbxXCBuildConfigurationSection();

    Object.values(configurations).forEach((buildConfig) => {
      const buildSettings = buildConfig.buildSettings;
      if (!buildSettings) {
        return;
      }

      buildSettings.ENABLE_BITCODE = 'NO';

      // The ReplayKit extension is Objective-C++ and must not inherit the
      // main app's -ObjC / embed-Swift settings — they also corrupt pbxproj
      // quoting if applied to a freshly created target.
      if (isZoomScreenShareConfig(buildSettings)) {
        return;
      }

      buildSettings.ALWAYS_EMBED_SWIFT_STANDARD_LIBRARIES = 'YES';
      buildSettings.OTHER_LDFLAGS = addObjCLinkerFlag(
        buildSettings.OTHER_LDFLAGS,
      );
    });

    return config;
  });
}

function withZoomGradleMemory(config) {
  return withGradleProperties(config, (config) => {
    const key = 'org.gradle.jvmargs';
    const value =
      '-Xmx4096m -XX:MaxMetaspaceSize=1024m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8';
    const existing = config.modResults.find(
      (item) => item.type === 'property' && item.key === key,
    );
    if (existing) {
      existing.value = value;
    } else {
      config.modResults.push({ type: 'property', key, value });
    }
    return config;
  });
}

const withZoomScreenShare = require('./withZoomScreenShare');
const withZoomPipAndLockScreen = require('./withZoomPipAndLockScreen');

const withZoomMeetingSDK = (config) => {
  config = withZoomNetworkSecurityConfig(config);
  config = withZoomAndroidManifest(config);
  config = withZoomAppBuildGradle(config);
  config = withZoomGradleMemory(config);
  config = withZoomInfoPlist(config);
  config = withZoomIosBuildSettings(config);
  config = withZoomScreenShare(config);
  config = withZoomPipAndLockScreen(config);
  return config;
};

module.exports = createRunOncePlugin(
  withZoomMeetingSDK,
  'with-zoom-meetingsdk',
  '1.4.0',
);
