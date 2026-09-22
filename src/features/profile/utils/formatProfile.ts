import { HOURS_COUNTS } from '../constants';

export function getNameInitial(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) {
    return '?';
  }

  return trimmed.slice(0, 1).toUpperCase();
}

export function getHoursLabel(count: number): string {
  const absolute = Math.abs(count) % 100;
  const lastDigit = absolute % 10;

  if (absolute > 10 && absolute < 20) {
    return HOURS_COUNTS[2];
  }

  if (lastDigit === 1) {
    return HOURS_COUNTS[0];
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return HOURS_COUNTS[1];
  }

  return HOURS_COUNTS[2];
}
