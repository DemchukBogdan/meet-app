import { describe, expect, it } from 'vitest';

import {
  joinPayloadSchema,
  meetingListSchema,
  meetingSchema,
  validationErrorSchema,
} from '@meet/schemas';

import { MeetingsMockServer } from './meetings-mock-server';

function request(path: string, init?: RequestInit): Request {
  return new Request(`http://localhost${path}`, init);
}

describe('MeetingsMockServer', () => {
  it('filters by status and paginates', async () => {
    const server = new MeetingsMockServer();
    const response = await server.handle(
      request('/api/meetings?status=scheduled&page=1&per_page=2'),
    );
    const body = meetingListSchema.parse(await response.json());

    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(2);
    expect(body.meta.total).toBe(3);
    expect(body.data.every((meeting) => meeting.status === 'scheduled')).toBe(
      true,
    );
  });

  it('creates a meeting and rejects an empty title', async () => {
    const server = new MeetingsMockServer();
    const created = await server.handle(
      request('/api/meetings', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Office hours',
          starts_at: '2026-10-12T10:00:00.000Z',
          duration_min: 25,
        }),
      }),
    );
    const meeting = meetingSchema.parse(await created.json());
    expect(created.status).toBe(201);
    expect(meeting.my_rsvp).toBe('pending');

    const invalid = await server.handle(
      request('/api/meetings', {
        method: 'POST',
        body: JSON.stringify({
          title: '',
          starts_at: 'not-a-date',
          duration_min: 0,
        }),
      }),
    );
    const errors = validationErrorSchema.parse(await invalid.json());
    expect(invalid.status).toBe(422);
    expect(errors.errors.title?.length).toBeGreaterThan(0);
  });

  it('updates RSVP and returns a join payload', async () => {
    const server = new MeetingsMockServer();
    const rsvp = await server.handle(
      request('/api/meetings/meet-2/rsvp', {
        method: 'POST',
        body: JSON.stringify({ status: 'accepted' }),
      }),
    );
    const meeting = meetingSchema.parse(await rsvp.json());
    expect(meeting.my_rsvp).toBe('accepted');
    expect(meeting.participants_count).toBe(3);

    const missing = await server.handle(
      request('/api/meetings/missing/rsvp', {
        method: 'POST',
        body: JSON.stringify({ status: 'declined' }),
      }),
    );
    expect(missing.status).toBe(404);

    const join = await server.handle(request('/api/meetings/meet-2/join'));
    const payload = joinPayloadSchema.parse(await join.json());
    expect(payload.zoom?.signature).toBe('mock-signature-meet-2');
    expect(payload.join_url).toContain('https://zoom.us/j/');
  });
});
