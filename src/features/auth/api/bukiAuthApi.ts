// types
import type {
  BukiAuthCodeParamsType,
  BukiAuthCodeResultType,
  BukiAuthStateType,
  BukiLoginByCodeParamsType,
  BukiLoginParamsType,
  BukiLoginResultType,
} from '../types';

const MOCK_CLIENT_ID = 1;

const MOCK_AUTH: BukiAuthStateType = {
  client: true,
  tutor: false,
  admin: false,
  currentRole: 'client',
};

export async function loginBukiClient(
  _params: BukiLoginParamsType
): Promise<BukiLoginResultType> {
  return {
    auth: MOCK_AUTH,
    data: { clientId: MOCK_CLIENT_ID },
  };
}

export async function requestBukiAuthCode(
  _params: BukiAuthCodeParamsType
): Promise<BukiAuthCodeResultType> {
  return { clientId: MOCK_CLIENT_ID };
}

export async function loginBukiClientByCode(
  params: BukiLoginByCodeParamsType
): Promise<BukiLoginResultType> {
  return {
    auth: MOCK_AUTH,
    data: { clientId: params.clientId },
  };
}

export async function logoutBukiClient(): Promise<void> {
  return undefined;
}
