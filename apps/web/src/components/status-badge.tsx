import { Chip } from '@heroui/react';
import { meetingStatusKey } from '@meet/i18n';
import { statusBadgeVariants } from '@meet/ui';
import { useTranslation } from 'react-i18next';

import type { MeetingStatus } from '@meet/schemas';

type StatusBadgeProps = {
  status: MeetingStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useTranslation();

  return (
    <Chip className={statusBadgeVariants({ status })}>
      {t(meetingStatusKey(status))}
    </Chip>
  );
}
