const fs = require('fs');
const path = require('path');
const appJson = require('./app.json');
const { createMeetingSdkJwt } = require('./scripts/generate-zoom-jwt');

function readEnv(name) {
  return process.env[name]?.trim() ?? '';
}

function writeZoomRuntimeConfig() {
  const runtimeConfig = {
    zoomAccountId: readEnv('ZOOM_ACCOUNT_ID'),
    zoomS2sClientId: readEnv('ZOOM_S2S_CLIENT_ID'),
    zoomS2sClientSecret: readEnv('ZOOM_S2S_CLIENT_SECRET'),
    zoomUserEmail: readEnv('ZOOM_USER_EMAIL'),
  };

  fs.writeFileSync(
    path.join(__dirname, 'zoom.runtime.json'),
    `${JSON.stringify(runtimeConfig, null, 2)}\n`
  );

  console.log('[zoom config]', {
    hasAccountId: Boolean(runtimeConfig.zoomAccountId),
    hasS2sClientId: Boolean(runtimeConfig.zoomS2sClientId),
    hasS2sClientSecret: Boolean(runtimeConfig.zoomS2sClientSecret),
    hasUserEmail: Boolean(runtimeConfig.zoomUserEmail),
  });
}

module.exports = () => {
  writeZoomRuntimeConfig();

  const expo = {
    ...appJson.expo,
    extra: {
      ...appJson.expo.extra,
      zoomAccountId: readEnv('ZOOM_ACCOUNT_ID'),
      zoomS2sClientId: readEnv('ZOOM_S2S_CLIENT_ID'),
      zoomS2sClientSecret: readEnv('ZOOM_S2S_CLIENT_SECRET'),
      zoomUserEmail: readEnv('ZOOM_USER_EMAIL'),
    },
  };

  try {
    expo.extra.zoomJwtToken = createMeetingSdkJwt();
  } catch (error) {
    console.warn(`[zoom jwt] ${error.message}`);
    expo.extra.zoomJwtToken = '';
  }

  return { expo };
};
