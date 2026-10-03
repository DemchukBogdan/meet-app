export class MissingZoomPayloadError extends Error {
  constructor() {
    super('Join payload does not include a Zoom signature.');
    this.name = 'MissingZoomPayloadError';
  }
}
