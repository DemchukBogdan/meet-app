// types
import type {
  MeetAppAuthCodeParamsType,
  MeetAppAuthCodeResultType,
  MeetAppAuthStateType,
  MeetAppLoginByCodeParamsType,
  MeetAppLoginParamsType,
  MeetAppLoginResultType,
} from '../types';

const MOCK_CLIENT_ID = 1;

const MOCK_AUTH: MeetAppAuthStateType = {
  client: true,
  tutor: false,
  admin: false,
  currentRole: 'client',
};

export type MeetAppAuthRepositoryType = {
  login: (params: MeetAppLoginParamsType) => Promise<MeetAppLoginResultType>;
  requestCode: (
    params: MeetAppAuthCodeParamsType,
  ) => Promise<MeetAppAuthCodeResultType>;
  loginByCode: (
    params: MeetAppLoginByCodeParamsType,
  ) => Promise<MeetAppLoginResultType>;
  logout: () => Promise<void>;
};

export const meetAppAuthRepository: MeetAppAuthRepositoryType = {
  login() {
    return Promise.resolve({
      auth: MOCK_AUTH,
      data: { clientId: MOCK_CLIENT_ID },
    });
  },
  requestCode() {
    return Promise.resolve({ clientId: MOCK_CLIENT_ID });
  },
  loginByCode(params) {
    return Promise.resolve({
      auth: MOCK_AUTH,
      data: { clientId: params.clientId },
    });
  },
  logout() {
    return Promise.resolve();
  },
};
