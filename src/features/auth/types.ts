export type BukiAuthStateType = {
  client: boolean;
  tutor: boolean;
  admin: boolean;
  currentRole: string;
};

export type BukiLoginParamsType = {
  phonePlain: string;
  password: string;
  phoneDefaultCountryCode: boolean;
};

export type BukiAuthCodeParamsType = {
  phonePlain: string;
  phoneDefaultCountryCode: boolean;
};

export type BukiAuthCodeResultType = {
  clientId: number;
};

export type BukiLoginByCodeParamsType = {
  clientId: number;
  authCode: string;
};

export type BukiLoginResultType = {
  auth: BukiAuthStateType;
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
