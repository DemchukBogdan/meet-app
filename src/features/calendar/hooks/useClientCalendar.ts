// react
import { useCallback, useEffect, useMemo, useState } from 'react';

// api
import { getClientCalendarWeek } from '../api/bukiCalendarApi';

// constants
import { CALENDAR_LOAD_ERROR } from '../constants';

// types
import type { CalendarLessonType, CalendarWeekType } from '../types';

export function useClientCalendar() {
  const [page, setPage] = useState(0);
  const [week, setWeek] = useState<CalendarWeekType | null>(null);
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadWeek = useCallback(async (nextPage: number) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const nextWeek = await getClientCalendarWeek(nextPage);
      setWeek(nextWeek);
      const today = nextWeek.days.find((day) => day.isToday);
      setSelectedDayKey(today?.key ?? nextWeek.days[0]?.key ?? null);
    } catch {
      setErrorMessage(CALENDAR_LOAD_ERROR);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load the selected calendar week after login and on page changes.
  useEffect(() => {
    void loadWeek(page);
  }, [loadWeek, page]);

  const handlePrevWeek = useCallback(() => {
    setPage((current) => current - 1);
  }, []);

  const handleNextWeek = useCallback(() => {
    setPage((current) => current + 1);
  }, []);

  const handleSelectDay = useCallback((dayKey: string) => {
    setSelectedDayKey(dayKey);
  }, []);

  const handleRetry = useCallback(() => {
    void loadWeek(page);
  }, [loadWeek, page]);

  const dayLessons = useMemo(() => {
    if (!week || !selectedDayKey) {
      return [] as CalendarLessonType[];
    }

    return week.lessons.filter((lesson) => lesson.dateKey === selectedDayKey);
  }, [selectedDayKey, week]);

  return {
    week,
    selectedDayKey,
    dayLessons,
    isLoading,
    errorMessage,
    handlePrevWeek,
    handleNextWeek,
    handleSelectDay,
    handleRetry,
  };
}
