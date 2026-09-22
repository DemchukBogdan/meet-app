// react
import { useCallback, useEffect, useMemo, useState } from 'react';

// api
import {
  loginBukiClientByCode,
  requestBukiAuthCode,
} from '../api/bukiAuthApi';

// constants
import {
  AUTH_CODE_LENGTH,
  PHONE_MAX_NATIONAL_DIGITS,
  SMS_MINUTE_LABEL,
  SMS_RESEND_COOLDOWN_MS,
  SMS_RESEND_WAIT_PREFIX,
  SMS_SECOND_LABEL,
} from '../constants';

// errors
import { BukiLoginError } from '../errors';

// utils
import { formatPhoneMask, getPhonePlain } from '../utils/getPhonePlain';

type UseBukiSmsLoginParamsType = {
  isActive: boolean;
  onSuccess: VoidFunction;
};

function formatResendWaitLabel(remainingMs: number): string {
  const totalSeconds = Math.max(1, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);

  if (minutes > 0) {
    return `${SMS_RESEND_WAIT_PREFIX} ${minutes} ${SMS_MINUTE_LABEL}`;
  }

  return `${SMS_RESEND_WAIT_PREFIX} ${totalSeconds} ${SMS_SECOND_LABEL}`;
}

export function useBukiSmsLogin({
  isActive,
  onSuccess,
}: UseBukiSmsLoginParamsType) {
  const [phone, setPhone] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [clientId, setClientId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendAvailableAtMs, setResendAvailableAtMs] = useState<number | null>(
    null
  );
  const [nowMs, setNowMs] = useState(() => Date.now());

  const phonePlain = useMemo(() => getPhonePlain(phone), [phone]);
  const isCodeSent = clientId != null;
  const remainingMs = useMemo(() => {
    if (resendAvailableAtMs == null) {
      return 0;
    }

    return Math.max(0, resendAvailableAtMs - nowMs);
  }, [nowMs, resendAvailableAtMs]);
  const canResend = isCodeSent && remainingMs === 0;
  const isRequestDisabled = useMemo(
    () =>
      isSubmitting || phonePlain.length !== PHONE_MAX_NATIONAL_DIGITS,
    [isSubmitting, phonePlain.length]
  );
  const isLoginDisabled = useMemo(
    () =>
      isSubmitting ||
      clientId == null ||
      authCode.length !== AUTH_CODE_LENGTH,
    [authCode.length, clientId, isSubmitting]
  );
  const isSubmitDisabled = isCodeSent ? isLoginDisabled : isRequestDisabled;
  const cooldownLabel = useMemo(() => {
    if (remainingMs <= 0) {
      return null;
    }

    return formatResendWaitLabel(remainingMs);
  }, [remainingMs]);

  // Keep the resend countdown in sync while a cooldown is running.
  useEffect(() => {
    if (!isActive || resendAvailableAtMs == null) {
      return;
    }

    const intervalId = setInterval(() => {
      const currentMs = Date.now();
      setNowMs(currentMs);

      if (currentMs >= resendAvailableAtMs) {
        clearInterval(intervalId);
      }
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [isActive, resendAvailableAtMs]);

  // Clear SMS login state when the bottom sheet is dismissed.
  useEffect(() => {
    if (isActive) {
      return;
    }

    setPhone('');
    setAuthCode('');
    setClientId(null);
    setIsSubmitting(false);
    setErrorMessage(null);
    setResendAvailableAtMs(null);
  }, [isActive]);

  const handleAuthError = useCallback((error: unknown) => {
    if (error instanceof BukiLoginError) {
      if (error.retryAfterSeconds > 0) {
        setNowMs(Date.now());
        setResendAvailableAtMs(
          Date.now() + error.retryAfterSeconds * 1000
        );
      }

      setErrorMessage(error.message);
      return;
    }

    setErrorMessage(
      '* Не вдалося увійти. Перевірте інтернет і спробуйте ще раз'
    );
  }, []);

  const handleChangePhone = useCallback(
    (value: string) => {
      const nextPhone = formatPhoneMask(value);
      const nextPhonePlain = getPhonePlain(nextPhone);

      setPhone(nextPhone);
      setErrorMessage(null);

      if (nextPhonePlain === phonePlain) {
        return;
      }

      setAuthCode('');
      setClientId(null);
      setResendAvailableAtMs(null);
    },
    [phonePlain]
  );

  const handleChangeAuthCode = useCallback((value: string) => {
    setAuthCode(value.replace(/\D/g, '').slice(0, AUTH_CODE_LENGTH));
    setErrorMessage(null);
  }, []);

  const handleRequestCode = useCallback(async () => {
    if (isRequestDisabled) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await requestBukiAuthCode({
        phonePlain,
        phoneDefaultCountryCode: true,
      });
      setClientId(result.clientId);
      setAuthCode('');
      setNowMs(Date.now());
      setResendAvailableAtMs(Date.now() + SMS_RESEND_COOLDOWN_MS);
    } catch (error) {
      handleAuthError(error);
    } finally {
      setIsSubmitting(false);
    }
  }, [handleAuthError, isRequestDisabled, phonePlain]);

  const handleSubmit = useCallback(async () => {
    if (!isCodeSent) {
      await handleRequestCode();
      return;
    }

    if (isLoginDisabled || clientId == null) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await loginBukiClientByCode({
        clientId,
        authCode,
      });
      onSuccess();
    } catch (error) {
      handleAuthError(error);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    authCode,
    clientId,
    handleAuthError,
    handleRequestCode,
    isCodeSent,
    isLoginDisabled,
    onSuccess,
  ]);

  return {
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
  };
}
