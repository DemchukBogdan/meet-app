import type { JoinFailureKindType } from '@meet/meetings';

import { MediaPermissionDeniedError } from './media-permission-denied-error';

export function resolveMobileJoinFailure(error: unknown): JoinFailureKindType {
  if (error instanceof MediaPermissionDeniedError) {
    return 'permissionDenied';
  }

  return 'failed';
}
