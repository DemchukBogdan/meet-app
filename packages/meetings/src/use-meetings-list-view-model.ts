import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

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

import type { AppLanguage } from '@meet/i18n';
import type { Meeting, MeetingFilter } from '@meet/schemas';
import type { MeetingsListViewModelType } from './types';

const EMPTY_MEETINGS: Meeting[] = [];

function resolvePageCount(total: number): number {
  return Math.max(1, Math.ceil(total / MEETINGS_PAGE_SIZE));
}

function resolveOppositeLanguage(language: string | undefined): AppLanguage {
  return language === 'en' ? 'uk' : 'en';
}

export function useMeetingsListViewModel(): MeetingsListViewModelType {
  const { i18n, t } = useTranslation();
  const dispatch = useMeetDispatch();
  const filters = useMeetSelector((state) => state.meetingsFilters);
  const query = useListMeetingsQuery({
    page: filters.page,
    per_page: MEETINGS_PAGE_SIZE,
    ...(filters.status ? { status: filters.status } : {}),
  });
  const total = query.data?.meta.total ?? 0;
  const pages = resolvePageCount(total);
  const activeFilter = filters.status ?? 'all';
  const meetings = query.data?.data ?? EMPTY_MEETINGS;
  const oppositeLanguage = resolveOppositeLanguage(i18n.resolvedLanguage);
  const { refetch } = query;

  // The active filter can shrink the list below the page that was open.
  useEffect(() => {
    if (query.data && filters.page > pages) {
      dispatch(setPage(pages));
    }
  }, [dispatch, filters.page, pages, query.data]);

  const filterItems = useMemo(
    () =>
      meetingFilters.map((filter) => ({
        id: filter,
        label: t(meetingFilterKey(filter)),
        isActive: activeFilter === filter,
      })),
    [activeFilter, t],
  );

  const handleSelectFilter = useCallback(
    (filter: MeetingFilter) => {
      dispatch(setStatus(filterToStatus(filter)));
    },
    [dispatch],
  );

  const handlePreviousPage = useCallback(() => {
    dispatch(setPage(filters.page - 1));
  }, [dispatch, filters.page]);

  const handleNextPage = useCallback(() => {
    dispatch(setPage(filters.page + 1));
  }, [dispatch, filters.page]);

  const handleRetry = useCallback(() => {
    void refetch();
  }, [refetch]);

  const handleToggleLanguage = useCallback(() => {
    void i18n.changeLanguage(oppositeLanguage);
  }, [i18n, oppositeLanguage]);

  return {
    title: t('meetings.title'),
    createLabel: t('meetings.create'),
    loadingLabel: t('common.loading'),
    errorLabel: t('common.error'),
    emptyLabel: t('common.empty'),
    retryLabel: t('common.retry'),
    meetings,
    isLoading: query.isLoading,
    isError: query.isError,
    isEmpty: !query.isLoading && !query.isError && meetings.length === 0,
    filters: filterItems,
    showPagination: total > MEETINGS_PAGE_SIZE,
    isPreviousDisabled: filters.page <= 1,
    isNextDisabled: filters.page >= pages,
    previousPageLabel: t('meetings.pagination.previous'),
    nextPageLabel: t('meetings.pagination.next'),
    paginationLabel: t('meetings.pagination.label', {
      page: filters.page,
      pages,
    }),
    oppositeLanguageLabel: t(
      oppositeLanguage === 'uk' ? 'language.uk' : 'language.en',
    ),
    handleSelectFilter,
    handlePreviousPage,
    handleNextPage,
    handleRetry,
    handleToggleLanguage,
  };
}
