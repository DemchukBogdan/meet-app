import { Button, Spinner } from '@heroui/react';
import { useTranslation } from 'react-i18next';

import type { ReactNode } from 'react';

type QueryStateProps = {
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  onRetry: () => void;
  children: ReactNode;
};

export function QueryState({
  isLoading,
  isError,
  isEmpty,
  onRetry,
  children,
}: QueryStateProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-3 py-16">
        <Spinner />
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-start gap-3 py-8" role="alert">
        <p>{t('common.error')}</p>
        <Button variant="secondary" onPress={onRetry}>
          {t('common.retry')}
        </Button>
      </div>
    );
  }

  if (isEmpty) {
    return <p className="py-8 text-stone-600">{t('common.empty')}</p>;
  }

  return children;
}
