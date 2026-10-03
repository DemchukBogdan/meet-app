/**
 * Cursor / Android Studio Gradle daemons often start with a PATH that does not
 * include nvm or Homebrew, so `commandLine("node")` fails with
 * "Cannot run program node". Resolve an absolute node binary instead.
 */
const {
  withSettingsGradle,
  withAppBuildGradle,
  createRunOncePlugin,
} = require('@expo/config-plugins');

const NODE_RESOLVER = `def nodeBinary = {
  def fromEnv = System.getenv("NODE_BINARY")
  if (fromEnv && new File(fromEnv).canExecute()) {
    return fromEnv
  }
  def home = System.getProperty("user.home")
  def candidates = []
  def nvmDefault = new File(home, ".nvm/alias/default")
  if (nvmDefault.exists()) {
    candidates.add(new File(home, ".nvm/versions/node/" + nvmDefault.text.trim() + "/bin/node").absolutePath)
  }
  def nvmVersions = new File(home, ".nvm/versions/node")
  if (nvmVersions.exists()) {
    nvmVersions.listFiles()?.each { dir ->
      candidates.add(new File(dir, "bin/node").absolutePath)
    }
  }
  candidates.addAll(["/usr/local/bin/node", "/opt/homebrew/bin/node", "/usr/bin/node"])
  return candidates.find { new File(it).canExecute() } ?: "node"
}()
`;

function withGradleNodeSettings(config) {
  return withSettingsGradle(config, (config) => {
    let contents = config.modResults.contents;
    if (!contents.includes('def nodeBinary')) {
      contents = contents.replace(
        /pluginManagement \{/,
        `pluginManagement {\n${NODE_RESOLVER}`,
      );
    }
    contents = contents.replace(
      /commandLine\("node",/g,
      'commandLine(nodeBinary,',
    );
    config.modResults.contents = contents;
    return config;
  });
}

function withGradleNodeAppBuild(config) {
  return withAppBuildGradle(config, (config) => {
    let contents = config.modResults.contents;
    if (!contents.includes('def nodeBinary')) {
      contents = contents.replace(
        /def projectRoot = /,
        `${NODE_RESOLVER}\ndef projectRoot = `,
      );
    }
    contents = contents.replace(/\["node",/g, '[nodeBinary,');
    if (!contents.includes('nodeExecutableAndArgs = [nodeBinary]')) {
      contents = contents.replace(
        /react \{/,
        'react {\n    nodeExecutableAndArgs = [nodeBinary]',
      );
    }
    config.modResults.contents = contents;
    return config;
  });
}

const withGradleNodePath = (config) => {
  config = withGradleNodeSettings(config);
  config = withGradleNodeAppBuild(config);
  return config;
};

module.exports = createRunOncePlugin(
  withGradleNodePath,
  'with-gradle-node-path',
  '1.0.0',
);
