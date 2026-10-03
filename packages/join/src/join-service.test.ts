import { describe, expect, it, vi } from 'vitest';

import { LinkJoin } from './link-join';
import { MissingZoomPayloadError } from './errors';
import { ZoomNativeJoin } from './zoom-native-join';

import type { JoinGateway, UrlOpener, ZoomSession } from './join-service';
import type { JoinPayload } from '@meet/schemas';

const payload: JoinPayload = {
  join_url: 'https://zoom.us/j/100',
  zoom: {
    meeting_number: '100',
    signature: 'signed-by-backend',
  },
};

describe('JoinService implementations', () => {
  it('opens the join url without touching a native SDK', async () => {
    const gateway: JoinGateway = {
      fetchJoin: vi.fn().mockResolvedValue(payload),
    };
    const opener: UrlOpener = { open: vi.fn() };

    await new LinkJoin(gateway, opener).join('meet-1');

    expect(opener.open).toHaveBeenCalledWith(payload.join_url);
  });

  it('passes the backend signature to the native session', async () => {
    const gateway: JoinGateway = {
      fetchJoin: vi.fn().mockResolvedValue(payload),
    };
    const session: ZoomSession = {
      start: vi.fn().mockResolvedValue(undefined),
    };

    await new ZoomNativeJoin(gateway, session, 'Olena').join('meet-1');

    expect(session.start).toHaveBeenCalledWith({
      signature: 'signed-by-backend',
      meetingNumber: '100',
      userName: 'Olena',
    });
  });

  it('refuses to start a native session when the payload has no signature', async () => {
    const gateway: JoinGateway = {
      fetchJoin: vi.fn().mockResolvedValue({ join_url: payload.join_url }),
    };
    const session: ZoomSession = { start: vi.fn() };

    await expect(
      new ZoomNativeJoin(gateway, session, 'Olena').join('meet-1'),
    ).rejects.toBeInstanceOf(MissingZoomPayloadError);
    expect(session.start).not.toHaveBeenCalled();
  });
});
