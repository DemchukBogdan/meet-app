// react
import { useCallback, useState } from 'react';

// react-native
import { Alert } from 'react-native';

// api
import {
  areMediaPermissionsGranted,
  getMediaPermissionsStatus,
  requestMediaPermissions,
} from '@/features/permissions/api/mediaPermissions';

// constants
import {
  JOIN_AS_CLIENT_INVALID,
  JOIN_FAILED_TITLE,
  JWT_MISSING_MESSAGE,
  JWT_MISSING_TITLE,
  PERMISSIONS_MESSAGE,
  PERMISSIONS_TITLE,
  SDK_NOT_READY_MESSAGE,
  SDK_NOT_READY_TITLE,
} from '../constants';

// hooks
import { useZoomAuth } from './useZoomAuth';
import { useZoomService } from './useZoomService';

// utils
import { parseZoomJoinTarget } from '../utils/parseZoomJoinTarget';

// types
import type { JoinMeetingParamsType } from '../types';

type UseJoinZoomAsClientParamsType = {
  canUseZoomSdk: boolean;
};

export function useJoinZoomAsClient({
  canUseZoomSdk,
}: UseJoinZoomAsClientParamsType) {
  const zoomService = useZoomService();
  const { isSdkReady, authError } = useZoomAuth(zoomService);
  const [isJoining, setIsJoining] = useState(false);

  const ensureMediaPermissions = useCallback(async (): Promise<boolean> => {
    const current = await getMediaPermissionsStatus();
    if (areMediaPermissionsGranted(current)) {
      return true;
    }

    const requested = await requestMediaPermissions();
    if (areMediaPermissionsGranted(requested)) {
      return true;
    }

    Alert.alert(PERMISSIONS_TITLE, PERMISSIONS_MESSAGE);
    return false;
  }, []);

  const joinAsClient = useCallback(
    async (params: JoinMeetingParamsType) => {
      const target = parseZoomJoinTarget(
        params.meetingNumber,
        params.password.trim(),
      );
      if (!target) {
        Alert.alert(JOIN_FAILED_TITLE, JOIN_AS_CLIENT_INVALID);
        return;
      }

      if (!canUseZoomSdk) {
        Alert.alert(JWT_MISSING_TITLE, JWT_MISSING_MESSAGE);
        return;
      }

      if (!isSdkReady) {
        Alert.alert(
          SDK_NOT_READY_TITLE,
          authError
            ? `Authorization failed: ${authError}`
            : SDK_NOT_READY_MESSAGE,
        );
        return;
      }

      const hasPermissions = await ensureMediaPermissions();
      if (!hasPermissions) {
        return;
      }

      setIsJoining(true);
      try {
        await zoomService.joinMeeting({
          userName: params.userName,
          meetingNumber: target.meetingNumber,
          password: target.password,
        });
      } catch (error) {
        Alert.alert(JOIN_FAILED_TITLE, String(error));
      } finally {
        setIsJoining(false);
      }
    },
    [authError, canUseZoomSdk, ensureMediaPermissions, isSdkReady, zoomService],
  );

  return {
    isJoining,
    isSdkReady,
    joinAsClient,
  };
}
