/**
 * Picture-in-Picture and lock-screen keep-alive for Zoom Meeting SDK.
 *
 * iOS Default UI PiP requires:
 *   - UIBackgroundModes: audio + voip
 *   - CallKit (patched into the RN Zoom wrapper)
 *   - Multitasking Camera Access so the camera can stay on in PiP
 *
 * Android Default UI PiP requires:
 *   - MainActivity supportsPictureInPicture + PiP configChanges
 *   - FOREGROUND_SERVICE_PHONE_CALL / CAMERA so audio+video survive a locked screen
 *
 * Docs:
 * https://developers.zoom.us/blog/meeting-sdk-ios-picture-in-picture/
 * https://developers.zoom.us/docs/meeting-sdk/react-native/integrate/
 */
const {
  AndroidConfig,
  withAndroidManifest,
  withEntitlementsPlist,
  withInfoPlist,
} = require("@expo/config-plugins");

const IOS_BACKGROUND_MODES = ["audio", "voip"];

const ANDROID_LOCK_SCREEN_PERMISSIONS = [
  "android.permission.FOREGROUND_SERVICE_PHONE_CALL",
  "android.permission.FOREGROUND_SERVICE_CAMERA",
  "android.permission.USE_FULL_SCREEN_INTENT",
];

const PIP_CONFIG_CHANGES = [
  "keyboard",
  "keyboardHidden",
  "orientation",
  "screenSize",
  "screenLayout",
  "uiMode",
  "smallestScreenSize",
];

function withZoomPipInfoPlist(config) {
  return withInfoPlist(config, (config) => {
    const backgroundModes = new Set(config.modResults.UIBackgroundModes || []);
    for (const mode of IOS_BACKGROUND_MODES) {
      backgroundModes.add(mode);
    }
    config.modResults.UIBackgroundModes = Array.from(backgroundModes);
    return config;
  });
}

function withZoomPipEntitlements(config) {
  return withEntitlementsPlist(config, (config) => {
    config.modResults["com.apple.developer.avfoundation.multitasking-camera-access"] =
      true;
    return config;
  });
}

function mergeConfigChanges(existing) {
  const values = String(existing || "")
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
  return Array.from(new Set([...values, ...PIP_CONFIG_CHANGES])).join("|");
}

function withZoomPipAndroidManifest(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    manifest.manifest["uses-permission"] =
      manifest.manifest["uses-permission"] || [];
    const existing = manifest.manifest["uses-permission"];
    const hasPermission = (name) =>
      existing.some((item) => item.$["android:name"] === name);

    for (const name of ANDROID_LOCK_SCREEN_PERMISSIONS) {
      if (!hasPermission(name)) {
        existing.push({ $: { "android:name": name } });
      }
    }

    const activity =
      AndroidConfig.Manifest.getMainActivity(manifest) ||
      AndroidConfig.Manifest.getRunnableActivity(manifest);
    if (!activity) {
      throw new Error(
        "withZoomPipAndLockScreen: AndroidManifest.xml is missing MainActivity"
      );
    }
    activity.$["android:supportsPictureInPicture"] = "true";
    activity.$["android:resizeableActivity"] = "true";
    activity.$["android:configChanges"] = mergeConfigChanges(
      activity.$["android:configChanges"]
    );

    const application =
      AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);
    application.$["android:hardwareAccelerated"] = "true";

    return config;
  });
}

function withZoomPipAndLockScreen(config) {
  config = withZoomPipInfoPlist(config);
  config = withZoomPipEntitlements(config);
  config = withZoomPipAndroidManifest(config);
  return config;
}

module.exports = withZoomPipAndLockScreen;
