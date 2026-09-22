// react
import { useCallback, useMemo, useState, type ReactNode } from 'react';

// react-native
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// constants
import { BUKI_GREEN, BUKI_LABEL } from '@/features/auth/constants';
import {
  CALENDAR_PAGE_TITLE,
  CALENDAR_RETRY_TITLE,
  COLOR_LEGEND,
  COLORS_TITLE,
  EMPTY_DAY_TITLE,
  EMPTY_WEEK_TITLE,
  JWT_MISSING_MESSAGE,
  JWT_MISSING_TITLE,
  JOIN_HINT,
  JOIN_LESSON_TITLE,
  JOINING_LESSON_TITLE,
  OPEN_ZOOM_APP_TITLE,
  PAY_LESSON_TITLE,
  WEEK_SHADOW,
} from '../constants';

// hooks
import { useClientCalendar } from '../hooks/useClientCalendar';
import { useJoinCalendarLesson } from '../hooks/useJoinCalendarLesson';

// utils
import { isJoinWindowOpen, toZoomAppLink } from '../utils/formatCalendar';

// types
import type {
  CalendarLessonType,
  ClientCalendarScreenPropsType,
} from '../types';

type JoinActionsType = {
  isJoining: boolean;
  handleJoinLesson: (lessonLink: string) => Promise<void>;
  handleOpenZoomApp: (lessonLink: string) => Promise<void>;
};

type CalendarBodyPropsType = {
  joinActions: JoinActionsType | null;
};

function ZoomJoinBridge({
  studentName,
  children,
}: {
  studentName: string;
  children: (joinActions: JoinActionsType) => ReactNode;
}) {
  const joinActions = useJoinCalendarLesson({
    studentName,
    canUseZoomSdk: true,
  });

  return children(joinActions);
}

function LessonJoinSheet({
  lesson,
  serverNow,
  joinActions,
  onClose,
}: {
  lesson: CalendarLessonType;
  serverNow: Date;
  joinActions: JoinActionsType | null;
  onClose: VoidFunction;
}) {
  const isWindowOpen = isJoinWindowOpen({
    startAt: lesson.startAt,
    endAt: lesson.endAt,
    now: serverNow,
  });
  const isJoinAvailable = Boolean(
    lesson.canJoinByStatus && lesson.lessonLink && isWindowOpen
  );
  const joinOpacity = Number(isJoinAvailable && !joinActions?.isJoining) * 0.4 + 0.6;
  const joinTitle = joinActions?.isJoining
    ? JOINING_LESSON_TITLE
    : JOIN_LESSON_TITLE;
  const handleJoinPress = useCallback(() => {
    if (!isJoinAvailable) {
      return;
    }

    if (!joinActions) {
      Alert.alert(JWT_MISSING_TITLE, JWT_MISSING_MESSAGE);
      return;
    }

    void joinActions.handleJoinLesson(lesson.lessonLink);
  }, [isJoinAvailable, joinActions, lesson.lessonLink]);
  const handleOpenAppPress = useCallback(() => {
    if (!lesson.lessonLink) {
      return;
    }

    if (joinActions) {
      void joinActions.handleOpenZoomApp(lesson.lessonLink);
      return;
    }

    void Linking.openURL(toZoomAppLink(lesson.lessonLink));
  }, [joinActions, lesson.lessonLink]);
  const hintView = useMemo(() => {
    if (isWindowOpen || !lesson.canJoinByStatus) {
      return null;
    }

    return <Text style={styles.hint}>{JOIN_HINT}</Text>;
  }, [isWindowOpen, lesson.canJoinByStatus]);
  const actionView = useMemo(() => {
    if (lesson.needsPayment) {
      return (
        <View style={[styles.joinButton, styles.joinButtonDisabled]}>
          <Text style={styles.joinLabel}>{PAY_LESSON_TITLE}</Text>
        </View>
      );
    }

    return (
      <>
        {hintView}
        <Pressable
          disabled={!isJoinAvailable}
          onPress={handleJoinPress}
          style={[styles.joinButton, { opacity: joinOpacity }]}
        >
          <Text style={styles.joinLabel}>{joinTitle}</Text>
        </Pressable>
        {isJoinAvailable ? (
          <Pressable onPress={handleOpenAppPress}>
            <Text style={styles.appLink}>{OPEN_ZOOM_APP_TITLE}</Text>
          </Pressable>
        ) : null}
      </>
    );
  }, [
    handleJoinPress,
    handleOpenAppPress,
    hintView,
    isJoinAvailable,
    joinOpacity,
    joinTitle,
    lesson.needsPayment,
  ]);

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.sheetOverlay}>
        <Pressable style={styles.sheetBackdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <Text style={styles.sheetLesson}>{lesson.lessonName}</Text>
          <Text style={styles.sheetTutor}>{lesson.tutorName}</Text>
          <Text style={styles.sheetTime}>
            {lesson.dateLabel} {lesson.timeRange}
          </Text>
          {actionView}
        </View>
      </View>
    </Modal>
  );
}

function CalendarBody({ joinActions }: CalendarBodyPropsType) {
  const {
    week,
    selectedDayKey,
    dayLessons,
    isLoading,
    errorMessage,
    handlePrevWeek,
    handleNextWeek,
    handleSelectDay,
    handleRetry,
  } = useClientCalendar();
  const [selectedLesson, setSelectedLesson] = useState<CalendarLessonType | null>(
    null
  );

  const handleCloseLesson = useCallback(() => {
    setSelectedLesson(null);
  }, []);

  const daysView = useMemo(() => {
    if (!week) {
      return null;
    }

    return (
      <View style={styles.daysRow}>
        {week.days.map((day) => {
          const isSelected = day.key === selectedDayKey;

          return (
            <Pressable
              key={day.key}
              onPress={() => handleSelectDay(day.key)}
              style={[styles.dayCell, isSelected && styles.dayCellSelected]}
            >
              <Text style={[styles.dayLetter, isSelected && styles.daySelectedText]}>
                {day.label}
              </Text>
              <Text style={[styles.dayNumber, isSelected && styles.daySelectedText]}>
                {padDay(day.day)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  }, [handleSelectDay, selectedDayKey, week]);

  const lessonsView = useMemo(() => {
    if (!week) {
      return null;
    }

    if (week.lessons.length === 0) {
      return <Text style={styles.empty}>{EMPTY_WEEK_TITLE}</Text>;
    }

    if (dayLessons.length === 0) {
      return <Text style={styles.empty}>{EMPTY_DAY_TITLE}</Text>;
    }

    return dayLessons.map((lesson) => (
      <Pressable
        key={lesson.id}
        onPress={() => setSelectedLesson(lesson)}
        style={styles.lessonCard}
      >
        <View style={styles.lessonDot} />
        <View style={styles.lessonCopy}>
          <Text style={styles.lessonName}>{lesson.lessonName || lesson.tutorName}</Text>
          <Text style={styles.lessonMeta}>
            {lesson.timeRange}
            {lesson.tutorName ? ` · ${lesson.tutorName}` : ''}
          </Text>
        </View>
      </Pressable>
    ));
  }, [dayLessons, week]);

  const legendView = useMemo(
    () => (
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>{COLORS_TITLE}</Text>
        {COLOR_LEGEND.map((item) => (
          <View key={item.label} style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <Text style={styles.legendLabel}>{item.label}</Text>
          </View>
        ))}
      </View>
    ),
    []
  );

  if (isLoading) {
    return (
      <View style={styles.stateWrap}>
        <ActivityIndicator color={BUKI_GREEN} />
      </View>
    );
  }

  if (errorMessage || !week) {
    return (
      <View style={styles.stateWrap}>
        <Text style={styles.empty}>{errorMessage}</Text>
        <Pressable onPress={handleRetry} style={styles.retryButton}>
          <Text style={styles.retryLabel}>{CALENDAR_RETRY_TITLE}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>{CALENDAR_PAGE_TITLE}</Text>
        <View style={styles.weekSwitcher}>
          <Pressable onPress={handlePrevWeek} hitSlop={12} style={styles.arrowHit}>
            <View style={[styles.arrow, styles.arrowPrev]} />
          </Pressable>
          <Text style={styles.weekRange}>{week.weekRangeLabel}</Text>
          <Pressable onPress={handleNextWeek} hitSlop={12} style={styles.arrowHit}>
            <View style={styles.arrow} />
          </Pressable>
        </View>
        {daysView}
        {lessonsView}
        {legendView}
      </ScrollView>
      {selectedLesson ? (
        <LessonJoinSheet
          lesson={selectedLesson}
          serverNow={week.serverNow}
          joinActions={joinActions}
          onClose={handleCloseLesson}
        />
      ) : null}
    </View>
  );
}

function padDay(day: number): string {
  return String(day).padStart(2, '0');
}

export function ClientCalendarScreen({
  studentName,
  canUseZoomSdk,
}: ClientCalendarScreenPropsType) {
  if (!canUseZoomSdk) {
    return (
      <CalendarBody joinActions={null} />
    );
  }

  return (
    <ZoomJoinBridge studentName={studentName}>
      {(joinActions) => (
        <CalendarBody joinActions={joinActions} />
      )}
    </ZoomJoinBridge>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 24,
  },
  pageTitle: {
    color: '#000',
    fontWeight: '700',
    fontSize: 18,
    lineHeight: 22,
    textAlign: 'center',
    paddingTop: 10,
    marginBottom: 16,
  },
  weekSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    boxShadow: WEEK_SHADOW,
    marginBottom: 16,
  },
  weekRange: {
    fontSize: 14,
    lineHeight: 17,
    color: '#000',
    paddingHorizontal: 10,
    textAlign: 'center',
    flex: 1,
  },
  arrowHit: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    width: 10,
    height: 10,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: BUKI_GREEN,
    transform: [{ rotate: '45deg' }],
  },
  arrowPrev: {
    transform: [{ rotate: '-135deg' }],
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dayCell: {
    width: 40,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
  },
  dayCellSelected: {
    backgroundColor: '#F3F3F3',
  },
  dayLetter: {
    fontSize: 12,
    lineHeight: 14,
    color: BUKI_LABEL,
    textTransform: 'lowercase',
  },
  dayNumber: {
    marginTop: 4,
    fontSize: 16,
    lineHeight: 19,
    fontWeight: '600',
    color: '#000',
  },
  daySelectedText: {
    color: BUKI_GREEN,
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    marginBottom: 12,
    borderRadius: 20,
    backgroundColor: '#fff',
    boxShadow: WEEK_SHADOW,
  },
  lessonDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: BUKI_GREEN,
  },
  lessonCopy: {
    flex: 1,
  },
  lessonName: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '600',
    color: '#000',
  },
  lessonMeta: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 18,
    color: BUKI_LABEL,
  },
  empty: {
    fontSize: 14,
    lineHeight: 20,
    color: '#000',
    textAlign: 'center',
    marginVertical: 20,
  },
  legend: {
    marginTop: 12,
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#fff',
    boxShadow: WEEK_SHADOW,
    gap: 10,
  },
  legendTitle: {
    fontSize: 16,
    lineHeight: 19,
    fontWeight: '600',
    color: BUKI_GREEN,
    textDecorationLine: 'underline',
    marginBottom: 4,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 3,
  },
  legendLabel: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: '#000',
  },
  stateWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    backgroundColor: BUKI_GREEN,
  },
  retryLabel: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
    color: '#fff',
  },
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetBackdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 32,
    gap: 10,
  },
  sheetLesson: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
    color: '#000',
  },
  sheetTutor: {
    fontSize: 16,
    lineHeight: 20,
    color: '#000',
  },
  sheetTime: {
    fontSize: 14,
    lineHeight: 18,
    color: BUKI_LABEL,
    marginBottom: 8,
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
    color: BUKI_LABEL,
    textAlign: 'center',
  },
  joinButton: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    backgroundColor: BUKI_GREEN,
    alignItems: 'center',
  },
  joinButtonDisabled: {
    backgroundColor: BUKI_LABEL,
  },
  joinLabel: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
    color: '#fff',
  },
  appLink: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    color: BUKI_GREEN,
    textAlign: 'center',
  },
});
