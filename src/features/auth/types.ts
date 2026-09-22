export type MeetAppAuthStateType = {
  client: boolean;
  tutor: boolean;
  admin: boolean;
  currentRole: string;
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

export type MeetAppLoginResultType = {
  auth: MeetAppAuthStateType;
  data: unknown;
};

export type LoginScreenPropsType = {
  onSuccess: VoidFunction;
};

export type RecoveryModeType = 'sms' | 'email';

export type OutlineButtonPropsType = {
  title: string;
  onPress: VoidFunction;
};
