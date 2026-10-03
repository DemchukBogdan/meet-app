import { Button } from '@heroui/react';
import { Languages, LogOut, Video } from 'lucide-react';
import {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation } from 'react-router-dom';

import { useAuthSession } from '../features/auth/auth-session-context';
import { PageLoader } from './page-loader';

const languages = ['uk', 'en'] as const;

const languageLabelKey = {
  uk: 'language.uk',
  en: 'language.en',
} as const;

type PageTitleContextValue = {
  setTitle: (title: string) => void;
};

const PageTitleContext = createContext<PageTitleContextValue | null>(null);

export function usePageTitle(title: string): void {
  const pageTitle = useContext(PageTitleContext);

  // The shell owns the header, so each route publishes its title before paint.
  useLayoutEffect(() => {
    pageTitle?.setTitle(title);
  }, [pageTitle, title]);

  if (!pageTitle) {
    throw new Error('Page title is not provided.');
  }
}

export function AppShell() {
  const { i18n, t } = useTranslation();
  const { isAuthenticated, isReady, logout } = useAuthSession();
  const location = useLocation();
  const [title, setTitle] = useState('');
  const pageTitle = useMemo<PageTitleContextValue>(
    () => ({ setTitle }),
    [setTitle],
  );

  if (!isReady) {
    return <PageLoader label={t('common.loading')} fill />;
  }

  return (
    <PageTitleContext.Provider value={pageTitle}>
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-8">
        <header className="meet-rise flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-teal-700 text-white shadow-sm shadow-teal-900/15">
              <Video className="size-5" aria-hidden />
            </span>
            <div>
              <p className="text-sm text-stone-500">Meet</p>
              <h1 className="text-2xl font-semibold text-stone-900">{title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Button size="sm" variant="ghost" onPress={logout}>
                <LogOut className="size-4" aria-hidden />
                {t('auth.logout')}
              </Button>
            ) : null}
            <div
              className="flex items-center gap-1 rounded-full bg-white p-1 shadow-sm ring-1 ring-stone-200"
              aria-label={t('language.label')}
            >
              <Languages className="ml-2 size-4 text-stone-400" aria-hidden />
              {languages.map((language) => {
                const isActive = i18n.resolvedLanguage === language;

                return (
                  <button
                    key={language}
                    type="button"
                    className={
                      isActive
                        ? 'rounded-full bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white'
                        : 'rounded-full px-3 py-1.5 text-xs font-medium text-stone-500 transition hover:text-stone-900'
                    }
                    aria-pressed={isActive}
                    onClick={() => {
                      void i18n.changeLanguage(language);
                    }}
                  >
                    {t(languageLabelKey[language])}
                  </button>
                );
              })}
            </div>
          </div>
        </header>
        <div key={location.pathname} className="meet-rise flex flex-col gap-6">
          <Outlet />
        </div>
      </div>
    </PageTitleContext.Provider>
  );
}
