import { meetingStatusKey } from '@meet/i18n';
import { CalendarClock, CircleCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { MeetingStatus } from '@meet/schemas';
import type { LucideIcon } from 'lucide-react';

type StatusBadgeProps = {
  status: MeetingStatus;
};

const statusClassName = {
  scheduled: 'bg-sky-100 text-sky-800',
  live: 'bg-emerald-100 text-emerald-800',
  finished: 'bg-stone-200 text-stone-600',
} satisfies Record<MeetingStatus, string>;

const statusIcons = {
  scheduled: CalendarClock,
  finished: CircleCheck,
} satisfies Partial<Record<MeetingStatus, LucideIcon>>;

export function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useTranslation();
  const StatusIcon = status === 'live' ? null : statusIcons[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${statusClassName[status]}`}
    >
      {status === 'live' ? (
        <span className="relative flex size-2" aria-hidden>
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-70 motion-reduce:animate-none" />
          <span className="relative inline-flex size-2 rounded-full bg-emerald-600" />
        </span>
      ) : null}
      {StatusIcon ? <StatusIcon className="size-3.5" aria-hidden /> : null}
      {t(meetingStatusKey(status))}
    </span>
  );
}
