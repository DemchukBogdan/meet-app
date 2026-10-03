import { Button } from '@heroui/react';
import { CalendarOff, CircleAlert, RotateCcw } from 'lucide-react';

import { PageLoader } from './page-loader';

import type { ReactNode } from 'react';

type QueryStateProps = {
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  loadingLabel: string;
  errorLabel: string;
  emptyLabel: string;
  retryLabel: string;
  onRetry: () => void;
  children: ReactNode;
};

export function QueryState({
  isLoading,
  isError,
  isEmpty,
  loadingLabel,
  errorLabel,
  emptyLabel,
  retryLabel,
  onRetry,
  children,
}: QueryStateProps) {
  if (isLoading) {
    return <PageLoader label={loadingLabel} />;
  }

  if (isError) {
    return (
      <div
        className="flex flex-col items-start gap-3 rounded-2xl border border-red-100 bg-white px-5 py-8 shadow-sm"
        role="alert"
      >
        <span className="flex size-10 items-center justify-center rounded-full bg-red-50 text-red-700">
          <CircleAlert className="size-5" aria-hidden />
        </span>
        <p>{errorLabel}</p>
        <Button variant="secondary" onPress={onRetry}>
          <RotateCcw className="size-4" aria-hidden />
          {retryLabel}
        </Button>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-stone-300 bg-white px-5 py-12 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-stone-100 text-stone-500">
          <CalendarOff className="size-6" aria-hidden />
        </span>
        <p className="text-stone-600">{emptyLabel}</p>
      </div>
    );
  }

  return children;
}
