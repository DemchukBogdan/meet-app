import type uk from './locales/uk.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: typeof uk;
    };
  }
}

export const i18nTypesLoaded = true;
