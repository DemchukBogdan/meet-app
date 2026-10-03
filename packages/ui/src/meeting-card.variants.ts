import type { VariantProps } from 'tailwind-variants';

import type { MeetingStatus } from '@meet/schemas';

import { tv } from './tv';

export type MeetingCardEmphasisType = 'plain' | 'ring';

/**
 * Shared by these classes and by React Native styles.
 * A ring means "this live meeting can be opened". A static or finished card stays quiet,
 * so status color is not mistaken for a click target.
 */
export function resolveMeetingCardEmphasis(
  status: MeetingStatus,
  interactive: boolean,
): MeetingCardEmphasisType {
  if (status === 'live' && interactive) {
    return 'ring';
  }

  return 'plain';
}

export const meetingCardEmphasisClassName = {
  plain: '',
  ring: 'ring-2 ring-emerald-400 hover:ring-emerald-500',
} as const satisfies Record<MeetingCardEmphasisType, string>;

const statusAccent = {
  scheduled: {
    accent: 'bg-sky-500',
  },
  live: {
    accent: 'bg-emerald-500',
  },
  finished: {
    accent: 'bg-stone-300',
    base: 'opacity-80',
  },
} satisfies Record<MeetingStatus, { accent: string; base?: string }>;

const panelStatusClassName = {
  scheduled: 'border-sky-200 bg-sky-50/40',
  live: 'border-emerald-300 bg-emerald-50/50',
  finished: 'border-stone-200 bg-stone-50',
} as const satisfies Record<MeetingStatus, string>;

/**
 * One class contract for both surfaces.
 * `panel` is the details card: status paints the shell.
 * `row` is the list card: status paints the accent, the shell stays neutral.
 * The live ring is `meetingCardEmphasisClassName`, and only the panel uses it.
 * A list row already shows a press affordance by lifting.
 */
export const meetingCardVariants = tv({
  slots: {
    base: 'block w-full rounded-2xl border text-left transition-shadow',
    accent: 'shrink-0',
    header: 'flex items-start justify-between gap-3',
    title: 'text-base font-semibold text-stone-900',
    meta: 'mt-2 text-sm text-stone-600',
  },
  variants: {
    status: statusAccent,
    interactive: {
      true: {
        base: 'cursor-pointer hover:shadow-md',
      },
      false: {
        base: 'cursor-default',
      },
    },
    surface: {
      panel: {
        base: 'p-4',
        accent: 'hidden',
      },
      row: {
        base: 'group flex overflow-hidden border-stone-200 bg-white p-0 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md motion-reduce:transform-none',
        accent: 'w-1.5 self-stretch',
      },
    },
  },
  compoundVariants: [
    {
      surface: 'panel',
      status: 'scheduled',
      class: { base: panelStatusClassName.scheduled },
    },
    {
      surface: 'panel',
      status: 'live',
      class: { base: panelStatusClassName.live },
    },
    {
      surface: 'panel',
      status: 'finished',
      class: { base: panelStatusClassName.finished },
    },
    {
      surface: 'panel',
      status: 'live',
      interactive: true,
      class: { base: meetingCardEmphasisClassName.ring },
    },
  ],
  defaultVariants: {
    status: 'scheduled',
    interactive: false,
    surface: 'panel',
  },
});

export type MeetingCardVariantProps = VariantProps<typeof meetingCardVariants>;
