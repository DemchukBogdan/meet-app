export class MeetAppProfileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MeetAppProfileError';
  }
}
