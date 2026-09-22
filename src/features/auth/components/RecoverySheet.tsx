// react
import { useEffect, useMemo, useState } from 'react';

// react-native
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// constants
import {
  BUKI_ERROR,
  BUKI_GREEN,
  CARD_SHADOW,
  EMAIL_SHEET_TITLE,
  EMAIL_SUBMIT_TITLE,
  SMS_RESEND_TITLE,
  SMS_SENT_MESSAGE,
  SMS_SHEET_TITLE,
  SMS_SUBMIT_TITLE,
  SUBMIT_TITLE,
} from '../constants';

// hooks
import { useKeyboardBottomInset } from '@/shared/hooks/useKeyboardBottomInset';
import { useBukiSmsLogin } from '../hooks/useBukiSmsLogin';

// components
import { CloseIcon } from './LoginExtras';
import {
  LoginCodeField,
  LoginEmailField,
  LoginPhoneField,
} from './LoginFields';

// styles
import { loginChromeStyles } from '../styles/loginChromeStyles';

// types
import type { RecoveryModeType } from '../types';

type RecoverySheetPropsType = {
  mode: RecoveryModeType | null;
  onClose: VoidFunction;
  onSuccess: VoidFunction;
};

const RECOVERY_COPY: Record<
  RecoveryModeType,
  { title: string; submitTitle: string }
> = {
  sms: {
    title: SMS_SHEET_TITLE,
    submitTitle: SMS_SUBMIT_TITLE,
  },
  email: {
    title: EMAIL_SHEET_TITLE,
    submitTitle: EMAIL_SUBMIT_TITLE,
  },
};

export function RecoverySheet({
  mode,
  onClose,
  onSuccess,
}: RecoverySheetPropsType) {
  const isSmsMode = mode === 'sms';
  const {
    phone,
    authCode,
    isCodeSent,
    isSubmitting,
    isSubmitDisabled,
    canResend,
    cooldownLabel,
    errorMessage,
    handleChangePhone,
    handleChangeAuthCode,
    handleRequestCode,
    handleSubmit,
  } = useBukiSmsLogin({
    isActive: isSmsMode,
    onSuccess,
  });
  const [email, setEmail] = useState('');
  const isVisible = mode != null;

  // Clear the email field when the bottom sheet is dismissed.
  useEffect(() => {
    if (mode != null) {
      return;
    }

    setEmail('');
  }, [mode]);
  const copy = mode ? RECOVERY_COPY[mode] : RECOVERY_COPY.sms;
  const submitTitle = useMemo(() => {
    if (isSubmitting) {
      return '...';
    }

    if (isSmsMode && isCodeSent) {
      return SUBMIT_TITLE;
    }

    return copy.submitTitle;
  }, [copy.submitTitle, isCodeSent, isSmsMode, isSubmitting]);
  const submitOpacity = Number(!isSubmitDisabled) * 0.4 + 0.6;
  const isPrimaryDisabled = !isSmsMode || isSubmitDisabled;
  const primaryOpacity = isSmsMode ? submitOpacity : 1;
  const primaryPressHandler = isSmsMode ? handleSubmit : undefined;
  const keyboardBottomInset = useKeyboardBottomInset();
  const sheetStyle = useMemo(
    () => [styles.sheet, { marginBottom: keyboardBottomInset }],
    [keyboardBottomInset]
  );
  const smsCodeView = useMemo(() => {
    if (!isCodeSent) {
      return null;
    }

    return (
      <>
        <Text style={styles.sentMessage}>{SMS_SENT_MESSAGE}</Text>
        <LoginCodeField value={authCode} onChangeText={handleChangeAuthCode} />
      </>
    );
  }, [authCode, handleChangeAuthCode, isCodeSent]);
  const fieldView = useMemo(() => {
    if (mode === 'email') {
      return <LoginEmailField value={email} onChangeText={setEmail} />;
    }

    return (
      <View style={styles.smsFields}>
        <LoginPhoneField value={phone} onChangeText={handleChangePhone} />
        {smsCodeView}
      </View>
    );
  }, [email, handleChangePhone, mode, phone, smsCodeView]);
  const statusView = useMemo(() => {
    if (errorMessage) {
      return <Text style={styles.error}>{errorMessage}</Text>;
    }

    if (isSmsMode && cooldownLabel && !canResend) {
      return <Text style={styles.cooldown}>{cooldownLabel}</Text>;
    }

    return null;
  }, [canResend, cooldownLabel, errorMessage, isSmsMode]);
  const resendView = useMemo(() => {
    if (!isSmsMode || !canResend) {
      return null;
    }

    return (
      <Pressable onPress={handleRequestCode} disabled={isSubmitting}>
        <Text style={styles.resend}>{SMS_RESEND_TITLE}</Text>
      </Pressable>
    );
  }, [canResend, handleRequestCode, isSmsMode, isSubmitting]);

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={sheetStyle}>
          <Pressable onPress={onClose} style={styles.closeButton} hitSlop={12}>
            <CloseIcon />
          </Pressable>
          <Text style={[loginChromeStyles.cardTitle, styles.sheetTitle]}>
            {copy.title}
          </Text>
          <View style={styles.fieldWrap}>{fieldView}</View>
          {statusView}
          {resendView}
          <Pressable
            onPress={primaryPressHandler}
            disabled={isPrimaryDisabled}
            style={[
              loginChromeStyles.primaryButton,
              { opacity: primaryOpacity },
            ]}
          >
            <Text style={loginChromeStyles.sheetPrimaryLabel}>
              {submitTitle}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 28,
    boxShadow: CARD_SHADOW,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  sheetTitle: {
    paddingRight: 28,
  },
  fieldWrap: {
    marginTop: 20,
    marginBottom: 25,
  },
  smsFields: {
    gap: 16,
  },
  sentMessage: {
    fontSize: 14,
    lineHeight: 18,
    color: '#000',
  },
  error: {
    marginTop: -12,
    marginBottom: 16,
    fontSize: 12,
    lineHeight: 16,
    color: BUKI_ERROR,
  },
  cooldown: {
    marginTop: -12,
    marginBottom: 16,
    fontSize: 12,
    lineHeight: 16,
    color: '#000',
  },
  resend: {
    marginTop: -8,
    marginBottom: 16,
    fontSize: 14,
    lineHeight: 18,
    color: BUKI_GREEN,
    textAlign: 'center',
  },
});
