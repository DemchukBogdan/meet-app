// react-native
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

// constants
import {
  AUTH_CODE_LENGTH,
  MEET_APP_FIELD_BG,
  MEET_APP_LABEL,
  EMAIL_LABEL,
  PASSWORD_LABEL,
  PHONE_COUNTRY_PREFIX,
  PHONE_LABEL,
  PHONE_MASK_PLACEHOLDER,
  SMS_CODE_LABEL,
} from '../constants';

// components
import { EyeIcon, UkraineFlag } from './LoginExtras';

type LoginPhoneFieldPropsType = {
  value: string;
  onChangeText: (value: string) => void;
};

type LoginPasswordFieldPropsType = {
  value: string;
  isVisible: boolean;
  onChangeText: (value: string) => void;
  onToggleVisibility: VoidFunction;
};

type LoginEmailFieldPropsType = {
  value: string;
  onChangeText: (value: string) => void;
};

type LoginCodeFieldPropsType = {
  value: string;
  onChangeText: (value: string) => void;
};

export function LoginPhoneField({
  value,
  onChangeText,
}: LoginPhoneFieldPropsType) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{PHONE_LABEL}</Text>
      <View style={styles.phoneRow}>
        <UkraineFlag />
        <Text style={styles.prefix}>{PHONE_COUNTRY_PREFIX}</Text>
        <TextInput
          style={styles.phoneInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={PHONE_MASK_PLACEHOLDER}
          placeholderTextColor="#9A9A9A"
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
        />
      </View>
    </View>
  );
}

export function LoginPasswordField({
  value,
  isVisible,
  onChangeText,
  onToggleVisibility,
}: LoginPasswordFieldPropsType) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{PASSWORD_LABEL}</Text>
      <View style={styles.passwordRow}>
        <TextInput
          style={styles.passwordInput}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!isVisible}
          autoComplete="password"
          textContentType="password"
        />
        <Pressable onPress={onToggleVisibility} hitSlop={8}>
          <EyeIcon />
        </Pressable>
      </View>
    </View>
  );
}

export function LoginEmailField({
  value,
  onChangeText,
}: LoginEmailFieldPropsType) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{EMAIL_LABEL}</Text>
      <TextInput
        style={styles.passwordInput}
        value={value}
        onChangeText={onChangeText}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
      />
    </View>
  );
}

export function LoginCodeField({
  value,
  onChangeText,
}: LoginCodeFieldPropsType) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{SMS_CODE_LABEL}</Text>
      <TextInput
        style={styles.passwordInput}
        value={value}
        onChangeText={onChangeText}
        keyboardType="number-pad"
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
        maxLength={AUTH_CODE_LENGTH}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    minHeight: 59,
    borderRadius: 10,
    borderCurve: 'continuous',
    backgroundColor: MEET_APP_FIELD_BG,
    borderWidth: 1,
    borderColor: MEET_APP_FIELD_BG,
    paddingTop: 28,
    paddingBottom: 10,
    paddingLeft: 24,
    paddingRight: 16,
    justifyContent: 'center',
  },
  label: {
    position: 'absolute',
    top: 8,
    left: 24,
    fontSize: 12,
    lineHeight: 14,
    color: MEET_APP_LABEL,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  prefix: {
    fontSize: 16,
    lineHeight: 19,
    color: '#000',
  },
  phoneInput: {
    flex: 1,
    padding: 0,
    margin: 0,
    fontSize: 16,
    color: '#000',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  passwordInput: {
    flex: 1,
    padding: 0,
    margin: 0,
    fontSize: 16,
    color: '#000',
  },
});
