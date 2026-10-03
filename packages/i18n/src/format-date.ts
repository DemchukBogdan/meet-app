import type { AppLanguage } from './resources';

const localeByLanguage = {
  uk: 'uk-UA',
  en: 'en-GB',
} as const satisfies Record<AppLanguage, string>;

export function formatDateTime(iso: string, language: AppLanguage): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }

  return new Intl.DateTimeFormat(localeByLanguage[language], {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}
