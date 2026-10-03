import type { ZoomJoinRequest, ZoomSession } from '@meet/join';

type ZoomStarter = (request: ZoomJoinRequest) => Promise<void>;

export class ZoomSessionBridge implements ZoomSession {
  private starter: ZoomStarter | null = null;

  connect(starter: ZoomStarter): void {
    this.starter = starter;
  }

  start(request: ZoomJoinRequest): Promise<void> {
    if (!this.starter) {
      return Promise.reject(new Error('Zoom session bridge is not connected.'));
    }

    return this.starter(request);
  }
}
