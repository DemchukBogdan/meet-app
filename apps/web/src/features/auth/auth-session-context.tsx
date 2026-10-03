import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  clearAuthSession,
  isAccessTokenExpired,
  readAuthSession,
  writeAuthSession,
} from './model/auth-session-storage';
import { mockAuthRepository } from './model/mock-auth-repository';

import type {
  AuthSessionContextValueType,
  AuthTokensType,
  LoginCredentialsType,
} from './types';

const AuthSessionContext = createContext<AuthSessionContextValueType | null>(
  null,
);

type AuthSessionProviderProps = {
  children: ReactNode;
};

type AuthSnapshot = {
  session: AuthTokensType | null;
  isReady: boolean;
  expiredSession: AuthTokensType | null;
};

function readAuthSnapshot(): AuthSnapshot {
  const stored = readAuthSession();
  if (!stored || !isAccessTokenExpired(stored)) {
    return {
      session: stored,
      isReady: true,
      expiredSession: null,
    };
  }

  return {
    session: null,
    isReady: false,
    expiredSession: stored,
  };
}

export function AuthSessionProvider({ children }: AuthSessionProviderProps) {
  const [authSnapshot] = useState(readAuthSnapshot);
  const [session, setSession] = useState(authSnapshot.session);
  const [isReady, setIsReady] = useState(authSnapshot.isReady);

  // Exchange an expired access token for a new one before protected screens load.
  useEffect(() => {
    const expiredSession = authSnapshot.expiredSession;
    if (!expiredSession) {
      return;
    }

    let isActive = true;
    void mockAuthRepository
      .refresh(expiredSession)
      .then((nextSession) => {
        if (!isActive) {
          return;
        }

        writeAuthSession(nextSession);
        setSession(nextSession);
      })
      .catch((error: unknown) => {
        console.error(error);
        if (!isActive) {
          return;
        }

        clearAuthSession();
        setSession(null);
      })
      .finally(() => {
        if (isActive) {
          setIsReady(true);
        }
      });

    return () => {
      isActive = false;
    };
  }, [authSnapshot.expiredSession]);

  const login = useCallback(async (credentials: LoginCredentialsType) => {
    const nextSession = await mockAuthRepository.login(credentials);
    writeAuthSession(nextSession);
    setSession(nextSession);
  }, []);

  const logout = useCallback(() => {
    clearAuthSession();
    setSession(null);
  }, []);

  const value = useMemo<AuthSessionContextValueType>(
    () => ({
      isReady,
      isAuthenticated: session !== null,
      login,
      logout,
    }),
    [isReady, login, logout, session],
  );

  return (
    <AuthSessionContext.Provider value={value}>
      {children}
    </AuthSessionContext.Provider>
  );
}

export function useAuthSession(): AuthSessionContextValueType {
  const value = useContext(AuthSessionContext);
  if (!value) {
    throw new Error('Auth session is not provided.');
  }

  return value;
}
