import { JOIN_WINDOW_MINUTES, MONTH_GENITIVE } from '../constants';

// types
import type { ZoomJoinTargetType } from '../types';

export function padTimePart(value: number | string): string {
  return String(value).padStart(2, '0');
}

export function parseServerTime(value: string): Date | null {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{2}) (\d{2}):(\d{2})$/);
  if (!match) {
    return null;
  }

  const month = Number(match[1]);
  const day = Number(match[2]);
  const year = 2000 + Number(match[3]);
  const hours = Number(match[4]);
  const minutes = Number(match[5]);

  return new Date(year, month - 1, day, hours, minutes);
}

export function buildEventDateTime(params: {
  year: number;
  month: number;
  day: number;
  hour: number | string;
  minutes: number | string;
}): Date {
  return new Date(
    params.year,
    params.month - 1,
    params.day,
    Number(params.hour),
    Number(params.minutes),
  );
}

export function formatWeekRange(params: {
  startDay: number;
  startMonth: number;
  endDay: number;
  endMonth: number;
}): string {
  const startMonthName = MONTH_GENITIVE[params.startMonth - 1] ?? '';
  const endMonthName = MONTH_GENITIVE[params.endMonth - 1] ?? '';

  if (params.startMonth === params.endMonth) {
    return `${params.startDay} ${startMonthName} - ${params.endDay} ${endMonthName}`;
  }

  return `${params.startDay} ${startMonthName} - ${params.endDay} ${endMonthName}`;
}

export function formatLessonDateLabel(params: {
  day: number;
  month: number;
}): string {
  const monthName = MONTH_GENITIVE[params.month - 1] ?? '';
  return `${params.day} ${monthName}`;
}

export function isJoinWindowOpen(params: {
  startAt: Date;
  endAt: Date;
  now: Date;
}): boolean {
  const openFrom = new Date(
    params.startAt.getTime() - JOIN_WINDOW_MINUTES * 60 * 1000,
  );

  return params.now >= openFrom && params.now <= params.endAt;
}

export function parseZoomJoinLink(link: string): ZoomJoinTargetType | null {
  try {
    const url = new URL(link);
    const conferenceNumber =
      url.searchParams.get('confno') ?? url.searchParams.get('confNo');
    if (conferenceNumber) {
      return {
        meetingNumber: conferenceNumber.replace(/\D/g, ''),
        password: url.searchParams.get('pwd') ?? '',
      };
    }

    const pathMatch = url.pathname.match(/\/j\/(\d+)/);
    const meetingNumber = pathMatch?.[1] ?? '';
    if (!meetingNumber) {
      return null;
    }

    return {
      meetingNumber,
      password: url.searchParams.get('pwd') ?? '',
    };
  } catch {
    return null;
  }
}

export function toZoomAppLink(link: string): string {
  const target = parseZoomJoinLink(link);
  if (!target) {
    return link;
  }

  const passwordQuery = target.password
    ? `&pwd=${encodeURIComponent(target.password)}`
    : '';
  return `zoommtg://zoom.us/join?confno=${target.meetingNumber}${passwordQuery}`;
}
