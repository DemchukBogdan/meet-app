export class BukiCalendarError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BukiCalendarError';
  }
}
