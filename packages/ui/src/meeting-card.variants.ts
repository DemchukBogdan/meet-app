import type { VariantProps } from 'tailwind-variants';

import type { MeetingStatus } from '@meet/schemas';

import { tv } from './tv';

const statusSlot = {
  scheduled: {
    base: 'border-sky-200 bg-sky-50/40',
  },
  live: {
    base: 'border-emerald-300 bg-emerald-50/50',
  },
  finished: {
    base: 'border-stone-200 bg-stone-50 opacity-80',
  },
} satisfies Record<MeetingStatus, { base: string }>;

/**
 * Class contract shared by web and, as keys, by React Native.
 * `slots` paint the shell, header, title, and meta separately.
 * `compoundVariants` adds the live ring only when the card is also interactive,
 * so a static live card does not look clickable.
 * `tv` comes from createTV({ twMerge: true }): a later utility replaces an earlier one.
 */
export const meetingCardVariants = tv({
  slots: {
    base: 'block w-full rounded-2xl border p-4 text-left transition-shadow',
    header: 'flex items-start justify-between gap-3',
    title: 'text-base font-semibold text-stone-900',
    meta: 'mt-2 text-sm text-stone-600',
  },
  variants: {
    status: statusSlot,
    interactive: {
      true: {
        base: 'cursor-pointer hover:shadow-md',
      },
      false: {
        base: 'cursor-default',
      },
    },
  },
  compoundVariants: [
    {
      status: 'live',
      interactive: true,
      class: {
        base: 'ring-2 ring-emerald-400 hover:ring-emerald-500',
      },
    },
  ],
  defaultVariants: {
    status: 'scheduled',
    interactive: false,
  },
});

export type MeetingCardVariantProps = VariantProps<typeof meetingCardVariants>;
