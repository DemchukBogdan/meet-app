import { Spinner } from '@heroui/react';
import { Video } from 'lucide-react';

type PageLoaderProps = {
  label: string;
  fill?: boolean;
};

export function PageLoader({ label, fill = false }: PageLoaderProps) {
  return (
    <div
      className={
        fill
          ? 'flex min-h-screen flex-col items-center justify-center gap-4'
          : 'flex flex-col items-center justify-center gap-4 py-16'
      }
      role="status"
    >
      <span className="flex size-14 items-center justify-center rounded-2xl bg-teal-700 text-white shadow-md shadow-teal-900/10">
        <Video className="size-6" aria-hidden />
      </span>
      <Spinner color="accent" size="lg" />
      <p className="text-sm text-stone-600">{label}</p>
    </div>
  );
}
