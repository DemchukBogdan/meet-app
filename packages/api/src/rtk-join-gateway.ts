import type { JoinGateway } from '@meet/join';
import type { JoinPayload } from '@meet/schemas';

import { meetingsApi } from './meetings.api';

import type { MeetDispatch } from './store';

export class RtkJoinGateway implements JoinGateway {
  constructor(private readonly dispatch: MeetDispatch) {}

  fetchJoin(meetingId: string): Promise<JoinPayload> {
    return this.dispatch(
      meetingsApi.endpoints.getJoin.initiate(meetingId, {
        forceRefetch: true,
        subscribe: false,
      }),
    ).unwrap();
  }
}
