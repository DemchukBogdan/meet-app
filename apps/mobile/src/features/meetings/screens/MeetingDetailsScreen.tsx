import { useCallback, useContext } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useMeetingDetailsViewModel } from '@meet/meetings';

import { AppButton } from '../components/AppButton';
import { StatusBadge } from '../components/StatusBadge';
import { JoinServiceContext } from '../join/join-service-context';
import { resolveMobileJoinFailure } from '../join/resolve-mobile-join-failure';
import { meetingCardStyle, meetingsPalette } from '../styles/variant-styles';

type MeetingDetailsScreenProps = {
  meetingId: string;
  onBack: () => void;
};

export function MeetingDetailsScreen({
  meetingId,
  onBack,
}: MeetingDetailsScreenProps) {
  const joinService = useContext(JoinServiceContext);
  const joinMeeting = useCallback(
    (id: string) => {
      if (!joinService) {
        return Promise.reject(new Error('Join service is missing'));
      }

      return joinService.join(id);
    },
    [joinService],
  );
  const viewModel = useMeetingDetailsViewModel({
    meetingId,
    joinMeeting: joinService ? joinMeeting : null,
    resolveJoinFailure: resolveMobileJoinFailure,
  });
  const meeting = viewModel.meeting;

  if (viewModel.isLoading) {
    return (
      <View style={styles.screen}>
        <ActivityIndicator />
        <Text>{viewModel.loadingLabel}</Text>
      </View>
    );
  }

  if (viewModel.isError || !meeting) {
    return (
      <View style={styles.screen}>
        <Text>{viewModel.errorLabel}</Text>
        <AppButton intent="secondary" onPress={viewModel.handleRetry}>
          {viewModel.retryLabel}
        </AppButton>
        <AppButton intent="secondary" onPress={onBack}>
          {viewModel.backLabel}
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
          {viewModel.startsAtLabel}
          {' · '}
          {viewModel.durationLabel}
          {' · '}
          {viewModel.participantsLabel}
        </Text>
        <Text>{viewModel.rsvpStatusLabel}</Text>
      </View>
      <AppButton
        size="sm"
        isDisabled={viewModel.isAcceptDisabled}
        onPress={viewModel.handleAccept}
      >
        {viewModel.acceptLabel}
      </AppButton>
      <AppButton
        intent="danger"
        size="sm"
        isDisabled={viewModel.isDeclineDisabled}
        onPress={viewModel.handleDecline}
      >
        {viewModel.declineLabel}
      </AppButton>
      <AppButton
        intent="secondary"
        isDisabled={viewModel.isJoining || viewModel.isJoinDisabled}
        onPress={viewModel.handleJoin}
      >
        {viewModel.joinLabel}
      </AppButton>
      {viewModel.rsvpErrorMessage ? (
        <Text style={styles.error}>{viewModel.rsvpErrorMessage}</Text>
      ) : null}
      {viewModel.joinErrorMessage ? (
        <Text style={styles.error}>{viewModel.joinErrorMessage}</Text>
      ) : null}
      <AppButton intent="secondary" onPress={onBack}>
        {viewModel.backLabel}
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
