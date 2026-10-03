import { useCallback, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { readValidationErrorBody, useCreateMeetingMutation } from '@meet/api';
import { validationErrorKey } from '@meet/i18n';
import { CreateMeetingForm } from '@meet/schemas';
import { useTranslation } from 'react-i18next';

import { AppButton } from '../components/AppButton';
import { meetingsPalette } from '../styles/variant-styles';

import type {
  CreateMeetingField,
  CreateMeetingFieldErrors,
} from '@meet/schemas';

const emptyErrors: CreateMeetingFieldErrors = {};

type CreateMeetingScreenProps = {
  onBack: () => void;
  onCreated: (meetingId: string) => void;
};

export function CreateMeetingScreen({
  onBack,
  onCreated,
}: CreateMeetingScreenProps) {
  const { t } = useTranslation();
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
    const result = new CreateMeetingForm({
      title,
      startsAtLocal,
      durationMin,
    }).validate();
    if (!result.ok) {
      setClientErrors(result.fieldErrors);
      return;
    }

    setClientErrors(emptyErrors);
    void createMeeting(result.data)
      .unwrap()
      .then((meeting) => {
        onCreated(meeting.id);
      })
      .catch((error: unknown) => {
        const validation = readValidationErrorBody(error);
        if (validation) {
          setServerErrors(validation.errors);
          return;
        }

        setHasRequestError(true);
      });
  }, [createMeeting, durationMin, onCreated, startsAtLocal, title]);

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>{t('meetings.form.title')}</Text>
      <Text style={styles.label}>{t('meetings.form.name')}</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} />
      <FieldMessage message={messageFor('title')} />
      <Text style={styles.label}>{t('meetings.form.startsAt')}</Text>
      <TextInput
        style={styles.input}
        value={startsAtLocal}
        onChangeText={setStartsAtLocal}
      />
      <FieldMessage message={messageFor('starts_at')} />
      <Text style={styles.label}>{t('meetings.form.duration')}</Text>
      <TextInput
        keyboardType="number-pad"
        style={styles.input}
        value={durationMin}
        onChangeText={setDurationMin}
      />
      <FieldMessage message={messageFor('duration_min')} />
      {hasRequestError ? (
        <Text style={styles.error}>{t('meetings.form.error')}</Text>
      ) : null}
      <AppButton isDisabled={isLoading} onPress={handleSubmit}>
        {isLoading ? t('meetings.form.submitting') : t('meetings.form.submit')}
      </AppButton>
      <AppButton intent="secondary" onPress={onBack}>
        {t('common.back')}
      </AppButton>
    </View>
  );
}

function FieldMessage({ message }: { message: string | undefined }) {
  if (!message) {
    return null;
  }

  return <Text style={styles.error}>{message}</Text>;
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: meetingsPalette.background,
    flex: 1,
    gap: 8,
    padding: 16,
    paddingTop: 56,
  },
  title: {
    color: meetingsPalette.text,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  label: {
    color: meetingsPalette.text,
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    backgroundColor: meetingsPalette.surface,
    borderColor: '#d6d3d1',
    borderRadius: 10,
    borderWidth: 1,
    color: meetingsPalette.text,
    padding: 12,
  },
  error: {
    color: '#b91c1c',
  },
});
