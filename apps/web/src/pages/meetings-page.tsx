import { Button } from '@heroui/react';
import { useMeetingsListViewModel } from '@meet/meetings';
import { buttonVariants } from '@meet/ui';
import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  LayoutGrid,
  Plus,
  Radio,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { usePageTitle } from '../components/app-shell';
import { MeetingCard } from '../components/meeting-card';
import { QueryState } from '../components/query-state';

import type { MeetingFilter } from '@meet/schemas';
import type { LucideIcon } from 'lucide-react';

const filterIcons = {
  all: LayoutGrid,
  scheduled: CalendarClock,
  live: Radio,
  finished: CircleCheck,
} satisfies Record<MeetingFilter, LucideIcon>;

export function MeetingsPage() {
  const navigate = useNavigate();
  const viewModel = useMeetingsListViewModel();
  usePageTitle(viewModel.title);

  return (
    <>
      <div className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1 rounded-xl bg-stone-100 p-1">
          {viewModel.filters.map((filter) => {
            const FilterIcon = filterIcons[filter.id];

            return (
              <button
                key={filter.id}
                type="button"
                aria-pressed={filter.isActive}
                className={
                  filter.isActive
                    ? 'inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-3 py-2 text-sm font-medium text-white shadow-sm'
                    : 'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-stone-600 transition hover:bg-white hover:text-stone-900'
                }
                onClick={() => {
                  viewModel.handleSelectFilter(filter.id);
                }}
              >
                <FilterIcon className="size-4" aria-hidden />
                {filter.label}
              </button>
            );
          })}
        </div>
        <Button
          className={buttonVariants({ intent: 'primary', size: 'md' })}
          onPress={() => {
            navigate('/meetings/new');
          }}
        >
          <Plus className="size-4" aria-hidden />
          {viewModel.createLabel}
        </Button>
      </div>
      <QueryState
        isLoading={viewModel.isLoading}
        isError={viewModel.isError}
        isEmpty={viewModel.isEmpty}
        loadingLabel={viewModel.loadingLabel}
        errorLabel={viewModel.errorLabel}
        emptyLabel={viewModel.emptyLabel}
        retryLabel={viewModel.retryLabel}
        onRetry={viewModel.handleRetry}
      >
        <div className="meet-stagger flex flex-col gap-3">
          {viewModel.meetings.map((meeting) => (
            <MeetingCard key={meeting.id} meeting={meeting} />
          ))}
        </div>
      </QueryState>
      {viewModel.showPagination ? (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white px-3 py-2 shadow-sm">
          <button
            type="button"
            className="inline-flex h-10 items-center gap-1 rounded-xl px-3 text-sm font-medium text-stone-700 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:text-stone-300 disabled:hover:bg-transparent"
            disabled={viewModel.isPreviousDisabled}
            onClick={viewModel.handlePreviousPage}
          >
            <ChevronLeft className="size-4" aria-hidden />
            {viewModel.previousPageLabel}
          </button>
          <p className="text-sm font-medium text-stone-500">
            {viewModel.paginationLabel}
          </p>
          <button
            type="button"
            className="inline-flex h-10 items-center gap-1 rounded-xl bg-teal-700 px-3 text-sm font-medium text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400"
            disabled={viewModel.isNextDisabled}
            onClick={viewModel.handleNextPage}
          >
            {viewModel.nextPageLabel}
            <ChevronRight className="size-4" aria-hidden />
          </button>
        </div>
      ) : null}
    </>
  );
}
