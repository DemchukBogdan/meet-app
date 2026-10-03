// react
import { useCallback, useMemo } from 'react';

// react-native
import { Alert, Linking } from 'react-native';

// constants
import {
  JOIN_HINT,
  JOIN_LESSON_TITLE,
  JOINING_LESSON_TITLE,
  JWT_MISSING_MESSAGE,
  JWT_MISSING_TITLE,
} from '../constants';

// utils
import { isJoinWindowOpen, toZoomAppLink } from '../utils/formatCalendar';

// types
import type {
  CalendarJoinActionsType,
  CalendarLessonType,
  LessonJoinActionKindType,
} from '../types';

type UseLessonJoinSheetParamsType = {
  lesson: CalendarLessonType;
  serverNow: Date;
  joinActions: CalendarJoinActionsType | null;
};

export function useLessonJoinSheet({
  lesson,
  serverNow,
  joinActions,
}: UseLessonJoinSheetParamsType) {
  const isWindowOpen = isJoinWindowOpen({
    startAt: lesson.startAt,
    endAt: lesson.endAt,
    now: serverNow,
  });
  const isJoinAvailable = Boolean(
    lesson.canJoinByStatus && lesson.lessonLink && isWindowOpen,
  );
  const actionKind: LessonJoinActionKindType = lesson.needsPayment
    ? 'pay'
    : 'join';
  const joinOpacity =
    Number(isJoinAvailable && !joinActions?.isJoining) * 0.4 + 0.6;
  const joinTitle = joinActions?.isJoining
    ? JOINING_LESSON_TITLE
    : JOIN_LESSON_TITLE;
  const joinHint = useMemo(() => {
    if (isWindowOpen || !lesson.canJoinByStatus) {
      return null;
    }

    return JOIN_HINT;
  }, [isWindowOpen, lesson.canJoinByStatus]);

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

  return {
    actionKind,
    isJoinAvailable,
    joinOpacity,
    joinTitle,
    joinHint,
    handleJoinPress,
    handleOpenAppPress,
  };
}
