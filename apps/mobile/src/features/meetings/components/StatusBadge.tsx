import { Text, View } from 'react-native';

import { meetingStatusKey } from '@meet/i18n';
import { useTranslation } from 'react-i18next';

import { badgeLabelStyle, badgeStyle } from '../styles/variant-styles';

import type { MeetingStatus } from '@meet/schemas';

type StatusBadgeProps = {
  status: MeetingStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useTranslation();

  return (
    <View style={badgeStyle(status)}>
      <Text style={badgeLabelStyle(status)}>{t(meetingStatusKey(status))}</Text>
    </View>
  );
}
