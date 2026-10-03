import { describe, expect, it } from 'vitest';

import {
  createInitialCreateMeetingSession,
  hasCreateMeetingRequestError,
  readCreateMeetingFieldFeedback,
  reduceCreateMeetingSession,
} from './use-create-meeting-view-model';

import type { CreateMeetingSessionType } from './use-create-meeting-view-model';

describe('create meeting session', () => {
  it('starts as an empty draft with the default duration', () => {
    const session = createInitialCreateMeetingSession();

    expect(session.phase.status).toBe('editing');
    expect(session.draft.durationMin).toBe('45');
    expect(session.draft.title).toBe('');
  });

  it('clears only the edited field and keeps the other errors', () => {
    const invalid = reduceCreateMeetingSession(
      createInitialCreateMeetingSession(),
      {
        type: 'submitRejected',
        fieldErrors: {
          title: 'title_required',
          starts_at: 'starts_at_invalid',
        },
      },
    );

    const edited = reduceCreateMeetingSession(invalid, {
      type: 'fieldChanged',
      field: 'title',
      value: 'Algebra',
    });

    expect(edited.draft.title).toBe('Algebra');
    expect(readCreateMeetingFieldFeedback(edited, 'title')).toBeUndefined();
    expect(readCreateMeetingFieldFeedback(edited, 'starts_at')).toEqual({
      source: 'client',
      code: 'starts_at_invalid',
    });
  });

  it('ignores a second submit while the first request is in flight', () => {
    const submitting = reduceCreateMeetingSession(
      createInitialCreateMeetingSession(),
      { type: 'submitStarted' },
    );
    const again = reduceCreateMeetingSession(submitting, {
      type: 'submitStarted',
    });

    expect(again).toBe(submitting);
  });

  it('keeps keystrokes during submit without leaving the submitting phase', () => {
    const submitting = reduceCreateMeetingSession(
      createInitialCreateMeetingSession(),
      { type: 'submitStarted' },
    );
    const typed = reduceCreateMeetingSession(submitting, {
      type: 'fieldChanged',
      field: 'title',
      value: 'Algebra',
    });

    expect(typed.draft.title).toBe('Algebra');
    expect(typed.phase.status).toBe('submitting');
    expect(readCreateMeetingFieldFeedback(typed, 'title')).toBeUndefined();
  });

  it('returns to editing with server messages, and ignores a late response after that', () => {
    const submitting = reduceCreateMeetingSession(
      createInitialCreateMeetingSession(),
      { type: 'submitStarted' },
    );
    const rejected = reduceCreateMeetingSession(submitting, {
      type: 'submitRejectedByServer',
      errors: { title: ['Already taken'] },
    });
    const late = reduceCreateMeetingSession(rejected, { type: 'submitFailed' });

    expect(readCreateMeetingFieldFeedback(rejected, 'title')).toEqual({
      source: 'server',
      message: 'Already taken',
    });
    expect(late).toBe(rejected);
    expect(hasCreateMeetingRequestError(late)).toBe(false);
  });

  it('prefers a client code over a server string for the same field', () => {
    const session: CreateMeetingSessionType = {
      draft: {
        title: '',
        startsAtLocal: '',
        durationMin: '45',
      },
      phase: {
        status: 'editing',
        clientErrors: { duration_min: 'duration_invalid' },
        serverErrors: { duration_min: ['Must be positive'] },
        hasRequestError: true,
      },
    };

    expect(readCreateMeetingFieldFeedback(session, 'duration_min')).toEqual({
      source: 'client',
      code: 'duration_invalid',
    });
    expect(hasCreateMeetingRequestError(session)).toBe(true);
  });
});
