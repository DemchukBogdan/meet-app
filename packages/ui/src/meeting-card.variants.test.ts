import { describe, expect, it } from 'vitest';

import { buttonVariants } from './button.variants';
import { meetingCardVariants } from './meeting-card.variants';
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

  it('adds the live ring only for an interactive live card', () => {
    const interactive = meetingCardVariants({
      status: 'live',
      interactive: true,
    });
    const staticCard = meetingCardVariants({
      status: 'live',
      interactive: false,
    });

    expect(interactive.base()).toContain('ring-emerald-400');
    expect(staticCard.base()).not.toContain('ring-emerald-400');
    expect(interactive.title()).toContain('font-semibold');
  });
});
