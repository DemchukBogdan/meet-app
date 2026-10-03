import type { AuthTokensType } from '../types';

export const AUTH_SESSION_STORAGE_KEY = 'meet.auth.session';

const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isAuthTokens(value: unknown): value is AuthTokensType {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.accessToken === 'string' &&
    value.accessToken.length > 0 &&
    typeof value.refreshToken === 'string' &&
    value.refreshToken.length > 0 &&
    typeof value.accessTokenExpiresAt === 'string'
  );
}

export function createAuthTokens(now = Date.now()): AuthTokensType {
  return {
    accessToken: `mock-access-${crypto.randomUUID()}`,
    refreshToken: `mock-refresh-${crypto.randomUUID()}`,
    accessTokenExpiresAt: new Date(now + ACCESS_TOKEN_TTL_MS).toISOString(),
  };
}

export function refreshAuthTokens(
  session: AuthTokensType,
  now = Date.now(),
): AuthTokensType {
  return {
    accessToken: `mock-access-${crypto.randomUUID()}`,
    refreshToken: session.refreshToken,
    accessTokenExpiresAt: new Date(now + ACCESS_TOKEN_TTL_MS).toISOString(),
  };
}

export function isAccessTokenExpired(
  session: AuthTokensType,
  now = Date.now(),
): boolean {
  const expiresAt = Date.parse(session.accessTokenExpiresAt);
  return Number.isNaN(expiresAt) || expiresAt <= now;
}

export function readAuthSession(): AuthTokensType | null {
  try {
    const raw = localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
    if (raw === null) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);
    return isAuthTokens(parsed) ? parsed : null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export function writeAuthSession(session: AuthTokensType): void {
  localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearAuthSession(): void {
  localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
}
