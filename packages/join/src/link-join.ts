import type { JoinGateway, JoinService, UrlOpener } from './join-service';

export class LinkJoin implements JoinService {
  constructor(
    private readonly gateway: JoinGateway,
    private readonly opener: UrlOpener,
  ) {}

  async join(meetingId: string): Promise<void> {
    const payload = await this.gateway.fetchJoin(meetingId);
    this.opener.open(payload.join_url);
  }
}
