// react
import { useCallback, useMemo, useState } from 'react';

// model
import { meetAppAuthRepository } from '../model/meetAppAuthRepository';

// errors
import { MeetAppLoginError } from '../errors';

// utils
import { formatPhoneMask, getPhonePlain } from '../utils/getPhonePlain';

type UseMeetAppLoginParamsType = {
  onSuccess: VoidFunction;
};

export function useMeetAppLogin({ onSuccess }: UseMeetAppLoginParamsType) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const phonePlain = useMemo(() => getPhonePlain(phone), [phone]);
  const isSubmitDisabled = useMemo(
    () => isSubmitting || phonePlain.length === 0 || password.length === 0,
    [isSubmitting, password.length, phonePlain.length],
  );

  const handleChangePhone = useCallback((value: string) => {
    setPhone(formatPhoneMask(value));
    setErrorMessage(null);
  }, []);

  const handleChangePassword = useCallback((value: string) => {
    setPassword(value);
    setErrorMessage(null);
  }, []);

  const handleTogglePasswordVisibility = useCallback(() => {
    setIsPasswordVisible((current) => !current);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (isSubmitDisabled) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await meetAppAuthRepository.login({
        phonePlain,
        password,
        phoneDefaultCountryCode: true,
      });
      onSuccess();
    } catch (error) {
      if (error instanceof MeetAppLoginError) {
        setErrorMessage(error.message);
        return;
      }

      setErrorMessage(
        '* Не вдалося увійти. Перевірте інтернет і спробуйте ще раз',
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitDisabled, onSuccess, password, phonePlain]);

  return {
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
  };
}
