export type CalendarDayType = {
  key: string;
  label: string;
  day: number;
  month: number;
  year: number;
  isToday: boolean;
};

export type CalendarLessonType = {
  id: string;
  dateKey: string;
  tutorName: string;
  lessonName: string;
  timeRange: string;
  dateLabel: string;
  startAt: Date;
  endAt: Date;
  lessonLink: string;
  canJoinByStatus: boolean;
  needsPayment: boolean;
};

export type CalendarWeekType = {
  page: number;
  serverNow: Date;
  weekRangeLabel: string;
  days: CalendarDayType[];
  lessons: CalendarLessonType[];
};

export type ZoomJoinTargetType = {
  meetingNumber: string;
  password: string;
};

export type ClientCalendarScreenPropsType = {
  studentName: string;
  canUseZoomSdk: boolean;
};

export type CalendarJoinActionsType = {
  isJoining: boolean;
  handleJoinLesson: (lessonLink: string) => Promise<void>;
  handleOpenZoomApp: (lessonLink: string) => Promise<void>;
};

export type LessonJoinActionKindType = 'join' | 'pay';
