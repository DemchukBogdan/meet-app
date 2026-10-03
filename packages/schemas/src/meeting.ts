import { z } from 'zod';

export const meetingStatusSchema = z.enum(['scheduled', 'live', 'finished']);

export type MeetingStatus = z.infer<typeof meetingStatusSchema>;

export const rsvpStatusSchema = z.enum(['accepted', 'declined', 'pending']);

export type RsvpStatus = z.infer<typeof rsvpStatusSchema>;

export const meetingSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(120),
  starts_at: z.string().datetime(),
  duration_min: z.number().int().positive(),
  status: meetingStatusSchema,
  my_rsvp: rsvpStatusSchema,
  participants_count: z.number().int().nonnegative(),
});

export type Meeting = z.infer<typeof meetingSchema>;

export const createMeetingInputSchema = meetingSchema.pick({
  title: true,
  starts_at: true,
  duration_min: true,
});

export type CreateMeetingInput = z.infer<typeof createMeetingInputSchema>;

export const meetingListMetaSchema = z.object({
  page: z.number().int().positive(),
  per_page: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});

export const meetingListSchema = z.object({
  data: z.array(meetingSchema),
  meta: meetingListMetaSchema,
});

export type MeetingList = z.infer<typeof meetingListSchema>;

export const rsvpInputSchema = z.object({
  status: z.enum(['accepted', 'declined']),
});

export type RsvpInput = z.infer<typeof rsvpInputSchema>;

export const joinPayloadSchema = z.object({
  join_url: z.string().url(),
  zoom: z
    .object({
      meeting_number: z.string().min(1),
      signature: z.string().min(1),
    })
    .optional(),
});

export type JoinPayload = z.infer<typeof joinPayloadSchema>;

export const validationErrorSchema = z.object({
  message: z.string(),
  errors: z.record(z.array(z.string())),
});

export type ValidationErrorBody = z.infer<typeof validationErrorSchema>;

export const listMeetingsQuerySchema = z.object({
  status: meetingStatusSchema.optional(),
  page: z.coerce.number().int().positive(),
  per_page: z.coerce.number().int().positive(),
});

export type ListMeetingsQuery = z.infer<typeof listMeetingsQuerySchema>;

export const MEETINGS_PAGE_SIZE = 5;

export const meetingFilters = ['all', 'scheduled', 'live', 'finished'] as const;

export type MeetingFilter = (typeof meetingFilters)[number];

export function filterToStatus(
  filter: MeetingFilter,
): MeetingStatus | undefined {
  if (filter === 'all') {
    return undefined;
  }

  return filter;
}
