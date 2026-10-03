import { describe, expect, it } from 'vitest';

import { buttonVariants } from './button.variants';
import {
  meetingCardEmphasisClassName,
  meetingCardVariants,
  resolveMeetingCardEmphasis,
} from './meeting-card.variants';
import { statusBadgeVariants } from './status-badge.variants';

describe('tailwind variants', () => {
  it('applies default button variants', () => {
    const className = buttonVariants();

    expect(className).toContain('bg-teal-700');
    expect(className).toContain('h-10');
  });

  it('lets twMerge replace a conflicting spacing utility', () => {
    const className = buttonVariants({ size: 'sm', class: 'px-8' });
    const padding = className
      .split(' ')
      .filter((token) => token.startsWith('px-'));

    expect(padding).toEqual(['px-8']);
  });

  it('keeps status badge classes tied to meeting status', () => {
    expect(statusBadgeVariants({ status: 'live' })).toContain('bg-emerald-100');
  });

  it('adds the live ring only for an interactive live panel', () => {
    const interactive = meetingCardVariants({
      status: 'live',
      interactive: true,
      surface: 'panel',
    });
    const staticCard = meetingCardVariants({
      status: 'live',
      interactive: false,
      surface: 'panel',
    });

    expect(resolveMeetingCardEmphasis('live', true)).toBe('ring');
    expect(resolveMeetingCardEmphasis('live', false)).toBe('plain');
    expect(resolveMeetingCardEmphasis('finished', true)).toBe('plain');
    expect(interactive.base()).toContain(meetingCardEmphasisClassName.ring);
    expect(staticCard.base()).not.toContain('ring-emerald-400');
    expect(interactive.title()).toContain('font-semibold');
    expect(interactive.accent()).toContain('hidden');
  });

  it('paints a list row from the status accent and does not add the live ring', () => {
    const row = meetingCardVariants({
      status: 'live',
      interactive: true,
      surface: 'row',
    });
    const finished = meetingCardVariants({
      status: 'finished',
      interactive: true,
      surface: 'row',
    });

    expect(row.accent()).toContain('bg-emerald-500');
    expect(
      row
        .base()
        .split(' ')
        .filter((token) => token.startsWith('bg-')),
    ).toEqual(['bg-white']);
    expect(
      row
        .base()
        .split(' ')
        .filter((token) => token.startsWith('p-')),
    ).toEqual(['p-0']);
    expect(row.base()).toContain('flex');
    expect(row.base()).not.toContain('ring-emerald-400');
    expect(finished.base()).toContain('opacity-80');
    expect(finished.accent()).toContain('bg-stone-300');
  });
});
