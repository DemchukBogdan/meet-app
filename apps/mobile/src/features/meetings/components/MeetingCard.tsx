import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatDateTime, getActiveLanguage } from '@meet/i18n';
import { useTranslation } from 'react-i18next';

import { meetingCardStyle, meetingsPalette } from '../styles/variant-styles';
import { StatusBadge } from './StatusBadge';

import type { Meeting } from '@meet/schemas';

type MeetingCardProps = {
  meeting: Meeting;
  onPress: (meetingId: string) => void;
};

export function MeetingCard({ meeting, onPress }: MeetingCardProps) {
  const { t } = useTranslation();

  return (
    <Pressable
      style={meetingCardStyle(meeting.status, true)}
      onPress={() => {
        onPress(meeting.id);
      }}
    >
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
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  title: {
    color: meetingsPalette.text,
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  meta: {
    color: meetingsPalette.muted,
    fontSize: 14,
  },
});
