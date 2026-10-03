import type { VariantProps } from 'tailwind-variants';

import { tv } from './tv';

import type { MeetingStatus } from '@meet/schemas';

const statusClassName = {
  scheduled: 'bg-sky-100 text-sky-800',
  live: 'bg-emerald-100 text-emerald-800',
  finished: 'bg-stone-200 text-stone-600',
} satisfies Record<MeetingStatus, string>;

export const statusBadgeVariants = tv({
  base: 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
  variants: {
    status: statusClassName,
  },
  defaultVariants: {
    status: 'scheduled',
  },
});

export type StatusBadgeVariantProps = VariantProps<typeof statusBadgeVariants>;
