import { MeetingsMockServer } from './meetings-mock-server';

let isInstalled = false;

export function installMeetingsFetchMock(
  server: MeetingsMockServer = new MeetingsMockServer(),
): MeetingsMockServer {
  if (isInstalled) {
    return server;
  }

  const originalFetch = globalThis.fetch.bind(globalThis);
  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const request = input instanceof Request ? input : new Request(input, init);
    const url = new URL(request.url);
    if (
      url.hostname === 'localhost' &&
      url.pathname.startsWith('/api/meetings')
    ) {
      return server.handle(request);
    }

    return originalFetch(input, init);
  };
  isInstalled = true;
  return server;
}
