import { Button, Card } from '@heroui/react';
import { useGetMeetingQuery, useRsvpMutation } from '@meet/api';
import { formatDateTime, getActiveLanguage, rsvpStatusKey } from '@meet/i18n';
import { meetingCardVariants, buttonVariants } from '@meet/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { AppShell } from '../components/app-shell';
import { QueryState } from '../components/query-state';
import { StatusBadge } from '../components/status-badge';
import { useJoinService } from '../join/join-service-context';

import type { RsvpInput } from '@meet/schemas';

export function MeetingDetailsPage() {
  const { meetingId } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const joinService = useJoinService();
  const query = useGetMeetingQuery(meetingId ?? '', { skip: !meetingId });
  const [rsvp, rsvpState] = useRsvpMutation();
  const [rsvpFailed, setRsvpFailed] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [joinFailed, setJoinFailed] = useState(false);
  const meeting = query.data;
  const slots = meetingCardVariants({
    status: meeting?.status ?? 'scheduled',
    interactive: false,
  });

  const handleRsvp = (status: RsvpInput['status']) => {
    if (!meetingId) {
      return;
    }

    setRsvpFailed(false);
    void rsvp({ id: meetingId, body: { status } })
      .unwrap()
      .catch(() => {
        setRsvpFailed(true);
      });
  };

  const handleJoin = () => {
    if (!meetingId) {
      return;
    }

    setJoinFailed(false);
    setIsJoining(true);
    void joinService
      .join(meetingId)
      .catch(() => {
        setJoinFailed(true);
      })
      .finally(() => {
        setIsJoining(false);
      });
  };

  return (
    <AppShell title={t('meetings.details.title')}>
      <QueryState
        isLoading={query.isLoading}
        isError={query.isError || !meetingId}
        isEmpty={!meeting}
        onRetry={() => {
          void query.refetch();
        }}
      >
        {meeting ? (
          <Card className={slots.base()}>
            <Card.Header className={slots.header()}>
              <Card.Title className={slots.title()}>{meeting.title}</Card.Title>
              <StatusBadge status={meeting.status} />
            </Card.Header>
            <Card.Content className="flex flex-col gap-4">
              <p className={slots.meta()}>
                {formatDateTime(meeting.starts_at, getActiveLanguage())}
                {' · '}
                {t('meetings.duration', { count: meeting.duration_min })}
                {' · '}
                {t('meetings.participants', {
                  count: meeting.participants_count,
                })}
              </p>
              <p>
                {t('meetings.rsvp.label')}
                {': '}
                {t(rsvpStatusKey(meeting.my_rsvp))}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  className={buttonVariants({ intent: 'primary', size: 'sm' })}
                  isDisabled={
                    rsvpState.isLoading || meeting.my_rsvp === 'accepted'
                  }
                  onPress={() => {
                    handleRsvp('accepted');
                  }}
                >
                  {t('meetings.rsvp.accept')}
                </Button>
                <Button
                  className={buttonVariants({ intent: 'danger', size: 'sm' })}
                  isDisabled={
                    rsvpState.isLoading || meeting.my_rsvp === 'declined'
                  }
                  onPress={() => {
                    handleRsvp('declined');
                  }}
                >
                  {t('meetings.rsvp.decline')}
                </Button>
                <Button
                  variant="secondary"
                  isPending={isJoining}
                  isDisabled={meeting.status === 'finished'}
                  onPress={handleJoin}
                >
                  {isJoining ? t('meetings.joining') : t('meetings.join')}
                </Button>
              </div>
              {rsvpFailed ? (
                <p role="alert">{t('meetings.rsvp.failed')}</p>
              ) : null}
              {joinFailed ? (
                <p role="alert">{t('meetings.joinFailed')}</p>
              ) : null}
            </Card.Content>
          </Card>
        ) : null}
      </QueryState>
      <Button
        variant="ghost"
        onPress={() => {
          navigate('/');
        }}
      >
        {t('common.back')}
      </Button>
    </AppShell>
  );
}
