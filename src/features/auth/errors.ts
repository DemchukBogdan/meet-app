import { BUKI_LOGIN_ERROR_MESSAGES, GENERIC_LOGIN_ERROR } from './constants';

export class BukiLoginError extends Error {
  readonly codes: string[];
  readonly retryAfterSeconds: number;

  constructor(codes: string[], retryAfterSeconds = 0) {
    super(getBukiLoginErrorMessage(codes));
    this.name = 'BukiLoginError';
    this.codes = codes;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export function getBukiLoginErrorMessage(codes: string[]): string {
  const firstCode = codes[0];
  if (!firstCode) {
    return GENERIC_LOGIN_ERROR;
  }

  return BUKI_LOGIN_ERROR_MESSAGES[firstCode] ?? GENERIC_LOGIN_ERROR;
}
