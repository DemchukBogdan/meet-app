import { MissingZoomPayloadError } from './errors';

import type { JoinGateway, JoinService, ZoomSession } from './join-service';

export class ZoomNativeJoin implements JoinService {
  constructor(
    private readonly gateway: JoinGateway,
    private readonly session: ZoomSession,
    private readonly userName: string,
  ) {}

  async join(meetingId: string): Promise<void> {
    const payload = await this.gateway.fetchJoin(meetingId);
    const zoom = payload.zoom;
    if (!zoom) {
      throw new MissingZoomPayloadError();
    }

    await this.session.start({
      signature: zoom.signature,
      meetingNumber: zoom.meeting_number,
      userName: this.userName,
    });
  }
}
