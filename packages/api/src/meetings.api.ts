import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import {
  joinPayloadSchema,
  meetingListSchema,
  meetingSchema,
} from '@meet/schemas';

import { getRegisteredAccessToken } from './access-token';
import { MEETINGS_API_ORIGIN } from './base-url';

import type {
  CreateMeetingInput,
  JoinPayload,
  ListMeetingsQuery,
  Meeting,
  MeetingList,
  RsvpInput,
} from '@meet/schemas';

type MeetingTag = { type: 'Meeting'; id: string };

function meetingListTag(): MeetingTag {
  return { type: 'Meeting', id: 'LIST' };
}

function meetingTag(id: string): MeetingTag {
  return { type: 'Meeting', id };
}

export const meetingsApi = createApi({
  reducerPath: 'meetingsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: MEETINGS_API_ORIGIN,
    prepareHeaders: (headers) => {
      const accessToken = getRegisteredAccessToken();
      if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`);
      }

      return headers;
    },
  }),
  tagTypes: ['Meeting'],
  endpoints: (build) => ({
    listMeetings: build.query<MeetingList, ListMeetingsQuery>({
      query: ({ status, page, per_page }) => ({
        url: '/meetings',
        params: {
          page,
          per_page,
          ...(status ? { status } : {}),
        },
      }),
      transformResponse: (response: unknown) =>
        meetingListSchema.parse(response),
      providesTags: (result) => {
        const tags = [meetingListTag()];
        if (!result) {
          return tags;
        }

        return [
          ...tags,
          ...result.data.map((meeting) => meetingTag(meeting.id)),
        ];
      },
    }),
    getMeeting: build.query<Meeting, string>({
      query: (id) => `/meetings/${id}`,
      transformResponse: (response: unknown) => meetingSchema.parse(response),
      providesTags: (_result, _error, id) => [meetingTag(id)],
    }),
    createMeeting: build.mutation<Meeting, CreateMeetingInput>({
      query: (body) => ({
        url: '/meetings',
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => meetingSchema.parse(response),
      invalidatesTags: [meetingListTag()],
    }),
    rsvp: build.mutation<Meeting, { id: string; body: RsvpInput }>({
      query: ({ id, body }) => ({
        url: `/meetings/${id}/rsvp`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => meetingSchema.parse(response),
      invalidatesTags: (_result, _error, { id }) => [
        meetingTag(id),
        meetingListTag(),
      ],
    }),
    getJoin: build.query<JoinPayload, string>({
      query: (id) => `/meetings/${id}/join`,
      transformResponse: (response: unknown) =>
        joinPayloadSchema.parse(response),
    }),
  }),
});

export const {
  useCreateMeetingMutation,
  useGetMeetingQuery,
  useListMeetingsQuery,
  useRsvpMutation,
} = meetingsApi;
