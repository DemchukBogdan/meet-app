// react
import { useCallback, useState } from 'react';

// react-native
import { Alert, Linking } from 'react-native';

// api
import {
  areMediaPermissionsGranted,
  getMediaPermissionsStatus,
  requestMediaPermissions,
} from '@/features/permissions/api/mediaPermissions';

// hooks
import { useZoomAuth } from '@/features/zoom/hooks/useZoomAuth';
import { useZoomService } from '@/features/zoom/hooks/useZoomService';

// constants
import {
  INVALID_LINK_MESSAGE,
  INVALID_LINK_TITLE,
  JOIN_FAILED_TITLE,
  JWT_MISSING_MESSAGE,
  JWT_MISSING_TITLE,
  PERMISSIONS_MESSAGE,
  PERMISSIONS_TITLE,
  SDK_NOT_READY_MESSAGE,
  SDK_NOT_READY_TITLE,
} from '../constants';

// utils
import { parseZoomJoinLink, toZoomAppLink } from '../utils/formatCalendar';

type UseJoinCalendarLessonParamsType = {
  studentName: string;
  canUseZoomSdk: boolean;
};

export function useJoinCalendarLesson({
  studentName,
  canUseZoomSdk,
}: UseJoinCalendarLessonParamsType) {
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

  const handleJoinLesson = useCallback(
    async (lessonLink: string) => {
      const target = parseZoomJoinLink(lessonLink);
      if (!target) {
        Alert.alert(INVALID_LINK_TITLE, INVALID_LINK_MESSAGE);
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
          userName: studentName,
          meetingNumber: target.meetingNumber,
          password: target.password,
        });
      } catch (error) {
        Alert.alert(JOIN_FAILED_TITLE, String(error));
      } finally {
        setIsJoining(false);
      }
    },
    [
      authError,
      canUseZoomSdk,
      ensureMediaPermissions,
      isSdkReady,
      studentName,
      zoomService,
    ],
  );

  const handleOpenZoomApp = useCallback(async (lessonLink: string) => {
    const appLink = toZoomAppLink(lessonLink);
    const canOpen = await Linking.canOpenURL(appLink);
    await Linking.openURL(canOpen ? appLink : lessonLink);
  }, []);

  return {
    isJoining,
    isSdkReady,
    handleJoinLesson,
    handleOpenZoomApp,
  };
}
