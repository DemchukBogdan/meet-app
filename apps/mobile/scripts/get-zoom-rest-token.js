/**
 * Server-to-Server OAuth access token for Zoom REST (create meeting + ZAK).
 * Meeting SDK JWT cannot call api.zoom.us.
 * CLI stdout is the token only so app.config.js can read it synchronously.
 */
async function getZoomRestAccessToken() {
  const accountId = process.env.ZOOM_ACCOUNT_ID?.trim();
  const clientId = (
    process.env.ZOOM_S2S_CLIENT_ID ?? process.env.ZOOM_CLIENT_ID
  )?.trim();
  const clientSecret = (
    process.env.ZOOM_S2S_CLIENT_SECRET ?? process.env.ZOOM_CLIENT_SECRET
  )?.trim();

  if (!accountId || !clientId || !clientSecret) {
    console.warn(
      '[zoom rest] missing ZOOM_ACCOUNT_ID or S2S client credentials; create meeting disabled',
    );
    return '';
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const body = new URLSearchParams({
    grant_type: 'account_credentials',
    account_id: accountId,
  });

  const response = await fetch('https://zoom.us/oauth/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!response.ok) {
    console.warn(
      `[zoom rest] S2S token failed (${response.status}). Create meeting needs Server-to-Server OAuth: ZOOM_ACCOUNT_ID, ZOOM_S2S_CLIENT_ID, ZOOM_S2S_CLIENT_SECRET, ZOOM_USER_EMAIL, plus scopes meeting:write:meeting:admin and user:read:token:admin.`,
    );
    return '';
  }

  const payload = await response.json();
  return typeof payload.access_token === 'string' ? payload.access_token : '';
}

module.exports = { getZoomRestAccessToken };

if (require.main === module) {
  getZoomRestAccessToken()
    .then((token) => {
      process.stdout.write(token);
    })
    .catch((error) => {
      console.warn(`[zoom rest] ${error.message}`);
      process.exit(1);
    });
}
