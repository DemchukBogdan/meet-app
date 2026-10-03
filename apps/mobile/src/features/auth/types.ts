export type MeetAppRoleType = 'client' | 'tutor' | 'admin';

export type MeetAppAuthStateType = {
  client: boolean;
  tutor: boolean;
  admin: boolean;
  currentRole: MeetAppRoleType;
};

export type MeetAppLoginParamsType = {
  phonePlain: string;
  password: string;
  phoneDefaultCountryCode: boolean;
};

export type MeetAppAuthCodeParamsType = {
  phonePlain: string;
  phoneDefaultCountryCode: boolean;
};

export type MeetAppAuthCodeResultType = {
  clientId: number;
};

export type MeetAppLoginByCodeParamsType = {
  clientId: number;
  authCode: string;
};

export type MeetAppClientSessionType = {
  clientId: number;
};

export type MeetAppLoginResultType = {
  auth: MeetAppAuthStateType;
  data: MeetAppClientSessionType;
};

export type LoginScreenPropsType = {
  onSuccess: VoidFunction;
};

export type RecoveryModeType = 'sms' | 'email';

export type OutlineButtonPropsType = {
  title: string;
  onPress: VoidFunction;
};
