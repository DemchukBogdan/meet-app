import { Button, FieldError, Input, Label, TextField } from '@heroui/react';
import { readValidationErrorBody, useCreateMeetingMutation } from '@meet/api';
import { validationErrorKey } from '@meet/i18n';
import { CreateMeetingForm } from '@meet/schemas';
import { buttonVariants } from '@meet/ui';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { AppShell } from '../components/app-shell';

import type {
  CreateMeetingField,
  CreateMeetingFieldErrors,
} from '@meet/schemas';

const emptyErrors: CreateMeetingFieldErrors = {};

export function CreateMeetingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [startsAtLocal, setStartsAtLocal] = useState('');
  const [durationMin, setDurationMin] = useState('45');
  const [clientErrors, setClientErrors] =
    useState<CreateMeetingFieldErrors>(emptyErrors);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>(
    {},
  );
  const [hasRequestError, setHasRequestError] = useState(false);
  const [createMeeting, { isLoading }] = useCreateMeetingMutation();
  const valuesRef = useRef({ title, startsAtLocal, durationMin });
  valuesRef.current = { title, startsAtLocal, durationMin };

  const messageFor = useCallback(
    (field: CreateMeetingField): string | undefined => {
      const code = clientErrors[field];
      if (code) {
        return t(validationErrorKey(code));
      }

      return serverErrors[field]?.[0];
    },
    [clientErrors, serverErrors, t],
  );

  const handleSubmit = useCallback(() => {
    setServerErrors({});
    setHasRequestError(false);
    const result = new CreateMeetingForm(valuesRef.current).validate();
    if (!result.ok) {
      setClientErrors(result.fieldErrors);
      return;
    }

    setClientErrors(emptyErrors);
    void createMeeting(result.data)
      .unwrap()
      .then((meeting) => {
        navigate(`/meetings/${meeting.id}`);
      })
      .catch((error: unknown) => {
        const validation = readValidationErrorBody(error);
        if (validation) {
          setServerErrors(validation.errors);
          return;
        }

        setHasRequestError(true);
      });
  }, [createMeeting, navigate]);

  return (
    <AppShell title={t('meetings.form.title')}>
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit();
        }}
      >
        <TextField
          value={title}
          onChange={setTitle}
          isInvalid={Boolean(messageFor('title'))}
        >
          <Label>{t('meetings.form.name')}</Label>
          <Input />
          <FieldError>{messageFor('title')}</FieldError>
        </TextField>
        <TextField
          value={startsAtLocal}
          onChange={setStartsAtLocal}
          isInvalid={Boolean(messageFor('starts_at'))}
        >
          <Label>{t('meetings.form.startsAt')}</Label>
          <Input type="datetime-local" />
          <FieldError>{messageFor('starts_at')}</FieldError>
        </TextField>
        <TextField
          value={durationMin}
          onChange={setDurationMin}
          isInvalid={Boolean(messageFor('duration_min'))}
        >
          <Label>{t('meetings.form.duration')}</Label>
          <Input inputMode="numeric" />
          <FieldError>{messageFor('duration_min')}</FieldError>
        </TextField>
        {hasRequestError ? (
          <p role="alert">{t('meetings.form.error')}</p>
        ) : null}
        <div className="flex gap-2">
          <Button
            type="button"
            isPending={isLoading}
            className={buttonVariants({ intent: 'primary' })}
            onPress={handleSubmit}
          >
            {isLoading
              ? t('meetings.form.submitting')
              : t('meetings.form.submit')}
          </Button>
          <Button
            variant="secondary"
            className={buttonVariants({ intent: 'secondary' })}
            onPress={() => {
              navigate('/');
            }}
          >
            {t('common.back')}
          </Button>
        </div>
      </form>
    </AppShell>
  );
}
