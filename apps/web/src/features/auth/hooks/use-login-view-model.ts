import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAuthSession } from '../auth-session-context';

export function useLoginViewModel() {
  const { t } = useTranslation();
  const { login } = useAuthSession();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitLock = useRef(false);

  const handleChangePhone = useCallback((value: string) => {
    setPhone(value);
    setPhoneError(null);
  }, []);

  const handleChangePassword = useCallback((value: string) => {
    setPassword(value);
    setPasswordError(null);
  }, []);

  const handleSubmit = useCallback(() => {
    if (submitLock.current) {
      return;
    }

    const nextPhoneError =
      phone.trim().length === 0 ? t('auth.phoneRequired') : null;
    const nextPasswordError =
      password.length === 0 ? t('auth.passwordRequired') : null;
    setPhoneError(nextPhoneError);
    setPasswordError(nextPasswordError);
    if (nextPhoneError !== null || nextPasswordError !== null) {
      return;
    }

    submitLock.current = true;
    setIsSubmitting(true);
    void login({ phone, password })
      .catch((error: unknown) => {
        console.error(error);
        setPasswordError(t('auth.failed'));
      })
      .finally(() => {
        submitLock.current = false;
        setIsSubmitting(false);
      });
  }, [login, password, phone, t]);

  return {
    title: t('auth.title'),
    phoneLabel: t('auth.phone'),
    passwordLabel: t('auth.password'),
    submitLabel: isSubmitting ? t('auth.submitting') : t('auth.submit'),
    hint: t('auth.hint'),
    phone,
    password,
    phoneError,
    passwordError,
    isSubmitting,
    handleChangePhone,
    handleChangePassword,
    handleSubmit,
  };
}
