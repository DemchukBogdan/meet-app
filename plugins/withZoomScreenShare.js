/**
 * Adds Zoom Meeting SDK screen sharing:
 * - iOS: ReplayKit Broadcast Upload Extension + App Group
 * - Android: MediaProjection / mediaPlayback foreground-service permissions
 *
 * Zoom in-meeting UI starts share; this plugin only supplies the native
 * capture pipeline the SDK needs. Docs:
 * https://developers.zoom.us/docs/meeting-sdk/ios/default-ui/basic-features/ios-screen-share-trouble-tips/
 */
const fs = require("fs");
const path = require("path");
const plist = require("@expo/plist");
const buildPlist = plist.build ?? plist.default.build;
const {
  AndroidConfig,
  withAndroidManifest,
  withDangerousMod,
  withEntitlementsPlist,
  withXcodeProject,
} = require("@expo/config-plugins");

const EXTENSION_NAME = "ZoomScreenShare";
const APP_GROUP_PLACEHOLDER = "__ZOOM_APP_GROUP_ID__";
const SCREEN_SHARE_SERVICE =
  "com.zipow.videobox.share.ScreenShareServiceForSDK";
const SCREEN_SHARE_SERVICE_TYPES =
  "mediaProjection|mediaPlayback|microphone|connectedDevice|phoneCall|camera";

const ANDROID_SCREEN_SHARE_PERMISSIONS = [
  "android.permission.FOREGROUND_SERVICE_MEDIA_PROJECTION",
  "android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK",
  "android.permission.FOREGROUND_SERVICE_MICROPHONE",
  "android.permission.FOREGROUND_SERVICE_CONNECTED_DEVICE",
  "android.permission.FOREGROUND_SERVICE_PHONE_CALL",
  "android.permission.FOREGROUND_SERVICE_CAMERA",
];

function getBundleId(config) {
  return config.ios?.bundleIdentifier || "com.yourcompany.mobileapp";
}

function getAppGroupId(bundleId) {
  return `group.${bundleId}`;
}

function getExtensionBundleId(bundleId) {
  return `${bundleId}.${EXTENSION_NAME}`;
}

function getDeploymentTarget(config) {
  return config.ios?.deploymentTarget || "16.4";
}

function declareEasAppExtension(config, { appGroupId, extensionBundleId }) {
  config.extra = config.extra ?? {};
  config.extra.zoomAppGroupId = appGroupId;
  config.extra.zoomReplaykitBundleIdentifier = extensionBundleId;

  config.extra.eas = config.extra.eas ?? {};
  config.extra.eas.build = config.extra.eas.build ?? {};
  config.extra.eas.build.experimental =
    config.extra.eas.build.experimental ?? {};
  config.extra.eas.build.experimental.ios =
    config.extra.eas.build.experimental.ios ?? {};

  const extensions =
    config.extra.eas.build.experimental.ios.appExtensions ?? [];
  const withoutExisting = extensions.filter(
    (item) => item.targetName !== EXTENSION_NAME
  );

  config.extra.eas.build.experimental.ios.appExtensions = [
    ...withoutExisting,
    {
      targetName: EXTENSION_NAME,
      bundleIdentifier: extensionBundleId,
      entitlements: {
        "com.apple.security.application-groups": [appGroupId],
      },
    },
  ];

  return config;
}

function withMainAppEntitlements(config, appGroupId) {
  return withEntitlementsPlist(config, (config) => {
    const existing =
      config.modResults["com.apple.security.application-groups"] ?? [];
    if (!existing.includes(appGroupId)) {
      config.modResults["com.apple.security.application-groups"] = [
        ...existing,
        appGroupId,
      ];
    }
    return config;
  });
}

function withScreenShareXcodeProject(config, { extensionBundleId }) {
  return withXcodeProject(config, (config) => {
    const xcodeProject = config.modResults;
    if (xcodeProject.pbxTargetByName(EXTENSION_NAME)) {
      return config;
    }

    const target = xcodeProject.addTarget(
      EXTENSION_NAME,
      "app_extension",
      EXTENSION_NAME,
      extensionBundleId
    );

    const sourceFiles = [
      "SampleHandler.h",
      "SampleHandler.mm",
      "Info.plist",
      `${EXTENSION_NAME}.entitlements`,
    ];

    const group = xcodeProject.addPbxGroup(
      sourceFiles,
      EXTENSION_NAME,
      EXTENSION_NAME
    );
    const mainGroupId = xcodeProject.getFirstProject().firstProject.mainGroup;
    const mainGroup = xcodeProject.getPBXGroupByKey(mainGroupId);
    if (mainGroup?.children && group?.uuid) {
      mainGroup.children.push({
        value: group.uuid,
        comment: EXTENSION_NAME,
      });
    }
    xcodeProject.addBuildPhase(
      [`${EXTENSION_NAME}/SampleHandler.mm`],
      "PBXSourcesBuildPhase",
      "Sources",
      target.uuid
    );
    xcodeProject.addBuildPhase(
      [],
      "PBXFrameworksBuildPhase",
      "Frameworks",
      target.uuid
    );

    const systemFrameworks = [
      "ReplayKit",
      "CoreGraphics",
      "CoreMedia",
      "CoreVideo",
      "VideoToolbox",
    ];
    for (const framework of systemFrameworks) {
      xcodeProject.addFramework(`${framework}.framework`, {
        target: target.uuid,
      });
    }

    const configurations = xcodeProject.pbxXCBuildConfigurationSection();
    const nativeTarget = xcodeProject.pbxNativeTargetSection()[target.uuid];
    const configList =
      nativeTarget &&
      xcodeProject.pbxXCConfigurationList()[nativeTarget.buildConfigurationList];

    if (configList?.buildConfigurations) {
      for (const buildConfig of configList.buildConfigurations) {
        const entry = configurations[buildConfig.value];
        if (!entry?.buildSettings) {
          continue;
        }

        entry.buildSettings.INFOPLIST_FILE = `${EXTENSION_NAME}/Info.plist`;
        entry.buildSettings.CODE_SIGN_ENTITLEMENTS = `${EXTENSION_NAME}/${EXTENSION_NAME}.entitlements`;
        entry.buildSettings.PRODUCT_BUNDLE_IDENTIFIER = `"${extensionBundleId}"`;
        entry.buildSettings.IPHONEOS_DEPLOYMENT_TARGET =
          getDeploymentTarget(config);
        entry.buildSettings.TARGETED_DEVICE_FAMILY = '"1,2"';
        entry.buildSettings.GENERATE_INFOPLIST_FILE = "NO";
        entry.buildSettings.SKIP_INSTALL = "YES";
        entry.buildSettings.ENABLE_BITCODE = "NO";
        entry.buildSettings.CLANG_ENABLE_OBJC_ARC = "YES";
        entry.buildSettings.CLANG_CXX_LANGUAGE_STANDARD = '"gnu++17"';
        entry.buildSettings.CURRENT_PROJECT_VERSION =
          config.ios?.buildNumber ?? "1";
        entry.buildSettings.MARKETING_VERSION = config.version ?? "1.0.0";
        entry.buildSettings.LD_RUNPATH_SEARCH_PATHS =
          '"$(inherited) @executable_path/Frameworks @executable_path/../../Frameworks"';
        entry.buildSettings.OTHER_LDFLAGS = ['"$(inherited)"', '"-lc++"'];
      }
    }

    return config;
  });
}

function withScreenShareExtensionFiles(config, { appGroupId, extensionBundleId }) {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const extensionPath = path.join(
        config.modRequest.platformProjectRoot,
        EXTENSION_NAME
      );
      const templateDir = path.join(__dirname, "zoom-screen-share");
      fs.mkdirSync(extensionPath, { recursive: true });

      const header = fs.readFileSync(
        path.join(templateDir, "SampleHandler.h"),
        "utf8"
      );
      const implementation = fs
        .readFileSync(path.join(templateDir, "SampleHandler.mm"), "utf8")
        .split(APP_GROUP_PLACEHOLDER)
        .join(appGroupId);

      fs.writeFileSync(path.join(extensionPath, "SampleHandler.h"), header);
      fs.writeFileSync(
        path.join(extensionPath, "SampleHandler.mm"),
        implementation
      );

      const infoPlist = {
        CFBundleDevelopmentRegion: "$(DEVELOPMENT_LANGUAGE)",
        CFBundleDisplayName: "Zoom Screen Share",
        CFBundleExecutable: "$(EXECUTABLE_NAME)",
        CFBundleIdentifier: "$(PRODUCT_BUNDLE_IDENTIFIER)",
        CFBundleInfoDictionaryVersion: "6.0",
        CFBundleName: "$(PRODUCT_NAME)",
        CFBundlePackageType: "$(PRODUCT_BUNDLE_PACKAGE_TYPE)",
        CFBundleShortVersionString: "$(MARKETING_VERSION)",
        CFBundleVersion: "$(CURRENT_PROJECT_VERSION)",
        NSExtension: {
          NSExtensionPointIdentifier: "com.apple.broadcast-services-upload",
          NSExtensionPrincipalClass: "SampleHandler",
          RPBroadcastProcessMode: "RPBroadcastProcessModeSampleBuffer",
        },
      };
      fs.writeFileSync(
        path.join(extensionPath, "Info.plist"),
        buildPlist(infoPlist)
      );

      const entitlements = {
        "com.apple.security.application-groups": [appGroupId],
      };
      fs.writeFileSync(
        path.join(extensionPath, `${EXTENSION_NAME}.entitlements`),
        buildPlist(entitlements)
      );

      return config;
    },
  ]);
}

const SCREENSHARE_PODFILE_START = "    # [with-zoom-screenshare]";
const SCREENSHARE_PODFILE_END = "    # [with-zoom-screenshare-end]";

function getScreenSharePodfileSnippet() {
  return `
    # [with-zoom-screenshare] Link MobileRTCScreenShare into the ReplayKit extension.
    screenshare_xcframework = Dir.glob(File.join(installer.sandbox.root, '**', 'MobileRTCScreenShare.xcframework')).first
    installer.aggregate_targets.map(&:user_project).uniq(&:path).each do |project|
      extension_target = project.native_targets.find { |t| t.name == '${EXTENSION_NAME}' }
      next unless extension_target

      extension_target.build_configurations.each do |ext_config|
        ext_config.build_settings['ENABLE_BITCODE'] = 'NO'
        if screenshare_xcframework
          ext_config.build_settings['FRAMEWORK_SEARCH_PATHS'] = ['$(inherited)']
          ext_config.build_settings['FRAMEWORK_SEARCH_PATHS[sdk=iphoneos*]'] = [
            '$(inherited)',
            File.join(screenshare_xcframework, 'ios-arm64'),
          ]
          ext_config.build_settings['FRAMEWORK_SEARCH_PATHS[sdk=iphonesimulator*]'] = [
            '$(inherited)',
            File.join(screenshare_xcframework, 'ios-arm64-simulator'),
          ]

          ext_config.build_settings['HEADER_SEARCH_PATHS'] = [
            '$(inherited)',
            File.join(screenshare_xcframework, 'ios-arm64', 'MobileRTCScreenShare.framework', 'Headers'),
            File.join(screenshare_xcframework, 'ios-arm64-simulator', 'MobileRTCScreenShare.framework', 'Headers'),
          ]

          flags = ['$(inherited)', '-lc++']
          %w[ReplayKit CoreGraphics CoreMedia CoreVideo VideoToolbox MobileRTCScreenShare].each do |framework|
            flags << '-framework' << framework
          end
          ext_config.build_settings['OTHER_LDFLAGS'] = flags
        end
      end
      project.save
    end

    # CocoaPods copies every Zoom xcframework into the same destination with
    # rsync --delete, so later slices wipe MobileRTC.framework and the copy
    # script fails Xcode's output-file-list check.
    xcframeworks_script = File.join(installer.sandbox.root, 'Target Support Files/ZoomMeetingSDK/ZoomMeetingSDK-xcframeworks.sh')
    if File.exist?(xcframeworks_script)
      script = File.read(xcframeworks_script)
      patched = script.gsub('rsync --delete -av', 'rsync -av')
      patched = patched.gsub(
        "if [ ! -d \"$destination\" ]; then\n    mkdir -p \"$destination\"\n  fi",
        "if [ -e \"$destination\" ] && [ ! -d \"$destination\" ]; then\n    rm -f \"$destination\"\n  fi\n  mkdir -p \"$destination\""
      )
      File.write(xcframeworks_script, patched) if patched != script
    end
    # [with-zoom-screenshare-end]
`;
}

function replaceScreenSharePodfileBlock(podfile, snippet) {
  const start = podfile.indexOf(SCREENSHARE_PODFILE_START);
  if (start === -1) {
    return null;
  }

  const endMarkerIndex = podfile.indexOf(SCREENSHARE_PODFILE_END, start);
  if (endMarkerIndex !== -1) {
    const end = endMarkerIndex + SCREENSHARE_PODFILE_END.length;
    return podfile.slice(0, start) + snippet.trimStart() + podfile.slice(end);
  }

  const projectSave = podfile.indexOf("project.save", start);
  if (projectSave === -1) {
    return null;
  }
  const afterSave = podfile.indexOf("\n", projectSave);
  const restStart = afterSave === -1 ? podfile.length : afterSave + 1;
  const danglingEnd = podfile.slice(restStart).match(/^[ \t]*end[ \t]*\n?/);
  const end = restStart + (danglingEnd ? danglingEnd[0].length : 0);
  return podfile.slice(0, start) + snippet.trimStart() + podfile.slice(end);
}

function withScreenSharePodfile(config) {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const podfilePath = path.join(
        config.modRequest.platformProjectRoot,
        "Podfile"
      );
      if (!fs.existsSync(podfilePath)) {
        return config;
      }

      let podfile = fs.readFileSync(podfilePath, "utf8");
      const snippet = getScreenSharePodfileSnippet();
      const replaced = replaceScreenSharePodfileBlock(podfile, snippet);
      if (replaced != null) {
        fs.writeFileSync(podfilePath, replaced);
        return config;
      }

      const lines = podfile.split("\n");
      let postInstallDepth = 0;
      let insertIndex = -1;

      for (let i = 0; i < lines.length; i++) {
        const trimmed = lines[i].trim();
        if (trimmed.match(/^post_install\s+do/)) {
          postInstallDepth = 1;
          continue;
        }
        if (postInstallDepth > 0) {
          if (trimmed.match(/\bdo\b(\s+\|.*\|)?\s*$/)) {
            postInstallDepth += 1;
          }
          if (trimmed === "end") {
            postInstallDepth -= 1;
            if (postInstallDepth === 0) {
              insertIndex = i;
              break;
            }
          }
        }
      }

      if (insertIndex === -1) {
        podfile += `\npost_install do |installer|${snippet}end\n`;
      } else {
        lines.splice(insertIndex, 0, snippet);
        podfile = lines.join("\n");
      }

      fs.writeFileSync(podfilePath, podfile);
      return config;
    },
  ]);
}

function withScreenShareAndroid(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    manifest.manifest["uses-permission"] =
      manifest.manifest["uses-permission"] || [];
    const existing = manifest.manifest["uses-permission"];
    const hasPermission = (name) =>
      existing.some((item) => item.$["android:name"] === name);

    for (const name of ANDROID_SCREEN_SHARE_PERMISSIONS) {
      if (!hasPermission(name)) {
        existing.push({ $: { "android:name": name } });
      }
    }

    manifest.manifest.$["xmlns:tools"] =
      manifest.manifest.$["xmlns:tools"] ||
      "http://schemas.android.com/tools";

    const application =
      AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);
    application.service = application.service || [];
    application.service = application.service.filter(
      (item) => item.$?.["android:name"] !== SCREEN_SHARE_SERVICE
    );
    application.service.push({
      $: {
        "android:name": SCREEN_SHARE_SERVICE,
        "android:exported": "false",
        "android:foregroundServiceType": SCREEN_SHARE_SERVICE_TYPES,
        "tools:replace": "android:foregroundServiceType",
        "android:label": "Zoom",
      },
    });

    return config;
  });
}

function withZoomScreenShare(config) {
  const bundleId = getBundleId(config);
  const appGroupId = getAppGroupId(bundleId);
  const extensionBundleId = getExtensionBundleId(bundleId);

  config = declareEasAppExtension(config, { appGroupId, extensionBundleId });
  config = withMainAppEntitlements(config, appGroupId);
  config = withScreenShareXcodeProject(config, { extensionBundleId });
  config = withScreenShareExtensionFiles(config, {
    appGroupId,
    extensionBundleId,
  });
  config = withScreenSharePodfile(config);
  config = withScreenShareAndroid(config);
  return config;
}

module.exports = withZoomScreenShare;
module.exports.EXTENSION_NAME = EXTENSION_NAME;
module.exports.getAppGroupId = getAppGroupId;
module.exports.getExtensionBundleId = getExtensionBundleId;
