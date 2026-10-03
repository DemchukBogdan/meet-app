import { useContext, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useGetMeetingQuery, useRsvpMutation } from '@meet/api';
import { formatDateTime, getActiveLanguage, rsvpStatusKey } from '@meet/i18n';
import { useTranslation } from 'react-i18next';

import { AppButton } from '../components/AppButton';
import { StatusBadge } from '../components/StatusBadge';
import { JoinServiceContext } from '../join/join-service-context';
import { MediaPermissionDeniedError } from '../join/media-permission-denied-error';
import { meetingCardStyle, meetingsPalette } from '../styles/variant-styles';

import type { RsvpInput } from '@meet/schemas';

type MeetingDetailsScreenProps = {
  meetingId: string;
  onBack: () => void;
};

export function MeetingDetailsScreen({
  meetingId,
  onBack,
}: MeetingDetailsScreenProps) {
  const { t } = useTranslation();
  const joinService = useContext(JoinServiceContext);
  const query = useGetMeetingQuery(meetingId);
  const [rsvp, rsvpState] = useRsvpMutation();
  const [rsvpFailed, setRsvpFailed] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [joinMessage, setJoinMessage] = useState<string | null>(null);
  const meeting = query.data;

  const handleRsvp = (status: RsvpInput['status']) => {
    setRsvpFailed(false);
    void rsvp({ id: meetingId, body: { status } })
      .unwrap()
      .catch(() => {
        setRsvpFailed(true);
      });
  };

  const handleJoin = () => {
    if (!joinService) {
      setJoinMessage(t('meetings.joinFailed'));
      return;
    }

    setJoinMessage(null);
    setIsJoining(true);
    void joinService
      .join(meetingId)
      .catch((error: unknown) => {
        if (error instanceof MediaPermissionDeniedError) {
          setJoinMessage(t('meetings.permissionDenied'));
          return;
        }

        setJoinMessage(t('meetings.joinFailed'));
      })
      .finally(() => {
        setIsJoining(false);
      });
  };

  if (query.isLoading) {
    return (
      <View style={styles.screen}>
        <ActivityIndicator />
        <Text>{t('common.loading')}</Text>
      </View>
    );
  }

  if (query.isError || !meeting) {
    return (
      <View style={styles.screen}>
        <Text>{t('common.error')}</Text>
        <AppButton
          intent="secondary"
          onPress={() => {
            void query.refetch();
          }}
        >
          {t('common.retry')}
        </AppButton>
        <AppButton intent="secondary" onPress={onBack}>
          {t('common.back')}
        </AppButton>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={meetingCardStyle(meeting.status, false)}>
        <View style={styles.header}>
          <Text style={styles.title}>{meeting.title}</Text>
          <StatusBadge status={meeting.status} />
        </View>
        <Text style={styles.meta}>
          {formatDateTime(meeting.starts_at, getActiveLanguage())}
          {' · '}
          {t('meetings.duration', { count: meeting.duration_min })}
          {' · '}
          {t('meetings.participants', { count: meeting.participants_count })}
        </Text>
        <Text>
          {t('meetings.rsvp.label')}
          {': '}
          {t(rsvpStatusKey(meeting.my_rsvp))}
        </Text>
      </View>
      <AppButton
        size="sm"
        isDisabled={rsvpState.isLoading || meeting.my_rsvp === 'accepted'}
        onPress={() => {
          handleRsvp('accepted');
        }}
      >
        {t('meetings.rsvp.accept')}
      </AppButton>
      <AppButton
        intent="danger"
        size="sm"
        isDisabled={rsvpState.isLoading || meeting.my_rsvp === 'declined'}
        onPress={() => {
          handleRsvp('declined');
        }}
      >
        {t('meetings.rsvp.decline')}
      </AppButton>
      <AppButton
        intent="secondary"
        isDisabled={isJoining || meeting.status === 'finished'}
        onPress={handleJoin}
      >
        {isJoining ? t('meetings.joining') : t('meetings.join')}
      </AppButton>
      {rsvpFailed ? (
        <Text style={styles.error}>{t('meetings.rsvp.failed')}</Text>
      ) : null}
      {joinMessage ? <Text style={styles.error}>{joinMessage}</Text> : null}
      <AppButton intent="secondary" onPress={onBack}>
        {t('common.back')}
      </AppButton>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: meetingsPalette.background,
    flex: 1,
    gap: 12,
    padding: 16,
    paddingTop: 56,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  title: {
    color: meetingsPalette.text,
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
  },
  meta: {
    color: meetingsPalette.muted,
  },
  error: {
    color: '#b91c1c',
  },
});
