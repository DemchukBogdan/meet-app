import type { JoinPayload } from '@meet/schemas';

export interface JoinGateway {
  fetchJoin(meetingId: string): Promise<JoinPayload>;
}

export interface UrlOpener {
  open(url: string): void;
}

export type ZoomJoinRequest = {
  signature: string;
  meetingNumber: string;
  userName: string;
};

export interface ZoomSession {
  start(request: ZoomJoinRequest): Promise<void>;
}

export interface JoinService {
  join(meetingId: string): Promise<void>;
}
