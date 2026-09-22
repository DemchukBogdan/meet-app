import { StatusBar, StyleSheet } from 'react-native';

// libraries
import Constants from 'expo-constants';

// constants
import {
  MEET_APP_GREEN,
  CARD_SHADOW,
  HEADER_SHADOW,
  OUTLINE_SHADOW,
} from '../constants';

const HEADER_BAR_HEIGHT = 55;
const measuredStatusBarHeight = Math.max(
  Constants.statusBarHeight,
  StatusBar.currentHeight ?? 0
);
const STATUS_BAR_HEIGHT =
  measuredStatusBarHeight > 0
    ? measuredStatusBarHeight
    : process.env.EXPO_OS === 'android'
      ? 48
      : 0;

export const loginChromeStyles = StyleSheet.create({
  header: {
    height: HEADER_BAR_HEIGHT + STATUS_BAR_HEIGHT,
    paddingTop: STATUS_BAR_HEIGHT,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    boxShadow: HEADER_SHADOW,
    zIndex: 2,
  },
  wordmark: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  card: {
    borderRadius: 20,
    borderCurve: 'continuous',
    padding: 20,
    backgroundColor: '#fff',
    boxShadow: CARD_SHADOW,
  },
  cardTitle: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '800',
    color: '#000',
    textAlign: 'left',
  },
  forgotTitle: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  primaryButton: {
    width: 240,
    height: 52,
    borderRadius: 40,
    backgroundColor: MEET_APP_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 14,
    alignSelf: 'center',
  },
  primaryLabel: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '800',
    color: '#fff',
  },
  sheetPrimaryLabel: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: '#fff',
  },
  outlineButton: {
    width: '100%',
    height: 44,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    marginBottom: 10,
    boxShadow: OUTLINE_SHADOW,
  },
  outlineLabel: {
    fontSize: 14,
    lineHeight: 24,
    fontWeight: '800',
    color: MEET_APP_GREEN,
  },
});
