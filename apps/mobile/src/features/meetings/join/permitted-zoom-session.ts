import {
  areMediaPermissionsGranted,
  getMediaPermissionsStatus,
  requestMediaPermissions,
} from '@/features/permissions/api/mediaPermissions';

import { MediaPermissionDeniedError } from './media-permission-denied-error';

import type { ZoomJoinRequest, ZoomSession } from '@meet/join';

export class PermittedZoomSession implements ZoomSession {
  constructor(private readonly session: ZoomSession) {}

  async start(request: ZoomJoinRequest): Promise<void> {
    const current = await getMediaPermissionsStatus();
    const granted = areMediaPermissionsGranted(current)
      ? current
      : await requestMediaPermissions();

    if (!areMediaPermissionsGranted(granted)) {
      throw new MediaPermissionDeniedError();
    }

    await this.session.start(request);
  }
}
