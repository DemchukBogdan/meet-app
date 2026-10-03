import { formatDateTime, getActiveLanguage } from '@meet/i18n';
import { meetingCardVariants } from '@meet/ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { StatusBadge } from './status-badge';

import type { Meeting } from '@meet/schemas';

type MeetingCardProps = {
  meeting: Meeting;
};

export function MeetingCard({ meeting }: MeetingCardProps) {
  const { t } = useTranslation();
  const slots = meetingCardVariants({
    status: meeting.status,
    interactive: true,
  });

  return (
    <Link to={`/meetings/${meeting.id}`} className={slots.base()}>
      <div className={slots.header()}>
        <span className={slots.title()}>{meeting.title}</span>
        <StatusBadge status={meeting.status} />
      </div>
      <p className={slots.meta()}>
        {formatDateTime(meeting.starts_at, getActiveLanguage())}
        {' · '}
        {t('meetings.duration', { count: meeting.duration_min })}
        {' · '}
        {t('meetings.participants', { count: meeting.participants_count })}
      </p>
    </Link>
  );
}
