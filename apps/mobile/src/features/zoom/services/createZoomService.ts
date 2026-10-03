// api
import {
  createZoomInstantMeeting,
  getZoomAccessKey,
  getZoomS2SAccessToken,
} from '../api/zoomRestApi';

// config
import { getZoomExtra, hasZoomCreateCredentials } from '../config/zoomConfig';

// constants
import {
  DEFAULT_GUEST_NAME,
  DEFAULT_HOST_NAME,
  DEFAULT_MEETING_TOPIC,
} from '../constants';

// errors
import { ZoomCreateNotConfiguredError } from '../errors';

// types
import type {
  CreateAndStartMeetingParamsType,
  CreatedZoomMeetingType,
  JoinMeetingParamsType,
  ZoomCredentialsType,
  ZoomSdkClientType,
  ZoomServiceType,
} from '../types';

function getCredentials(): ZoomCredentialsType {
  const extra = getZoomExtra();

  return {
    jwtToken: extra.zoomJwtToken ?? '',
    accountId: extra.zoomAccountId ?? '',
    s2sClientId: extra.zoomS2sClientId ?? '',
    s2sClientSecret: extra.zoomS2sClientSecret ?? '',
    userEmail: extra.zoomUserEmail ?? '',
    canCreateMeeting: hasZoomCreateCredentials(extra),
  };
}

export function createZoomService(sdk: ZoomSdkClientType): ZoomServiceType {
  return {
    getCredentials,

    isInitialized: () => sdk.isInitialized(),

    async joinMeeting(params: JoinMeetingParamsType) {
      await sdk.joinMeeting({
        userName: params.userName || DEFAULT_GUEST_NAME,
        meetingNumber: params.meetingNumber,
        password: params.password,
      });
    },

    async createAndStartMeeting(
      params: CreateAndStartMeetingParamsType,
    ): Promise<CreatedZoomMeetingType> {
      const credentials = getCredentials();
      if (!credentials.canCreateMeeting) {
        throw new ZoomCreateNotConfiguredError();
      }

      const accessToken = await getZoomS2SAccessToken({
        accountId: credentials.accountId,
        clientId: credentials.s2sClientId,
        clientSecret: credentials.s2sClientSecret,
      });

      const meeting = await createZoomInstantMeeting({
        accessToken,
        userEmail: credentials.userEmail,
        topic: params.topic.trim() || DEFAULT_MEETING_TOPIC,
      });
      console.log('[Zoom meeting]', {
        topic: meeting.topic,
        meetingNumber: meeting.meetingNumber,
        password: meeting.password,
        joinUrl: meeting.joinUrl,
      });

      const zoomAccessToken =
        meeting.hostAccessToken ||
        (await getZoomAccessKey({
          accessToken,
          userEmail: credentials.userEmail,
        }));

      await sdk.startMeeting({
        userName: params.userName || DEFAULT_HOST_NAME,
        meetingNumber: meeting.meetingNumber,
        zoomAccessToken,
      });

      return meeting;
    },
  };
}
