import { useCallback, useMemo, useReducer, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { readValidationErrorBody, useCreateMeetingMutation } from '@meet/api';
import { validationErrorKey } from '@meet/i18n';
import { CreateMeetingForm } from '@meet/schemas';

import type {
  CreateMeetingErrorCode,
  CreateMeetingField,
  CreateMeetingFieldErrors,
  CreateMeetingFormValues,
  ValidationErrorBody,
} from '@meet/schemas';
import type {
  CreateMeetingViewModelType,
  UseCreateMeetingViewModelParamsType,
} from './types';

const INITIAL_DURATION_MIN = '45';

const draftKeyByField = {
  title: 'title',
  starts_at: 'startsAtLocal',
  duration_min: 'durationMin',
} as const satisfies Record<CreateMeetingField, keyof CreateMeetingFormValues>;

export type CreateMeetingPhaseType =
  | {
      status: 'editing';
      clientErrors: CreateMeetingFieldErrors;
      serverErrors: ValidationErrorBody['errors'];
      hasRequestError: boolean;
    }
  | { status: 'submitting' };

export type CreateMeetingSessionType = {
  draft: CreateMeetingFormValues;
  phase: CreateMeetingPhaseType;
};

export type CreateMeetingSessionEventType =
  | { type: 'fieldChanged'; field: CreateMeetingField; value: string }
  | { type: 'submitRejected'; fieldErrors: CreateMeetingFieldErrors }
  | { type: 'submitStarted' }
  | { type: 'submitRejectedByServer'; errors: ValidationErrorBody['errors'] }
  | { type: 'submitFailed' };

export type CreateMeetingFieldFeedbackType =
  | { source: 'client'; code: CreateMeetingErrorCode }
  | { source: 'server'; message: string };

type EditingPhaseType = Extract<CreateMeetingPhaseType, { status: 'editing' }>;

function editingPhase(
  patch: Partial<Omit<EditingPhaseType, 'status'>> = {},
): EditingPhaseType {
  return {
    status: 'editing',
    clientErrors: {},
    serverErrors: {},
    hasRequestError: false,
    ...patch,
  };
}

function withoutField<
  TRecord extends Partial<Record<CreateMeetingField, unknown>>,
>(record: TRecord, field: CreateMeetingField): TRecord {
  if (record[field] === undefined) {
    return record;
  }

  const next = { ...record };
  delete next[field];
  return next;
}

export function createInitialCreateMeetingSession(): CreateMeetingSessionType {
  return {
    draft: {
      title: '',
      startsAtLocal: '',
      durationMin: INITIAL_DURATION_MIN,
    },
    phase: editingPhase(),
  };
}

/**
 * Phase is `editing` or `submitting`. An event that does not belong to the
 * current phase is ignored, so a second submit and a late response cannot
 * repaint a newer attempt. `CreateMeetingForm` stays the Zod boundary; this
 * function only decides which phase the draft is in.
 */
export function reduceCreateMeetingSession(
  state: CreateMeetingSessionType,
  event: CreateMeetingSessionEventType,
): CreateMeetingSessionType {
  switch (event.type) {
    case 'fieldChanged': {
      const draftKey = draftKeyByField[event.field];
      const draft = {
        ...state.draft,
        [draftKey]: event.value,
      };

      // Keystrokes stay in the draft while a request is in flight, otherwise a controlled input drops them.
      // The phase does not change, so a second submit is still ignored.
      if (state.phase.status !== 'editing') {
        return { ...state, draft };
      }

      return {
        draft,
        phase: {
          ...state.phase,
          clientErrors: withoutField(state.phase.clientErrors, event.field),
          serverErrors: withoutField(state.phase.serverErrors, event.field),
        },
      };
    }
    case 'submitRejected': {
      if (state.phase.status !== 'editing') {
        return state;
      }

      return {
        ...state,
        phase: editingPhase({ clientErrors: event.fieldErrors }),
      };
    }
    case 'submitStarted': {
      if (state.phase.status !== 'editing') {
        return state;
      }

      return {
        ...state,
        phase: { status: 'submitting' },
      };
    }
    case 'submitRejectedByServer':
    case 'submitFailed': {
      // A late response must not repaint a session that is already editing again.
      if (state.phase.status !== 'submitting') {
        return state;
      }

      if (event.type === 'submitRejectedByServer') {
        return {
          ...state,
          phase: editingPhase({ serverErrors: event.errors }),
        };
      }

      return {
        ...state,
        phase: editingPhase({ hasRequestError: true }),
      };
    }
    default: {
      const unexpected: never = event;
      throw new Error(
        `Unexpected create-meeting event: ${JSON.stringify(unexpected)}`,
      );
    }
  }
}

/**
 * A client code outranks a server string on the same field.
 * While `submitting`, the field has no message: the previous attempt is no longer on screen.
 */
export function readCreateMeetingFieldFeedback(
  session: CreateMeetingSessionType,
  field: CreateMeetingField,
): CreateMeetingFieldFeedbackType | undefined {
  if (session.phase.status !== 'editing') {
    return undefined;
  }

  const code = session.phase.clientErrors[field];
  if (code) {
    return { source: 'client', code };
  }

  const message = session.phase.serverErrors[field]?.[0];
  if (message) {
    return { source: 'server', message };
  }

  return undefined;
}

export function hasCreateMeetingRequestError(
  session: CreateMeetingSessionType,
): boolean {
  return session.phase.status === 'editing' && session.phase.hasRequestError;
}

export function useCreateMeetingViewModel({
  onCreated,
}: UseCreateMeetingViewModelParamsType): CreateMeetingViewModelType {
  const { t } = useTranslation();
  const [session, dispatch] = useReducer(
    reduceCreateMeetingSession,
    createInitialCreateMeetingSession(),
  );
  const sessionRef = useRef(session);
  // The handler reads this ref, so it has to follow the reducer after each render.
  sessionRef.current = session;
  const [createMeeting] = useCreateMeetingMutation();
  const isSubmitting = session.phase.status === 'submitting';

  const translateCode = useCallback(
    (code: CreateMeetingErrorCode) => t(validationErrorKey(code)),
    [t],
  );

  const fieldMessage = useCallback(
    (field: CreateMeetingField) => {
      const feedback = readCreateMeetingFieldFeedback(session, field);
      if (!feedback) {
        return undefined;
      }

      if (feedback.source === 'client') {
        return translateCode(feedback.code);
      }

      return feedback.message;
    },
    [session, translateCode],
  );

  const fieldMessages = useMemo(
    () => ({
      title: fieldMessage('title'),
      startsAt: fieldMessage('starts_at'),
      duration: fieldMessage('duration_min'),
    }),
    [fieldMessage],
  );

  const handleChangeField = useCallback(
    (field: CreateMeetingField, value: string) => {
      dispatch({ type: 'fieldChanged', field, value });
    },
    [],
  );

  const handleChangeTitle = useCallback(
    (value: string) => {
      handleChangeField('title', value);
    },
    [handleChangeField],
  );

  const handleChangeStartsAt = useCallback(
    (value: string) => {
      handleChangeField('starts_at', value);
    },
    [handleChangeField],
  );

  const handleChangeDuration = useCallback(
    (value: string) => {
      handleChangeField('duration_min', value);
    },
    [handleChangeField],
  );

  const handleSubmit = useCallback(() => {
    const current = sessionRef.current;
    if (current.phase.status === 'submitting') {
      return;
    }

    const result = new CreateMeetingForm(current.draft).validate();
    if (!result.ok) {
      dispatch({ type: 'submitRejected', fieldErrors: result.fieldErrors });
      return;
    }

    // Dispatch lands on the next render. Apply the same event now so a second
    // click in this turn cannot start another request.
    sessionRef.current = reduceCreateMeetingSession(current, {
      type: 'submitStarted',
    });
    dispatch({ type: 'submitStarted' });
    void createMeeting(result.data)
      .unwrap()
      .then((meeting) => {
        onCreated(meeting.id);
      })
      .catch((error: unknown) => {
        console.error(error);
        const validation = readValidationErrorBody(error);
        if (validation) {
          dispatch({
            type: 'submitRejectedByServer',
            errors: validation.errors,
          });
          return;
        }

        dispatch({ type: 'submitFailed' });
      });
  }, [createMeeting, onCreated]);

  return {
    screenTitle: t('meetings.form.title'),
    nameLabel: t('meetings.form.name'),
    startsAtLabel: t('meetings.form.startsAt'),
    durationLabel: t('meetings.form.duration'),
    submitLabel: isSubmitting
      ? t('meetings.form.submitting')
      : t('meetings.form.submit'),
    backLabel: t('common.back'),
    title: session.draft.title,
    startsAtLocal: session.draft.startsAtLocal,
    durationMin: session.draft.durationMin,
    isSubmitting,
    titleError: fieldMessages.title,
    startsAtError: fieldMessages.startsAt,
    durationError: fieldMessages.duration,
    requestErrorMessage: hasCreateMeetingRequestError(session)
      ? t('meetings.form.error')
      : null,
    handleChangeTitle,
    handleChangeStartsAt,
    handleChangeDuration,
    handleSubmit,
  };
}
