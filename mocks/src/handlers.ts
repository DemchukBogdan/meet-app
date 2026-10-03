import { http } from 'msw';

import type { MeetingsMockServer } from './meetings-mock-server';

const meetingsPath = 'http://localhost/api/meetings';

export function createMeetingHandlers(server: MeetingsMockServer) {
  return [
    http.get(meetingsPath, ({ request }) => server.handle(request)),
    http.post(meetingsPath, ({ request }) => server.handle(request)),
    http.get(`${meetingsPath}/:id`, ({ request }) => server.handle(request)),
    http.post(`${meetingsPath}/:id/rsvp`, ({ request }) =>
      server.handle(request),
    ),
    http.get(`${meetingsPath}/:id/join`, ({ request }) =>
      server.handle(request),
    ),
  ];
}
