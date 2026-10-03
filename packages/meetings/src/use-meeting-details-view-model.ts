import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useGetMeetingQuery, useRsvpMutation } from '@meet/api';
import { formatDateTime, getActiveLanguage, rsvpStatusKey } from '@meet/i18n';

import type { JoinFailureKindType, MeetingDetailsViewModelType } from './types';
import type { UseMeetingDetailsViewModelParamsType } from './types';

function resolveFailedJoin(_error: unknown): JoinFailureKindType {
  return 'failed';
}

export function useMeetingDetailsViewModel({
  meetingId,
  joinMeeting,
  resolveJoinFailure = resolveFailedJoin,
}: UseMeetingDetailsViewModelParamsType): MeetingDetailsViewModelType {
  const { t } = useTranslation();
  const query = useGetMeetingQuery(meetingId, {
    skip: meetingId.length === 0,
  });
  const { refetch } = query;
  const [rsvp, rsvpState] = useRsvpMutation();
  const [rsvpErrorMessage, setRsvpErrorMessage] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [joinErrorMessage, setJoinErrorMessage] = useState<string | null>(null);
  const meeting = query.data ?? null;
  const meetingIdRef = useRef(meetingId);
  meetingIdRef.current = meetingId;

  // A new id is another meeting, so the previous screen must not keep its feedback.
  useEffect(() => {
    setRsvpErrorMessage(null);
    setJoinErrorMessage(null);
    setIsJoining(false);
  }, [meetingId]);
  const joinFailureMessage = useCallback(
    (kind: JoinFailureKindType) =>
      kind === 'permissionDenied'
        ? t('meetings.permissionDenied')
        : t('meetings.joinFailed'),
    [t],
  );

  const handleRsvp = useCallback(
    (status: 'accepted' | 'declined') => {
      if (meetingId.length === 0) {
        return;
      }

      const requestedMeetingId = meetingId;
      setRsvpErrorMessage(null);
      void rsvp({ id: meetingId, body: { status } })
        .unwrap()
        .catch((error: unknown) => {
          console.error(error);
          if (meetingIdRef.current !== requestedMeetingId) {
            return;
          }

          setRsvpErrorMessage(t('meetings.rsvp.failed'));
        });
    },
    [meetingId, rsvp, t],
  );

  const handleAccept = useCallback(() => {
    handleRsvp('accepted');
  }, [handleRsvp]);

  const handleDecline = useCallback(() => {
    handleRsvp('declined');
  }, [handleRsvp]);

  const handleJoin = useCallback(() => {
    if (!joinMeeting || meetingId.length === 0) {
      setJoinErrorMessage(t('meetings.joinFailed'));
      return;
    }

    const requestedMeetingId = meetingId;
    setJoinErrorMessage(null);
    setIsJoining(true);
    void joinMeeting(meetingId)
      .catch((error: unknown) => {
        console.error(error);
        if (meetingIdRef.current !== requestedMeetingId) {
          return;
        }

        setJoinErrorMessage(joinFailureMessage(resolveJoinFailure(error)));
      })
      .finally(() => {
        if (meetingIdRef.current !== requestedMeetingId) {
          return;
        }

        setIsJoining(false);
      });
  }, [joinFailureMessage, joinMeeting, meetingId, resolveJoinFailure, t]);

  const handleRetry = useCallback(() => {
    void refetch();
  }, [refetch]);

  return {
    meeting,
    isLoading: query.isLoading,
    isError: query.isError || meetingId.length === 0,
    title: t('meetings.details.title'),
    startsAtLabel: meeting
      ? formatDateTime(meeting.starts_at, getActiveLanguage())
      : '',
    durationLabel: meeting
      ? t('meetings.duration', { count: meeting.duration_min })
      : '',
    participantsLabel: meeting
      ? t('meetings.participants', { count: meeting.participants_count })
      : '',
    rsvpStatusLabel: meeting
      ? `${t('meetings.rsvp.label')}: ${t(rsvpStatusKey(meeting.my_rsvp))}`
      : '',
    acceptLabel: t('meetings.rsvp.accept'),
    declineLabel: t('meetings.rsvp.decline'),
    joinLabel: isJoining ? t('meetings.joining') : t('meetings.join'),
    backLabel: t('common.back'),
    loadingLabel: t('common.loading'),
    errorLabel: t('common.error'),
    notFoundLabel: t('meetings.details.notFound'),
    retryLabel: t('common.retry'),
    isAcceptDisabled:
      rsvpState.isLoading || !meeting || meeting.my_rsvp === 'accepted',
    isDeclineDisabled:
      rsvpState.isLoading || !meeting || meeting.my_rsvp === 'declined',
    isJoining,
    isJoinDisabled: !meeting || meeting.status === 'finished',
    rsvpErrorMessage,
    joinErrorMessage,
    handleAccept,
    handleDecline,
    handleJoin,
    handleRetry,
  };
}
