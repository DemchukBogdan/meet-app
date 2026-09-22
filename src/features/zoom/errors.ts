export const CREATE_MEETING_NOT_CONFIGURED_MESSAGE =
  'Meeting SDK JWT can only join. Add ZOOM_ACCOUNT_ID, ZOOM_USER_EMAIL, and Server-to-Server OAuth credentials (ZOOM_S2S_CLIENT_ID / ZOOM_S2S_CLIENT_SECRET) to .env, then restart Metro.';

export class ZoomCreateNotConfiguredError extends Error {
  constructor() {
    super(CREATE_MEETING_NOT_CONFIGURED_MESSAGE);
    this.name = 'ZoomCreateNotConfiguredError';
  }
}
