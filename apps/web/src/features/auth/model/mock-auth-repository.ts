import { createAuthTokens, refreshAuthTokens } from './auth-session-storage';

import type { AuthTokensType, LoginCredentialsType } from '../types';

export class AuthCredentialsError extends Error {
  constructor() {
    super('Invalid login credentials');
    this.name = 'AuthCredentialsError';
  }
}

export class AuthRefreshError extends Error {
  constructor() {
    super('Refresh token is invalid');
    this.name = 'AuthRefreshError';
  }
}

export type MockAuthRepositoryType = {
  login: (credentials: LoginCredentialsType) => Promise<AuthTokensType>;
  refresh: (session: AuthTokensType) => Promise<AuthTokensType>;
};

function hasLoginCredentials(credentials: LoginCredentialsType): boolean {
  return credentials.phone.trim().length > 0 && credentials.password.length > 0;
}

function hasRefreshToken(session: AuthTokensType): boolean {
  return session.refreshToken.startsWith('mock-refresh-');
}

export const mockAuthRepository: MockAuthRepositoryType = {
  login(credentials) {
    if (!hasLoginCredentials(credentials)) {
      return Promise.reject(new AuthCredentialsError());
    }

    return Promise.resolve(createAuthTokens());
  },
  refresh(session) {
    if (!hasRefreshToken(session)) {
      return Promise.reject(new AuthRefreshError());
    }

    return Promise.resolve(refreshAuthTokens(session));
  },
};
