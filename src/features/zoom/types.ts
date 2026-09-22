export type ZoomAuthStatusType = 'pending' | 'ready' | 'error';

export type ZoomJoinTargetType = {
  meetingNumber: string;
  password: string;
};

export type JoinMeetingParamsType = {
  userName: string;
  meetingNumber: string;
  password: string;
};

export type CreateAndStartMeetingParamsType = {
  userName: string;
  topic: string;
};

export type CreatedZoomMeetingType = {
  meetingNumber: string;
  password: string;
  joinUrl: string;
  topic: string;
  hostAccessToken: string;
};

export type ZoomCredentialsType = {
  jwtToken: string;
  accountId: string;
  s2sClientId: string;
  s2sClientSecret: string;
  userEmail: string;
  canCreateMeeting: boolean;
};

export type ZoomSdkClientType = {
  isInitialized: () => Promise<boolean>;
  joinMeeting: (params: {
    userName: string;
    meetingNumber: string;
    password?: string;
  }) => Promise<unknown>;
  startMeeting: (params: {
    userName: string;
    meetingNumber: string;
    zoomAccessToken: string;
  }) => Promise<unknown>;
};

export type ZoomServiceType = {
  getCredentials: () => ZoomCredentialsType;
  isInitialized: () => Promise<boolean>;
  joinMeeting: (params: JoinMeetingParamsType) => Promise<void>;
  createAndStartMeeting: (
    params: CreateAndStartMeetingParamsType
  ) => Promise<CreatedZoomMeetingType>;
};
