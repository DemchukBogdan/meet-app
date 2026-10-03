import { Button, Card } from '@heroui/react';
import { useMeetingDetailsViewModel } from '@meet/meetings';
import { buttonVariants, meetingCardVariants } from '@meet/ui';
import { ArrowLeft, Check, Clock, Timer, Users, Video, X } from 'lucide-react';
import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { usePageTitle } from '../components/app-shell';
import { QueryState } from '../components/query-state';
import { StatusBadge } from '../components/status-badge';
import { useJoinService } from '../join/join-service-context';

export function MeetingDetailsPage() {
  const { meetingId = '' } = useParams();
  const navigate = useNavigate();
  const joinService = useJoinService();
  const joinMeeting = useCallback(
    (id: string) => joinService.join(id),
    [joinService],
  );
  const viewModel = useMeetingDetailsViewModel({
    meetingId,
    joinMeeting,
  });
  usePageTitle(viewModel.title);
  const meeting = viewModel.meeting;
  const slots = meetingCardVariants({
    status: meeting?.status ?? 'scheduled',
    interactive: false,
  });

  return (
    <>
      <QueryState
        isLoading={viewModel.isLoading}
        isError={viewModel.isError}
        isEmpty={!meeting}
        loadingLabel={viewModel.loadingLabel}
        errorLabel={viewModel.errorLabel}
        emptyLabel={viewModel.notFoundLabel}
        retryLabel={viewModel.retryLabel}
        onRetry={viewModel.handleRetry}
      >
        {meeting ? (
          <Card className={slots.base()}>
            <Card.Header className={slots.header()}>
              <Card.Title className={slots.title()}>{meeting.title}</Card.Title>
              <StatusBadge status={meeting.status} />
            </Card.Header>
            <Card.Content className="flex flex-col gap-4">
              <div
                className={`${slots.meta()} flex flex-wrap items-center gap-x-3 gap-y-1`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-3.5" aria-hidden />
                  {viewModel.startsAtLabel}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Timer className="size-3.5" aria-hidden />
                  {viewModel.durationLabel}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="size-3.5" aria-hidden />
                  {viewModel.participantsLabel}
                </span>
              </div>
              <p>{viewModel.rsvpStatusLabel}</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  className={buttonVariants({ intent: 'primary', size: 'sm' })}
                  isDisabled={viewModel.isAcceptDisabled}
                  onPress={viewModel.handleAccept}
                >
                  <Check className="size-4" aria-hidden />
                  {viewModel.acceptLabel}
                </Button>
                <Button
                  className={buttonVariants({ intent: 'danger', size: 'sm' })}
                  isDisabled={viewModel.isDeclineDisabled}
                  onPress={viewModel.handleDecline}
                >
                  <X className="size-4" aria-hidden />
                  {viewModel.declineLabel}
                </Button>
                <Button
                  variant="secondary"
                  isPending={viewModel.isJoining}
                  isDisabled={viewModel.isJoinDisabled}
                  onPress={viewModel.handleJoin}
                >
                  <Video className="size-4" aria-hidden />
                  {viewModel.joinLabel}
                </Button>
              </div>
              {viewModel.rsvpErrorMessage ? (
                <p role="alert">{viewModel.rsvpErrorMessage}</p>
              ) : null}
              {viewModel.joinErrorMessage ? (
                <p role="alert">{viewModel.joinErrorMessage}</p>
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
        <ArrowLeft className="size-4" aria-hidden />
        {viewModel.backLabel}
      </Button>
    </>
  );
}
