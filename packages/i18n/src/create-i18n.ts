import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { defaultLanguage, resources } from './resources';

let isInitialized = false;

export function createI18n() {
  if (isInitialized) {
    return i18n;
  }

  void i18n.use(initReactI18next).init({
    resources,
    lng: defaultLanguage,
    fallbackLng: defaultLanguage,
    interpolation: { escapeValue: false },
    compatibilityJSON: 'v4',
    react: { useSuspense: false },
  });
  isInitialized = true;
  return i18n;
}

export function getActiveLanguage(): 'uk' | 'en' {
  return i18n.language === 'en' ? 'en' : 'uk';
}
