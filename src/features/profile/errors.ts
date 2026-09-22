export class BukiProfileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BukiProfileError';
  }
}
