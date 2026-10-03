import { StyleSheet, type TextStyle, type ViewStyle } from 'react-native';

import type { MeetingStatus } from '@meet/schemas';
import type { ButtonVariantProps } from '@meet/ui';

const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
} as const;

export const meetingsPalette = {
  background: '#fafaf9',
  text: '#1c1917',
  muted: '#57534e',
  surface: '#ffffff',
} as const;

const buttonIntent = {
  primary: {
    container: { backgroundColor: '#0f766e' },
    label: { color: '#ffffff' },
  },
  secondary: {
    container: { backgroundColor: '#e7e5e4' },
    label: { color: '#1c1917' },
  },
  danger: {
    container: { backgroundColor: '#b91c1c' },
    label: { color: '#ffffff' },
  },
} satisfies Record<
  NonNullable<ButtonVariantProps['intent']>,
  { container: ViewStyle; label: TextStyle }
>;

const buttonSize = {
  sm: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  md: { paddingVertical: 10, paddingHorizontal: spacing.lg },
  lg: { paddingVertical: spacing.md, paddingHorizontal: 28 },
} satisfies Record<NonNullable<ButtonVariantProps['size']>, ViewStyle>;

const badgeStatus = {
  scheduled: { backgroundColor: '#e0f2fe' },
  live: { backgroundColor: '#d1fae5' },
  finished: { backgroundColor: '#e7e5e4' },
} satisfies Record<MeetingStatus, ViewStyle>;

const badgeLabel = {
  scheduled: { color: '#075985' },
  live: { color: '#065f46' },
  finished: { color: '#57534e' },
} satisfies Record<MeetingStatus, TextStyle>;

const cardStatus = {
  scheduled: { borderColor: '#bae6fd', backgroundColor: '#f0f9ff' },
  live: { borderColor: '#6ee7b7', backgroundColor: '#ecfdf5' },
  finished: {
    borderColor: '#e7e5e4',
    backgroundColor: '#fafaf9',
    opacity: 0.85,
  },
} satisfies Record<MeetingStatus, ViewStyle>;

export function buttonContainerStyle(
  intent: ButtonVariantProps['intent'],
  size: ButtonVariantProps['size'],
): ViewStyle {
  return {
    ...styles.button,
    ...buttonIntent[intent ?? 'primary'].container,
    ...buttonSize[size ?? 'md'],
  };
}

export function buttonLabelStyle(
  intent: ButtonVariantProps['intent'],
): TextStyle {
  return {
    ...styles.buttonLabel,
    ...buttonIntent[intent ?? 'primary'].label,
  };
}

export function badgeStyle(status: MeetingStatus): ViewStyle {
  return { ...styles.badge, ...badgeStatus[status] };
}

export function badgeLabelStyle(status: MeetingStatus): TextStyle {
  return { ...styles.badgeLabel, ...badgeLabel[status] };
}

export function meetingCardStyle(
  status: MeetingStatus,
  interactive: boolean,
): ViewStyle {
  const emphasis =
    status === 'live' && interactive
      ? styles.liveInteractive
      : styles.cardBorder;

  return { ...styles.card, ...cardStatus[status], ...emphasis };
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 10,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  badgeLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    borderRadius: 16,
    gap: spacing.sm,
    padding: spacing.md,
  },
  cardBorder: {
    borderWidth: 1,
  },
  liveInteractive: {
    borderWidth: 2,
  },
});
