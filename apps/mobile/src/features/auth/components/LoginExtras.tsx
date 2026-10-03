// react-native
import { Pressable, StyleSheet, Text, View } from 'react-native';

// constants
import {
  MEET_APP_DIVIDER,
  MEET_APP_FLAG_BLUE,
  MEET_APP_FLAG_YELLOW,
  MEET_APP_LABEL,
  GOOGLE_LOGIN_TITLE,
  GOOGLE_SHADOW,
  OR_DIVIDER_LABEL,
} from '../constants';

// styles
import { loginChromeStyles } from '../styles/loginChromeStyles';

// types
import type { OutlineButtonPropsType } from '../types';

type GoogleLoginButtonPropsType = {
  onPress: VoidFunction;
};

export function OrDivider() {
  return (
    <View style={styles.dividerRow}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerLabel}>{OR_DIVIDER_LABEL}</Text>
      <View style={styles.dividerLine} />
    </View>
  );
}

export function UkraineFlag() {
  return (
    <View style={styles.flagWrap}>
      <View style={styles.flag}>
        <View style={styles.flagBlue} />
        <View style={styles.flagYellow} />
      </View>
      <View style={styles.flagChevron} />
    </View>
  );
}

export function EyeIcon() {
  return (
    <View style={styles.eye}>
      <View style={styles.eyeOutline} />
      <View style={styles.eyePupil} />
    </View>
  );
}

export function CloseIcon() {
  return (
    <View style={styles.closeWrap}>
      <View style={[styles.closeBar, styles.closeBarLeft]} />
      <View style={[styles.closeBar, styles.closeBarRight]} />
    </View>
  );
}

export function OutlineButton({ title, onPress }: OutlineButtonPropsType) {
  return (
    <Pressable onPress={onPress} style={loginChromeStyles.outlineButton}>
      <Text style={loginChromeStyles.outlineLabel}>{title}</Text>
    </Pressable>
  );
}

export function GoogleLoginButton({ onPress }: GoogleLoginButtonPropsType) {
  return (
    <Pressable onPress={onPress} style={styles.googleButton}>
      <View style={styles.googleMark}>
        <Text style={styles.googleBlue}>G</Text>
      </View>
      <Text style={styles.googleLabel}>{GOOGLE_LOGIN_TITLE}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: MEET_APP_DIVIDER,
  },
  dividerLabel: {
    paddingHorizontal: 15,
    fontSize: 16,
    lineHeight: 19,
    fontWeight: '400',
    color: '#000',
  },
  flagWrap: {
    width: 25,
    alignItems: 'center',
    gap: 2,
  },
  flag: {
    width: 25,
    height: 18,
    overflow: 'hidden',
  },
  flagBlue: {
    flex: 1,
    backgroundColor: MEET_APP_FLAG_BLUE,
  },
  flagYellow: {
    flex: 1,
    backgroundColor: MEET_APP_FLAG_YELLOW,
  },
  flagChevron: {
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderTopWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#222',
  },
  eye: {
    width: 19,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeOutline: {
    width: 16,
    height: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: MEET_APP_LABEL,
  },
  eyePupil: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: MEET_APP_LABEL,
  },
  closeWrap: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBar: {
    position: 'absolute',
    width: 16,
    height: 1.5,
    backgroundColor: '#000',
    borderRadius: 1,
  },
  closeBarLeft: {
    transform: [{ rotate: '45deg' }],
  },
  closeBarRight: {
    transform: [{ rotate: '-45deg' }],
  },
  googleButton: {
    height: 59,
    borderRadius: 15,
    borderCurve: 'continuous',
    backgroundColor: '#fff',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: GOOGLE_SHADOW,
  },
  googleMark: {
    width: 35,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleBlue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#4285F4',
  },
  googleLabel: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '400',
    color: '#000',
  },
});
