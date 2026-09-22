import { isRecord } from '@/shared/utils/isRecord';

// types
import type { CreatedZoomMeetingType } from '../types';

const ZOOM_API_BASE_URL = 'https://api.zoom.us/v2';
const ZOOM_OAUTH_TOKEN_URL = 'https://zoom.us/oauth/token';

type CreateZoomInstantMeetingParamsType = {
  accessToken: string;
  userEmail: string;
  topic: string;
};

type ZoomS2STokenParamsType = {
  accountId: string;
  clientId: string;
  clientSecret: string;
};

type ZoomCreateMeetingResponseType = {
  id?: number | string;
  password?: string;
  join_url?: string;
  start_url?: string;
  topic?: string;
};

type ZoomZakResponseType = {
  token?: string;
};

function readStringField(value: unknown, key: string): string {
  if (!isRecord(value)) {
    return '';
  }

  const field = value[key];
  return typeof field === 'string' ? field : '';
}

function getZoomOAuthErrorMessage(payload: unknown, status: number): string {
  const description =
    readStringField(payload, 'error_description') ||
    readStringField(payload, 'reason') ||
    readStringField(payload, 'error');
  const hint =
    ' Confirm the Server-to-Server OAuth app is activated and has meeting:write:meeting:admin plus user:read:token:admin.';

  return description
    ? `Zoom OAuth ${status}: ${description}.${hint}`
    : `Zoom OAuth ${status}.${hint}`;
}

function getZakFromStartUrl(startUrl: string): string {
  try {
    return new URL(startUrl).searchParams.get('zak') ?? '';
  } catch {
    return '';
  }
}

function encodeBasicAuth(clientId: string, clientSecret: string): string {
  return btoa(`${clientId}:${clientSecret}`);
}

export async function getZoomS2SAccessToken({
  accountId,
  clientId,
  clientSecret,
}: ZoomS2STokenParamsType): Promise<string> {
  const tokenUrl = new URL(ZOOM_OAUTH_TOKEN_URL);
  tokenUrl.searchParams.set('grant_type', 'account_credentials');
  tokenUrl.searchParams.set('account_id', accountId);

  const response = await fetch(tokenUrl.toString(), {
    method: 'POST',
    headers: {
      Authorization: `Basic ${encodeBasicAuth(clientId, clientSecret)}`,
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'account_credentials',
      account_id: accountId,
    }).toString(),
  });

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(getZoomOAuthErrorMessage(payload, response.status));
  }

  const accessToken = readStringField(payload, 'access_token');
  if (!accessToken) {
    throw new Error('Zoom OAuth did not return an access token.');
  }

  return accessToken;
}

async function zoomApiRequest<ResponseType>(params: {
  accessToken: string;
  path: string;
  method?: 'GET' | 'POST';
  body?: unknown;
}): Promise<ResponseType> {
  const response = await fetch(`${ZOOM_API_BASE_URL}${params.path}`, {
    method: params.method ?? 'GET',
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: params.body ? JSON.stringify(params.body) : undefined,
  });

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      readStringField(payload, 'message') || `Zoom API ${response.status}`
    );
  }

  return payload as ResponseType;
}

export async function createZoomInstantMeeting({
  accessToken,
  userEmail,
  topic,
}: CreateZoomInstantMeetingParamsType): Promise<CreatedZoomMeetingType> {
  const meeting = await zoomApiRequest<ZoomCreateMeetingResponseType>({
    accessToken,
    path: `/users/${encodeURIComponent(userEmail)}/meetings`,
    method: 'POST',
    body: {
      topic,
      type: 1,
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: true,
        waiting_room: false,
      },
    },
  });

  if (meeting.id == null) {
    throw new Error('Zoom created a meeting without an id.');
  }

  return {
    meetingNumber: String(meeting.id),
    password: meeting.password ?? '',
    joinUrl: meeting.join_url ?? '',
    topic: meeting.topic ?? topic,
    hostAccessToken: getZakFromStartUrl(meeting.start_url ?? ''),
  };
}

export async function getZoomAccessKey(params: {
  accessToken: string;
  userEmail: string;
}): Promise<string> {
  const zak = await zoomApiRequest<ZoomZakResponseType>({
    accessToken: params.accessToken,
    path: `/users/${encodeURIComponent(params.userEmail)}/token?type=zak`,
  });

  if (!zak.token) {
    throw new Error('Zoom did not return a ZAK token.');
  }

  return zak.token;
}
