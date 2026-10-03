export class MediaPermissionDeniedError extends Error {
  constructor() {
    super('Media permission denied');
    this.name = 'MediaPermissionDeniedError';
  }
}
