export type AuthTokensType = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
};

export type LoginCredentialsType = {
  phone: string;
  password: string;
};

export type AuthSessionContextValueType = {
  isReady: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentialsType) => Promise<void>;
  logout: () => void;
};
