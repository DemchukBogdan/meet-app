import type { ZoomJoinTargetType } from '../types';

export function parseZoomJoinTarget(
  value: string,
  fallbackPassword = '',
): ZoomJoinTargetType | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (
    /^https?:/i.test(trimmed) ||
    trimmed.includes('zoom.us') ||
    trimmed.startsWith('zoommtg:')
  ) {
    return parseZoomJoinLink(trimmed, fallbackPassword);
  }

  const meetingNumber = trimmed.replace(/\D/g, '');
  if (meetingNumber.length < 9) {
    return null;
  }

  return {
    meetingNumber,
    password: fallbackPassword,
  };
}

function parseZoomJoinLink(
  link: string,
  fallbackPassword: string,
): ZoomJoinTargetType | null {
  try {
    const url = new URL(link);
    const conferenceNumber =
      url.searchParams.get('confno') ?? url.searchParams.get('confNo');
    if (conferenceNumber) {
      return {
        meetingNumber: conferenceNumber.replace(/\D/g, ''),
        password: url.searchParams.get('pwd') ?? fallbackPassword,
      };
    }

    const pathMatch = url.pathname.match(/\/j\/(\d+)/);
    const meetingNumber = pathMatch?.[1] ?? '';
    if (!meetingNumber) {
      return null;
    }

    return {
      meetingNumber,
      password: url.searchParams.get('pwd') ?? fallbackPassword,
    };
  } catch {
    return null;
  }
}
