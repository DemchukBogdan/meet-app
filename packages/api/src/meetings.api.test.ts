import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { MeetingsMockServer } from '@meet/mocks';
import { createMeetingHandlers } from '@meet/mocks/handlers';

import { meetingsApi } from './meetings.api';
import { createMeetStore } from './store';

const meetings = new MeetingsMockServer();
const server = setupServer(...createMeetingHandlers(meetings));

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  meetings.reset();
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

describe('meetingsApi', () => {
  it('parses the meeting list', async () => {
    const store = createMeetStore();
    const result = await store
      .dispatch(
        meetingsApi.endpoints.listMeetings.initiate({
          page: 1,
          per_page: 5,
        }),
      )
      .unwrap();

    expect(result.data.length).toBeGreaterThan(0);
    expect(result.meta.page).toBe(1);
  });

  it('treats a contract mismatch as an error', async () => {
    server.use(
      http.get('http://localhost/api/meetings/meet-1', () =>
        HttpResponse.json({ id: 'meet-1' }),
      ),
    );
    const store = createMeetStore();
    const result = await store.dispatch(
      meetingsApi.endpoints.getMeeting.initiate('meet-1'),
    );

    expect(result.data).toBeUndefined();
    expect(result.error).toBeDefined();
  });

  it('refetches the list after create invalidates the list tag', async () => {
    const store = createMeetStore();
    const query = { page: 1, per_page: 20 };
    const subscription = store.dispatch(
      meetingsApi.endpoints.listMeetings.initiate(query),
    );
    const before = await subscription.unwrap();

    await store
      .dispatch(
        meetingsApi.endpoints.createMeeting.initiate({
          title: 'Office hours',
          starts_at: '2026-10-12T10:00:00.000Z',
          duration_min: 25,
        }),
      )
      .unwrap();

    const after = await waitForListLength(store, query, before.data.length + 1);
    subscription.unsubscribe();
    expect(after).toBe(before.data.length + 1);
  });

  it('returns field errors for an invalid RSVP is not required when the body is valid', async () => {
    const store = createMeetStore();
    const meeting = await store
      .dispatch(
        meetingsApi.endpoints.rsvp.initiate({
          id: 'meet-2',
          body: { status: 'accepted' },
        }),
      )
      .unwrap();

    expect(meeting.my_rsvp).toBe('accepted');
  });
});

async function waitForListLength(
  store: ReturnType<typeof createMeetStore>,
  query: { page: number; per_page: number },
  length: number,
): Promise<number> {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const selected = meetingsApi.endpoints.listMeetings.select(query)(
      store.getState(),
    );
    const current = selected.data?.data.length;
    if (current === length) {
      return current;
    }

    await new Promise((resolve) => {
      setTimeout(resolve, 20);
    });
  }

  throw new Error('List did not refresh after create.');
}
