import { useCallback, useEffect, useMemo, useState } from 'react';

// react-native
import { Alert, Share } from 'react-native';

// config
import { getZoomCreateConfigLog, getZoomExtra } from '../config/zoomConfig';

// constants
import { DEFAULT_MEETING_TOPIC } from '../constants';

// errors
import {
  CREATE_MEETING_NOT_CONFIGURED_MESSAGE,
  ZoomCreateNotConfiguredError,
} from '../errors';

// hooks
import { useZoomAuth } from './useZoomAuth';
import { useZoomService } from './useZoomService';

// types
import type { CreatedZoomMeetingType } from '../types';

export function useZoomMeeting() {
  const zoomService = useZoomService();
  const { authStatus, authError, isSdkReady } = useZoomAuth(zoomService);
  const credentials = zoomService.getCredentials();

  const [meetingNumber, setMeetingNumber] = useState('');
  const [password, setPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [topic, setTopic] = useState(DEFAULT_MEETING_TOPIC);
  const [createdMeeting, setCreatedMeeting] =
    useState<CreatedZoomMeetingType | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Show which create-meeting credentials reached the JS bundle (values omitted).
  useEffect(() => {
    console.log('[Zoom create config]', getZoomCreateConfigLog(getZoomExtra()));
  }, []);

  const showSdkNotReadyAlert = useCallback(() => {
    Alert.alert(
      'Zoom SDK is not ready',
      authError
        ? `Authorization failed: ${authError}`
        : 'Wait until the SDK finishes initializing (onAuthReturn).',
    );
  }, [authError]);

  const handleJoin = useCallback(async () => {
    if (!isSdkReady) {
      showSdkNotReadyAlert();
      return;
    }

    try {
      await zoomService.joinMeeting({
        userName,
        meetingNumber,
        password,
      });
    } catch (error) {
      Alert.alert('Failed to join meeting', String(error));
    }
  }, [
    zoomService,
    userName,
    meetingNumber,
    password,
    isSdkReady,
    showSdkNotReadyAlert,
  ]);

  const handleCreateAndStart = useCallback(async () => {
    if (!credentials.canCreateMeeting) {
      Alert.alert(
        'Create meeting is not configured',
        CREATE_MEETING_NOT_CONFIGURED_MESSAGE,
      );
      return;
    }

    if (!isSdkReady) {
      showSdkNotReadyAlert();
      return;
    }

    setIsCreating(true);
    try {
      const meeting = await zoomService.createAndStartMeeting({
        userName,
        topic,
      });
      setCreatedMeeting(meeting);
      setMeetingNumber(meeting.meetingNumber);
      setPassword(meeting.password);
    } catch (error) {
      if (error instanceof ZoomCreateNotConfiguredError) {
        Alert.alert(
          'Create meeting is not configured',
          CREATE_MEETING_NOT_CONFIGURED_MESSAGE,
        );
        return;
      }

      Alert.alert(
        'Failed to create or start meeting',
        `${String(error)}\n\nIf the meeting ID appeared below, you can still join it. To start as host, add user:read:token:admin on the Server-to-Server OAuth app, then activate it again.`,
      );
    } finally {
      setIsCreating(false);
    }
  }, [
    credentials.canCreateMeeting,
    zoomService,
    isSdkReady,
    showSdkNotReadyAlert,
    topic,
    userName,
  ]);

  const handleShareCreatedMeeting = useCallback(async () => {
    if (!createdMeeting) {
      return;
    }

    const message = createdMeeting.joinUrl
      ? `Join "${createdMeeting.topic}": ${createdMeeting.joinUrl}`
      : `Join Zoom ${createdMeeting.meetingNumber} password ${createdMeeting.password}`;

    await Share.share({ message });
  }, [createdMeeting]);

  const statusLabel = useMemo(() => {
    if (authStatus === 'ready') {
      return credentials.canCreateMeeting
        ? 'SDK ready — join an existing meeting or create your own'
        : 'SDK ready — join only (create needs Server-to-Server OAuth in .env)';
    }
    if (authStatus === 'error') {
      return `Authorization failed: ${authError ?? 'unknown error'}`;
    }
    return 'Initializing Zoom SDK…';
  }, [authStatus, authError, credentials.canCreateMeeting]);

  const createButtonTitle = isCreating
    ? 'Creating meeting…'
    : 'Create and start meeting';
  const areActionsDisabled = !isSdkReady || isCreating;

  return {
    userName,
    setUserName,
    topic,
    setTopic,
    meetingNumber,
    setMeetingNumber,
    password,
    setPassword,
    createdMeeting,
    areActionsDisabled,
    statusLabel,
    createButtonTitle,
    handleJoin,
    handleCreateAndStart,
    handleShareCreatedMeeting,
  };
}
