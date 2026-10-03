import en from './locales/en.json';
import uk from './locales/uk.json';

const english: typeof uk = en;

export const resources = {
  uk: { translation: uk },
  en: { translation: english },
} as const;

export const defaultLanguage = 'uk' as const;

export type AppLanguage = keyof typeof resources;
