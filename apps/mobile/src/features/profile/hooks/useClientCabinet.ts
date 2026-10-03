// react
import { useCallback, useMemo, useState } from 'react';

// model
import { meetAppAuthRepository } from '@/features/auth/model/meetAppAuthRepository';

// hooks
import { useClientProfile } from './useClientProfile';

// types
import type { CabinetTabType, ClientProfileScreenPropsType } from '../types';

type UseClientCabinetParamsType = ClientProfileScreenPropsType & {
  canUseZoomSdk: boolean;
};

export function useClientCabinet({
  onLogout,
  canUseZoomSdk,
}: UseClientCabinetParamsType) {
  const { profile, isLoading, errorMessage, loadProfile } = useClientProfile({
    onUnauthorized: onLogout,
  });
  const [activeTab, setActiveTab] = useState<CabinetTabType>('profile');
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const handleOpenMore = useCallback(() => {
    setIsMoreOpen(true);
  }, []);

  const handleCloseMore = useCallback(() => {
    setIsMoreOpen(false);
  }, []);

  const handleTabPress = useCallback((tab: CabinetTabType) => {
    setIsMoreOpen(false);
    setActiveTab(tab);
  }, []);

  const handleLogout = useCallback(() => {
    setIsMoreOpen(false);
    void meetAppAuthRepository.logout().then(onLogout, (error: unknown) => {
      console.error(error);
    });
  }, [onLogout]);

  const handleRetry = useCallback(() => {
    void loadProfile();
  }, [loadProfile]);

  const canReplenish = useMemo(
    () =>
      Boolean(
        profile &&
        !profile.isAdditionalPhoneLogin &&
        profile.fillBalanceOrdersCount > 0,
      ),
    [profile],
  );

  const studentName = profile?.name ?? '';

  return {
    profile,
    isLoading,
    errorMessage,
    canUseZoomSdk,
    activeTab,
    isMoreOpen,
    canReplenish,
    studentName,
    handleOpenMore,
    handleCloseMore,
    handleTabPress,
    handleLogout,
    handleRetry,
  };
}
