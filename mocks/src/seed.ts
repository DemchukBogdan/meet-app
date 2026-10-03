import { meetingSchema } from '@meet/schemas';

import type { Meeting } from '@meet/schemas';

function meeting(input: Meeting): Meeting {
  return meetingSchema.parse(input);
}

export function createSeedMeetings(): Meeting[] {
  return [
    meeting({
      id: 'meet-1',
      title: 'Algebra',
      starts_at: '2026-10-03T09:00:00.000Z',
      duration_min: 45,
      status: 'scheduled',
      my_rsvp: 'accepted',
      participants_count: 4,
    }),
    meeting({
      id: 'meet-2',
      title: 'Physics lab',
      starts_at: '2026-10-04T11:30:00.000Z',
      duration_min: 60,
      status: 'scheduled',
      my_rsvp: 'pending',
      participants_count: 2,
    }),
    meeting({
      id: 'meet-3',
      title: 'History seminar',
      starts_at: '2026-10-03T13:00:00.000Z',
      duration_min: 30,
      status: 'live',
      my_rsvp: 'accepted',
      participants_count: 6,
    }),
    meeting({
      id: 'meet-4',
      title: 'Chemistry review',
      starts_at: '2026-10-05T15:00:00.000Z',
      duration_min: 40,
      status: 'live',
      my_rsvp: 'pending',
      participants_count: 3,
    }),
    meeting({
      id: 'meet-5',
      title: 'Literature club',
      starts_at: '2026-09-28T16:00:00.000Z',
      duration_min: 50,
      status: 'finished',
      my_rsvp: 'declined',
      participants_count: 5,
    }),
    meeting({
      id: 'meet-6',
      title: 'Geometry',
      starts_at: '2026-10-08T08:00:00.000Z',
      duration_min: 45,
      status: 'scheduled',
      my_rsvp: 'declined',
      participants_count: 1,
    }),
  ];
}
