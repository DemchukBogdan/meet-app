import {
  MEET_APP_LOGIN_ERROR_MESSAGES,
  GENERIC_LOGIN_ERROR,
} from './constants';

export class MeetAppLoginError extends Error {
  readonly codes: string[];
  readonly retryAfterSeconds: number;

  constructor(codes: string[], retryAfterSeconds = 0) {
    super(getMeetAppLoginErrorMessage(codes));
    this.name = 'MeetAppLoginError';
    this.codes = codes;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export function getMeetAppLoginErrorMessage(codes: string[]): string {
  const firstCode = codes[0];
  if (!firstCode) {
    return GENERIC_LOGIN_ERROR;
  }

  return MEET_APP_LOGIN_ERROR_MESSAGES[firstCode] ?? GENERIC_LOGIN_ERROR;
}
