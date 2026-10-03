import { RtkJoinGateway, useMeetDispatch } from '@meet/api';
import { LinkJoin } from '@meet/join';
import { createContext, useContext, useMemo, type ReactNode } from 'react';

import { BrowserUrlOpener } from './browser-url-opener';

import type { JoinService } from '@meet/join';

const JoinServiceContext = createContext<JoinService | null>(null);

type JoinServiceProviderProps = {
  children: ReactNode;
};

export function JoinServiceProvider({ children }: JoinServiceProviderProps) {
  const dispatch = useMeetDispatch();
  const service = useMemo(
    () => new LinkJoin(new RtkJoinGateway(dispatch), new BrowserUrlOpener()),
    [dispatch],
  );

  return (
    <JoinServiceContext.Provider value={service}>
      {children}
    </JoinServiceContext.Provider>
  );
}

export function useJoinService(): JoinService {
  const service = useContext(JoinServiceContext);
  if (!service) {
    throw new Error('JoinService is not provided.');
  }

  return service;
}
