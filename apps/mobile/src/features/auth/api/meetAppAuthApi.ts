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

export async function loginMeetAppClient(
  _params: MeetAppLoginParamsType,
): Promise<MeetAppLoginResultType> {
  return {
    auth: MOCK_AUTH,
    data: { clientId: MOCK_CLIENT_ID },
  };
}

export async function requestMeetAppAuthCode(
  _params: MeetAppAuthCodeParamsType,
): Promise<MeetAppAuthCodeResultType> {
  return { clientId: MOCK_CLIENT_ID };
}

export async function loginMeetAppClientByCode(
  params: MeetAppLoginByCodeParamsType,
): Promise<MeetAppLoginResultType> {
  return {
    auth: MOCK_AUTH,
    data: { clientId: params.clientId },
  };
}

export async function logoutMeetAppClient(): Promise<void> {
  return undefined;
}
