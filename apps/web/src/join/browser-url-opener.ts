import type { UrlOpener } from '@meet/join';

export class BrowserUrlOpener implements UrlOpener {
  open(url: string): void {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
