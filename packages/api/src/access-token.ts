type AccessTokenReaderType = () => string | null;

let readAccessToken: AccessTokenReaderType = () => null;

export function registerAccessTokenReader(reader: AccessTokenReaderType): void {
  readAccessToken = reader;
}

export function getRegisteredAccessToken(): string | null {
  return readAccessToken();
}
