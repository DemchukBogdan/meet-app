// react
import { useCallback, useMemo, useState } from 'react';

// react-native
import { Alert, Linking } from 'react-native';

// constants
import {
  MEET_APP_SUPPORT_EMAIL,
  MEET_APP_TUTOR_LOGIN_URL,
  SUBMIT_TITLE,
} from '../constants';

// hooks
import { useMeetAppLogin } from './useMeetAppLogin';

// types
import type { LoginScreenPropsType, RecoveryModeType } from '../types';

export function useLoginScreen({ onSuccess }: LoginScreenPropsType) {
  const login = useMeetAppLogin({ onSuccess });
  const [recoveryMode, setRecoveryMode] = useState<RecoveryModeType | null>(
    null,
  );

  const submitTitle = useMemo(
    () => (login.isSubmitting ? '...' : SUBMIT_TITLE),
    [login.isSubmitting],
  );
  const submitOpacity = Number(!login.isSubmitDisabled) * 0.4 + 0.6;

  const handleGooglePress = useCallback(() => {
    Alert.alert(
      'Google',
      'У цьому білді доступний вхід за телефоном і паролем.',
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
    void Linking.openURL(`mailto:${MEET_APP_SUPPORT_EMAIL}`);
  }, []);

  const handleTutorLogin = useCallback(() => {
    void Linking.openURL(MEET_APP_TUTOR_LOGIN_URL);
  }, []);

  return {
    phone: login.phone,
    password: login.password,
    isPasswordVisible: login.isPasswordVisible,
    isSubmitDisabled: login.isSubmitDisabled,
    errorMessage: login.errorMessage,
    recoveryMode,
    submitTitle,
    submitOpacity,
    handleChangePhone: login.handleChangePhone,
    handleChangePassword: login.handleChangePassword,
    handleTogglePasswordVisibility: login.handleTogglePasswordVisibility,
    handleSubmit: login.handleSubmit,
    handleGooglePress,
    handleOpenSmsSheet,
    handleOpenEmailSheet,
    handleCloseRecovery,
    handleRecoverySuccess,
    handleSupportEmail,
    handleTutorLogin,
  };
}
