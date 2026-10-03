import { Button } from '@heroui/react';
import {
  setPage,
  setStatus,
  useListMeetingsQuery,
  useMeetDispatch,
  useMeetSelector,
} from '@meet/api';
import { meetingFilterKey } from '@meet/i18n';
import {
  MEETINGS_PAGE_SIZE,
  filterToStatus,
  meetingFilters,
} from '@meet/schemas';
import { buttonVariants } from '@meet/ui';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { AppShell } from '../components/app-shell';
import { MeetingCard } from '../components/meeting-card';
import { QueryState } from '../components/query-state';

export function MeetingsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useMeetDispatch();
  const filters = useMeetSelector((state) => state.meetingsFilters);
  const query = useListMeetingsQuery({
    page: filters.page,
    per_page: MEETINGS_PAGE_SIZE,
    ...(filters.status ? { status: filters.status } : {}),
  });
  const total = query.data?.meta.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / MEETINGS_PAGE_SIZE));
  const activeFilter = filters.status ?? 'all';

  useEffect(() => {
    // The active filter can shrink the list below the page that was open.
    if (query.data && filters.page > pages) {
      dispatch(setPage(pages));
    }
  }, [dispatch, filters.page, pages, query.data]);

  return (
    <AppShell title={t('meetings.title')}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {meetingFilters.map((filter) => (
            <Button
              key={filter}
              size="sm"
              variant={activeFilter === filter ? 'primary' : 'secondary'}
              className={buttonVariants({
                intent: activeFilter === filter ? 'primary' : 'secondary',
                size: 'sm',
              })}
              onPress={() => {
                dispatch(setStatus(filterToStatus(filter)));
              }}
            >
              {t(meetingFilterKey(filter))}
            </Button>
          ))}
        </div>
        <Button
          className={buttonVariants({ intent: 'primary', size: 'md' })}
          onPress={() => {
            navigate('/meetings/new');
          }}
        >
          {t('meetings.create')}
        </Button>
      </div>
      <QueryState
        isLoading={query.isLoading}
        isError={query.isError}
        isEmpty={!query.data?.data.length}
        onRetry={() => {
          void query.refetch();
        }}
      >
        <div className="flex flex-col gap-3">
          {query.data?.data.map((meeting) => (
            <MeetingCard key={meeting.id} meeting={meeting} />
          ))}
        </div>
      </QueryState>
      {total > MEETINGS_PAGE_SIZE ? (
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="secondary"
            isDisabled={filters.page <= 1}
            onPress={() => {
              dispatch(setPage(filters.page - 1));
            }}
          >
            {t('meetings.pagination.previous')}
          </Button>
          <p>{t('meetings.pagination.label', { page: filters.page, pages })}</p>
          <Button
            variant="secondary"
            isDisabled={filters.page >= pages}
            onPress={() => {
              dispatch(setPage(filters.page + 1));
            }}
          >
            {t('meetings.pagination.next')}
          </Button>
        </div>
      ) : null}
    </AppShell>
  );
}
