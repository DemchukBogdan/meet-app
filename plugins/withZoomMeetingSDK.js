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
const {
  withAndroidManifest,
  withAppBuildGradle,
  withInfoPlist,
  createRunOncePlugin,
} = require("@expo/config-plugins");

const ZOOM_SDK_VERSION = "7.0.5"; // keep in sync with @zoom/meetingsdk-react-native version in package.json

// Permissions Zoom's Meeting SDK needs at runtime (camera/mic/screenshare/etc.)
const ANDROID_PERMISSIONS = [
  "android.permission.WRITE_EXTERNAL_STORAGE",
  "android.permission.INTERNET",
  "android.permission.ACCESS_NETWORK_STATE",
  "android.permission.ACCESS_WIFI_STATE",
  "android.permission.READ_PHONE_STATE",
  "android.permission.BLUETOOTH",
  "android.permission.BLUETOOTH_ADMIN",
  "android.permission.BLUETOOTH_CONNECT",
  "android.permission.BLUETOOTH_SCAN",
  "android.permission.MODIFY_AUDIO_SETTINGS",
  "android.permission.BROADCAST_STICKY",
  "android.permission.RECORD_AUDIO",
  "android.permission.CAMERA",
  "android.permission.WAKE_LOCK",
  "android.permission.CALL_PHONE",
  "android.permission.SYSTEM_ALERT_WINDOW",
  "android.permission.FOREGROUND_SERVICE",
  "android.permission.POST_NOTIFICATIONS",
  "android.permission.REORDER_TASKS",
];

// This one needs a maxSdkVersion attribute, so it's handled separately.
const READ_EXTERNAL_STORAGE = {
  name: "android.permission.READ_EXTERNAL_STORAGE",
  maxSdkVersion: "32",
};

function withZoomAndroidManifest(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    manifest.manifest["uses-permission"] =
      manifest.manifest["uses-permission"] || [];
    const existing = manifest.manifest["uses-permission"];

    const hasPermission = (name) =>
      existing.some((p) => p.$["android:name"] === name);

    for (const name of ANDROID_PERMISSIONS) {
      if (!hasPermission(name)) {
        existing.push({ $: { "android:name": name } });
      }
    }

    if (!hasPermission(READ_EXTERNAL_STORAGE.name)) {
      existing.push({
        $: {
          "android:name": READ_EXTERNAL_STORAGE.name,
          "android:maxSdkVersion": READ_EXTERNAL_STORAGE.maxSdkVersion,
        },
      });
    }

    // Zoom's SDK does not support cleartext traffic. Expo's debug manifest
    // sets usesCleartextTraffic="true" for local dev; Zoom requires
    // tools:replace so the merged manifest doesn't conflict.
    const application = manifest.manifest.application?.[0];
    if (application) {
      application.$["tools:replace"] = application.$["tools:replace"]
        ? `${application.$["tools:replace"]},android:usesCleartextTraffic`
        : "android:usesCleartextTraffic";
      manifest.manifest.$["xmlns:tools"] =
        manifest.manifest.$["xmlns:tools"] || "http://schemas.android.com/tools";
    }

    return config;
  });
}

function withZoomAppBuildGradle(config) {
  return withAppBuildGradle(config, (config) => {
    const dependency = `implementation 'us.zoom.meetingsdk:zoomsdk:${ZOOM_SDK_VERSION}'`;
    if (!config.modResults.contents.includes("us.zoom.meetingsdk:zoomsdk")) {
      config.modResults.contents = config.modResults.contents.replace(
        /dependencies\s*{/,
        `dependencies {\n    ${dependency}`
      );
    }
    return config;
  });
}

function withZoomInfoPlist(config) {
  return withInfoPlist(config, (config) => {
    config.modResults.NSCameraUsageDescription =
      config.modResults.NSCameraUsageDescription ||
      "For people to see you during meetings, we need access to your camera.";
    config.modResults.NSMicrophoneUsageDescription =
      config.modResults.NSMicrophoneUsageDescription ||
      "For people to hear you during meetings, we need access to your microphone.";
    config.modResults.NSBluetoothPeripheralUsageDescription =
      config.modResults.NSBluetoothPeripheralUsageDescription ||
      "We will use your Bluetooth to access your Bluetooth headphones.";
    config.modResults.NSPhotoLibraryUsageDescription =
      config.modResults.NSPhotoLibraryUsageDescription ||
      "For people to share, we need access to your photos.";
    return config;
  });
}

const withZoomMeetingSDK = (config) => {
  config = withZoomAndroidManifest(config);
  config = withZoomAppBuildGradle(config);
  config = withZoomInfoPlist(config);
  return config;
};

module.exports = createRunOncePlugin(
  withZoomMeetingSDK,
  "with-zoom-meetingsdk",
  "1.0.0"
);
