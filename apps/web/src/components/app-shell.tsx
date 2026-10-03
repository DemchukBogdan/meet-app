import { Button } from '@heroui/react';
import { useTranslation } from 'react-i18next';

import type { ReactNode } from 'react';

const languages = ['uk', 'en'] as const;

type AppShellProps = {
  title: string;
  children: ReactNode;
};

export function AppShell({ title, children }: AppShellProps) {
  const { i18n, t } = useTranslation();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-stone-500">Meet</p>
          <h1 className="text-2xl font-semibold text-stone-900">{title}</h1>
        </div>
        <div className="flex gap-2" aria-label={t('language.label')}>
          {languages.map((language) => (
            <Button
              key={language}
              size="sm"
              variant={i18n.resolvedLanguage === language ? 'primary' : 'ghost'}
              onPress={() => {
                void i18n.changeLanguage(language);
              }}
            >
              {t(language === 'uk' ? 'language.uk' : 'language.en')}
            </Button>
          ))}
        </div>
      </header>
      {children}
    </div>
  );
}
