// constants
import { WEEKDAY_LABELS } from '../constants';

// utils
import {
  buildEventDateTime,
  formatLessonDateLabel,
  formatWeekRange,
  padTimePart,
} from '../utils/formatCalendar';

// types
import type {
  CalendarDayType,
  CalendarLessonType,
  CalendarWeekType,
} from '../types';

const WEEKDAY_KEYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

const MOCK_JOIN_LINK = 'https://zoom.us/j/12345678901?pwd=mock';

type MockLessonSeedType = {
  dayOffset: number;
  id: string;
  tutorName: string;
  lessonName: string;
  startHour: number;
  startMinutes: number;
  endHour: number;
  endMinutes: number;
  lessonLink: string;
  canJoinByStatus: boolean;
  needsPayment: boolean;
};

const MOCK_LESSON_SEEDS: MockLessonSeedType[] = [
  {
    dayOffset: 0,
    id: 'english',
    tutorName: 'Олена Коваль',
    lessonName: 'Англійська мова',
    startHour: 16,
    startMinutes: 0,
    endHour: 17,
    endMinutes: 0,
    lessonLink: MOCK_JOIN_LINK,
    canJoinByStatus: true,
    needsPayment: false,
  },
  {
    dayOffset: 2,
    id: 'math',
    tutorName: 'Андрій Мельник',
    lessonName: 'Математика',
    startHour: 18,
    startMinutes: 30,
    endHour: 19,
    endMinutes: 30,
    lessonLink: '',
    canJoinByStatus: false,
    needsPayment: true,
  },
  {
    dayOffset: 4,
    id: 'history',
    tutorName: 'Ірина Савчук',
    lessonName: 'Історія України',
    startHour: 15,
    startMinutes: 0,
    endHour: 16,
    endMinutes: 0,
    lessonLink: MOCK_JOIN_LINK,
    canJoinByStatus: true,
    needsPayment: false,
  },
];

function startOfWeek(page: number, now: Date): Date {
  const day = now.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + mondayOffset + page * 7);
  return start;
}

function addDays(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function getTodayKey(now: Date): string {
  return `${now.getDate()}.${now.getMonth() + 1}.${now.getFullYear()}`;
}

function buildDay(
  date: Date,
  weekdayKey: string,
  todayKey: string,
): CalendarDayType {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const key = `${day}.${month}.${year}`;

  return {
    key,
    label: WEEKDAY_LABELS[weekdayKey] ?? weekdayKey.slice(0, 1).toLowerCase(),
    day,
    month,
    year,
    isToday: key === todayKey,
  };
}

function buildLesson(
  day: CalendarDayType,
  seed: MockLessonSeedType,
): CalendarLessonType {
  return {
    id: `${day.key}-${seed.id}`,
    dateKey: day.key,
    tutorName: seed.tutorName,
    lessonName: seed.lessonName,
    timeRange: `${padTimePart(seed.startHour)}:${padTimePart(seed.startMinutes)} - ${padTimePart(seed.endHour)}:${padTimePart(seed.endMinutes)}`,
    dateLabel: formatLessonDateLabel({ day: day.day, month: day.month }),
    startAt: buildEventDateTime({
      year: day.year,
      month: day.month,
      day: day.day,
      hour: seed.startHour,
      minutes: seed.startMinutes,
    }),
    endAt: buildEventDateTime({
      year: day.year,
      month: day.month,
      day: day.day,
      hour: seed.endHour,
      minutes: seed.endMinutes,
    }),
    lessonLink: seed.lessonLink,
    canJoinByStatus: seed.canJoinByStatus,
    needsPayment: seed.needsPayment,
  };
}

export async function getClientCalendarWeek(
  page: number,
): Promise<CalendarWeekType> {
  const serverNow = new Date();
  const todayKey = getTodayKey(serverNow);
  const weekStart = startOfWeek(page, serverNow);
  const days = WEEKDAY_KEYS.map((weekdayKey, index) =>
    buildDay(addDays(weekStart, index), weekdayKey, todayKey),
  );
  const lessons = MOCK_LESSON_SEEDS.reduce<CalendarLessonType[]>(
    (list, seed) => {
      const day = days[seed.dayOffset];
      if (day) {
        list.push(buildLesson(day, seed));
      }
      return list;
    },
    [],
  );
  const firstDay = days[0];
  const lastDay = days[days.length - 1];

  return {
    page,
    serverNow,
    weekRangeLabel:
      firstDay && lastDay
        ? formatWeekRange({
            startDay: firstDay.day,
            startMonth: firstDay.month,
            endDay: lastDay.day,
            endMonth: lastDay.month,
          })
        : '',
    days,
    lessons,
  };
}
