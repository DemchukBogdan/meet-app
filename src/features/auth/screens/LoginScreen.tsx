// react
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// react-native
import {
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// libraries
import { StatusBar } from 'expo-status-bar';

// constants
import {
  BUKI_ERROR,
  BUKI_GREEN,
  BUKI_LOGO_URI,
  BUKI_SUPPORT_EMAIL,
  BUKI_TUTOR_LOGIN_URL,
  HELP_TEXT,
  LOGIN_TITLE,
  SUBMIT_TITLE,
  TUTOR_LOGIN_TITLE,
} from '../constants';

// hooks
import { useKeyboardBottomInset } from '@/shared/hooks/useKeyboardBottomInset';
import { useBukiLogin } from '../hooks/useBukiLogin';

// components
import { ForgotPasswordCard } from '../components/ForgotPasswordCard';
import { LoginPasswordField, LoginPhoneField } from '../components/LoginFields';
import { GoogleLoginButton, OrDivider } from '../components/LoginExtras';
import { RecoverySheet } from '../components/RecoverySheet';

// styles
import { loginChromeStyles } from '../styles/loginChromeStyles';

// types
import type { LoginScreenPropsType, RecoveryModeType } from '../types';

export function LoginScreen({ onSuccess }: LoginScreenPropsType) {
  const {
    phone,
    password,
    isPasswordVisible,
    isSubmitting,
    isSubmitDisabled,
    errorMessage,
    handleChangePhone,
    handleChangePassword,
    handleTogglePasswordVisibility,
    handleSubmit,
  } = useBukiLogin({ onSuccess });
  const [recoveryMode, setRecoveryMode] = useState<RecoveryModeType | null>(
    null
  );

  const submitTitle = useMemo(
    () => (isSubmitting ? '...' : SUBMIT_TITLE),
    [isSubmitting]
  );
  const submitOpacity = Number(!isSubmitDisabled) * 0.4 + 0.6;
  const errorView = useMemo(() => {
    if (!errorMessage) {
      return null;
    }

    return (
      <Text selectable style={styles.error}>
        {errorMessage}
      </Text>
    );
  }, [errorMessage]);

  const handleGooglePress = useCallback(() => {
    Alert.alert(
      'Google',
      'У цьому білді доступний вхід за телефоном і паролем.'
    );
  }, []);

  const handleOpenSmsSheet = useCallback(() => {
    setRecoveryMode('sms');
  }, []);

  const handleOpenEmailSheet = useCallback(() => {
    setRecoveryMode('email');
  }, []);

  const handleCloseRecovery = useCallback(() => {
    setRecoveryMode(null);
  }, []);

  const handleRecoverySuccess = useCallback(() => {
    setRecoveryMode(null);
    onSuccess();
  }, [onSuccess]);

  const handleSupportEmail = useCallback(() => {
    Linking.openURL(`mailto:${BUKI_SUPPORT_EMAIL}`);
  }, []);

  const handleTutorLogin = useCallback(() => {
    Linking.openURL(BUKI_TUTOR_LOGIN_URL);
  }, []);

  const scrollViewRef = useRef<ScrollView>(null);
  const keyboardBottomInset = useKeyboardBottomInset();
  const contentContainerStyle = useMemo(
    () => [styles.content, { paddingBottom: 40 + keyboardBottomInset }],
    [keyboardBottomInset]
  );

  // Bring the login fields above the keyboard when it opens.
  useEffect(() => {
    if (keyboardBottomInset <= 0) {
      return;
    }

    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, [keyboardBottomInset]);

  return (
    <View style={styles.root}>
      <View style={loginChromeStyles.header}>
        <Image
          source={{ uri: BUKI_LOGO_URI }}
          style={loginChromeStyles.logo}
          resizeMode="contain"
          accessibilityLabel="BUKI School"
        />
      </View>
      <ScrollView
        ref={scrollViewRef}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={contentContainerStyle}
      >
        <View style={loginChromeStyles.card}>
          <Text style={loginChromeStyles.cardTitle}>{LOGIN_TITLE}</Text>
          <View style={styles.fields}>
            <LoginPhoneField value={phone} onChangeText={handleChangePhone} />
            <LoginPasswordField
              value={password}
              isVisible={isPasswordVisible}
              onChangeText={handleChangePassword}
              onToggleVisibility={handleTogglePasswordVisibility}
            />
            {errorView}
            <View style={styles.submitWrap}>
              <Pressable
                onPress={handleSubmit}
                disabled={isSubmitDisabled}
                style={[
                  loginChromeStyles.primaryButton,
                  { opacity: submitOpacity },
                ]}
              >
                <Text style={loginChromeStyles.primaryLabel}>{submitTitle}</Text>
              </Pressable>
            </View>
            <View style={styles.googleBlock}>
              <OrDivider />
              <GoogleLoginButton onPress={handleGooglePress} />
            </View>
          </View>
        </View>
        <ForgotPasswordCard
          onSmsPress={handleOpenSmsSheet}
          onEmailPress={handleOpenEmailSheet}
        />
        <Text style={styles.helpText}>
          {HELP_TEXT}{' '}
          <Text style={styles.helpEmail} onPress={handleSupportEmail}>
            {BUKI_SUPPORT_EMAIL}
          </Text>
        </Text>
        <Pressable onPress={handleTutorLogin}>
          <Text style={styles.tutorLink}>{TUTOR_LOGIN_TITLE}</Text>
        </Pressable>
      </ScrollView>
      <RecoverySheet
        mode={recoveryMode}
        onClose={handleCloseRecovery}
        onSuccess={handleRecoverySuccess}
      />
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 12,
    paddingTop: 40,
    paddingBottom: 40,
  },
  fields: {
    marginTop: 20,
    gap: 20,
  },
  error: {
    fontSize: 12,
    lineHeight: 16,
    color: BUKI_ERROR,
  },
  submitWrap: {
    marginTop: 5,
    alignItems: 'center',
  },
  googleBlock: {
    marginTop: 10,
  },
  helpText: {
    marginTop: 20,
    fontSize: 14,
    lineHeight: 16,
    color: '#000',
    textAlign: 'left',
  },
  helpEmail: {
    color: BUKI_GREEN,
  },
  tutorLink: {
    marginTop: 25,
    paddingTop: 30,
    fontSize: 18,
    lineHeight: 22,
    color: BUKI_GREEN,
    textAlign: 'center',
  },
});
