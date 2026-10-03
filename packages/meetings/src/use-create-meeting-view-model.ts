import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { readValidationErrorBody, useCreateMeetingMutation } from '@meet/api';
import { validationErrorKey } from '@meet/i18n';
import { CreateMeetingForm } from '@meet/schemas';

import type { ValidationErrorBody } from '@meet/schemas';
import type {
  CreateMeetingErrorCode,
  CreateMeetingField,
  CreateMeetingFieldErrors,
} from '@meet/schemas';
import type {
  CreateMeetingViewModelType,
  UseCreateMeetingViewModelParamsType,
} from './types';

const EMPTY_FIELD_ERRORS: CreateMeetingFieldErrors = {};
const EMPTY_SERVER_ERRORS: ValidationErrorBody['errors'] = {};

function withoutClientField(
  errors: CreateMeetingFieldErrors,
  field: CreateMeetingField,
): CreateMeetingFieldErrors {
  if (!errors[field]) {
    return errors;
  }

  const next = { ...errors };
  delete next[field];
  return next;
}

function withoutServerField(
  errors: ValidationErrorBody['errors'],
  field: CreateMeetingField,
): ValidationErrorBody['errors'] {
  if (!errors[field]) {
    return errors;
  }

  const next = { ...errors };
  delete next[field];
  return next;
}

function readFieldMessage(params: {
  field: CreateMeetingField;
  clientErrors: CreateMeetingFieldErrors;
  serverErrors: ValidationErrorBody['errors'];
  translateCode: (code: CreateMeetingErrorCode) => string;
}): string | undefined {
  const code = params.clientErrors[params.field];
  if (code) {
    return params.translateCode(code);
  }

  return params.serverErrors[params.field]?.[0];
}

export function useCreateMeetingViewModel({
  onCreated,
}: UseCreateMeetingViewModelParamsType): CreateMeetingViewModelType {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [startsAtLocal, setStartsAtLocal] = useState('');
  const [durationMin, setDurationMin] = useState('45');
  const [clientErrors, setClientErrors] =
    useState<CreateMeetingFieldErrors>(EMPTY_FIELD_ERRORS);
  const [serverErrors, setServerErrors] =
    useState<ValidationErrorBody['errors']>(EMPTY_SERVER_ERRORS);
  const [hasRequestError, setHasRequestError] = useState(false);
  const [createMeeting, { isLoading }] = useCreateMeetingMutation();
  const submitLock = useRef(false);

  const translateCode = useCallback(
    (code: CreateMeetingErrorCode) => t(validationErrorKey(code)),
    [t],
  );

  const fieldMessages = useMemo(
    () => ({
      title: readFieldMessage({
        field: 'title',
        clientErrors,
        serverErrors,
        translateCode,
      }),
      startsAt: readFieldMessage({
        field: 'starts_at',
        clientErrors,
        serverErrors,
        translateCode,
      }),
      duration: readFieldMessage({
        field: 'duration_min',
        clientErrors,
        serverErrors,
        translateCode,
      }),
    }),
    [clientErrors, serverErrors, translateCode],
  );

  const clearFieldFeedback = useCallback((field: CreateMeetingField) => {
    setClientErrors((current) => withoutClientField(current, field));
    setServerErrors((current) => withoutServerField(current, field));
  }, []);

  const handleChangeTitle = useCallback(
    (value: string) => {
      setTitle(value);
      clearFieldFeedback('title');
    },
    [clearFieldFeedback],
  );

  const handleChangeStartsAt = useCallback(
    (value: string) => {
      setStartsAtLocal(value);
      clearFieldFeedback('starts_at');
    },
    [clearFieldFeedback],
  );

  const handleChangeDuration = useCallback(
    (value: string) => {
      setDurationMin(value);
      clearFieldFeedback('duration_min');
    },
    [clearFieldFeedback],
  );

  const handleSubmit = useCallback(() => {
    if (submitLock.current) {
      return;
    }

    setServerErrors(EMPTY_SERVER_ERRORS);
    setHasRequestError(false);
    const result = new CreateMeetingForm({
      title,
      startsAtLocal,
      durationMin,
    }).validate();
    if (!result.ok) {
      setClientErrors(result.fieldErrors);
      return;
    }

    submitLock.current = true;
    setClientErrors(EMPTY_FIELD_ERRORS);
    void createMeeting(result.data)
      .unwrap()
      .then((meeting) => {
        onCreated(meeting.id);
      })
      .catch((error: unknown) => {
        console.error(error);
        const validation = readValidationErrorBody(error);
        if (validation) {
          setServerErrors(validation.errors);
          return;
        }

        setHasRequestError(true);
      })
      .finally(() => {
        submitLock.current = false;
      });
  }, [createMeeting, durationMin, onCreated, startsAtLocal, title]);

  return {
    screenTitle: t('meetings.form.title'),
    nameLabel: t('meetings.form.name'),
    startsAtLabel: t('meetings.form.startsAt'),
    durationLabel: t('meetings.form.duration'),
    submitLabel: isLoading
      ? t('meetings.form.submitting')
      : t('meetings.form.submit'),
    backLabel: t('common.back'),
    title,
    startsAtLocal,
    durationMin,
    isSubmitting: isLoading,
    titleError: fieldMessages.title,
    startsAtError: fieldMessages.startsAt,
    durationError: fieldMessages.duration,
    requestErrorMessage: hasRequestError ? t('meetings.form.error') : null,
    handleChangeTitle,
    handleChangeStartsAt,
    handleChangeDuration,
    handleSubmit,
  };
}
