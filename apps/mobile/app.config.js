const appJson = require('./app.json');

// Meeting SDK signatures come from GET /api/meetings/:id/join at runtime.
// The client must not mint Zoom JWTs or embed the SDK secret.
module.exports = () => ({
  expo: {
    ...appJson.expo,
    extra: {
      ...appJson.expo.extra,
    },
  },
});
