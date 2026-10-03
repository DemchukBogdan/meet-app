import type {
  CreateMeetingErrorCode,
  MeetingFilter,
  MeetingStatus,
  RsvpStatus,
} from '@meet/schemas';

export function meetingFilterKey(filter: MeetingFilter) {
  switch (filter) {
    case 'all':
      return 'meetings.filter.all';
    case 'scheduled':
      return 'meetings.filter.scheduled';
    case 'live':
      return 'meetings.filter.live';
    case 'finished':
      return 'meetings.filter.finished';
  }
}

export function meetingStatusKey(status: MeetingStatus) {
  switch (status) {
    case 'scheduled':
      return 'meetings.status.scheduled';
    case 'live':
      return 'meetings.status.live';
    case 'finished':
      return 'meetings.status.finished';
  }
}

export function rsvpStatusKey(status: RsvpStatus) {
  switch (status) {
    case 'accepted':
      return 'meetings.rsvp.accepted';
    case 'declined':
      return 'meetings.rsvp.declined';
    case 'pending':
      return 'meetings.rsvp.pending';
  }
}

export function validationErrorKey(code: CreateMeetingErrorCode) {
  switch (code) {
    case 'title_required':
      return 'validation.titleRequired';
    case 'title_too_long':
      return 'validation.titleMax';
    case 'starts_at_invalid':
      return 'validation.startsAt';
    case 'duration_invalid':
      return 'validation.duration';
  }
}
