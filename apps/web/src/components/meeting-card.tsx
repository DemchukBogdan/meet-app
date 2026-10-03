import { formatDateTime, getActiveLanguage } from '@meet/i18n';
import { meetingCardVariants } from '@meet/ui';
import { ChevronRight, Clock, Timer, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { StatusBadge } from './status-badge';

import type { Meeting } from '@meet/schemas';
import type { LucideIcon } from 'lucide-react';

type MeetingCardProps = {
  meeting: Meeting;
};

export function MeetingCard({ meeting }: MeetingCardProps) {
  const { t } = useTranslation();
  const slots = meetingCardVariants({
    status: meeting.status,
    interactive: true,
    surface: 'row',
  });

  return (
    <Link to={`/meetings/${meeting.id}`} className={slots.base()}>
      <span className={slots.accent()} aria-hidden />
      <span className="flex min-w-0 flex-1 items-center gap-4 px-4 py-4 sm:px-5">
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-lg font-semibold tracking-tight text-stone-900">
              {meeting.title}
            </span>
            <StatusBadge status={meeting.status} />
          </span>
          <span className="mt-3 flex flex-wrap gap-2">
            <MetaChip icon={Clock}>
              {formatDateTime(meeting.starts_at, getActiveLanguage())}
            </MetaChip>
            <MetaChip icon={Timer}>
              {t('meetings.duration', { count: meeting.duration_min })}
            </MetaChip>
            <MetaChip icon={Users}>
              {t('meetings.participants', {
                count: meeting.participants_count,
              })}
            </MetaChip>
          </span>
        </span>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-500 transition group-hover:bg-teal-700 group-hover:text-white">
          <ChevronRight className="size-5" aria-hidden />
        </span>
      </span>
    </Link>
  );
}

function MetaChip({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-600">
      <Icon className="size-3.5" aria-hidden />
      {children}
    </span>
  );
}
