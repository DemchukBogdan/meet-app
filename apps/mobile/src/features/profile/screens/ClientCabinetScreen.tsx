// react
import { useCallback, useMemo, useState } from 'react';

// react-native
import { StyleSheet, Text, View } from 'react-native';

// libraries
import { StatusBar } from 'expo-status-bar';

// constants
import { APP_WORDMARK } from '@/features/auth/constants';

// api
import { logoutMeetAppClient } from '@/features/auth/api/meetAppAuthApi';

// features
import { ClientCalendarScreen } from '@/features/calendar';
import { ZoomProvider, getZoomJwtToken } from '@/features/zoom';

// hooks
import { useClientProfile } from '../hooks/useClientProfile';

// components
import {
  ClientBottomNav,
  ProfileBalanceBar,
} from '../components/ClientCabinetChrome';
import { ClientProfileContent } from './ClientProfileScreen';

// styles
import { loginChromeStyles } from '@/features/auth/styles/loginChromeStyles';

// types
import type { CabinetTabType, ClientProfileScreenPropsType } from '../types';

function CabinetBody({
  onLogout,
  canUseZoomSdk,
}: ClientProfileScreenPropsType & { canUseZoomSdk: boolean }) {
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

  const handleLogout = useCallback(async () => {
    setIsMoreOpen(false);
    await logoutMeetAppClient();
    onLogout();
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

  const balanceBarView = useMemo(() => {
    if (!profile) {
      return null;
    }

    return (
      <ProfileBalanceBar
        hours={profile.balanceHours}
        canReplenish={canReplenish}
        isAdditionalPhoneLogin={profile.isAdditionalPhoneLogin}
      />
    );
  }, [canReplenish, profile]);

  const tabContentView = useMemo(() => {
    if (activeTab === 'calendar') {
      return (
        <ClientCalendarScreen
          studentName={profile?.name ?? ''}
          canUseZoomSdk={canUseZoomSdk}
        />
      );
    }

    return (
      <ClientProfileContent
        profile={profile}
        isLoading={isLoading}
        errorMessage={errorMessage}
        canUseZoomSdk={canUseZoomSdk}
        onRetry={handleRetry}
      />
    );
  }, [activeTab, canUseZoomSdk, errorMessage, handleRetry, isLoading, profile]);

  return (
    <View style={styles.root}>
      <View style={loginChromeStyles.header}>
        <Text style={loginChromeStyles.wordmark}>{APP_WORDMARK}</Text>
      </View>
      {balanceBarView}
      {tabContentView}
      <ClientBottomNav
        activeTab={activeTab}
        isMoreOpen={isMoreOpen}
        onTabPress={handleTabPress}
        onMorePress={handleOpenMore}
        onMoreClose={handleCloseMore}
        onLogout={handleLogout}
      />
      <StatusBar style="dark" />
    </View>
  );
}

export function ClientCabinetScreen({
  onLogout,
}: ClientProfileScreenPropsType) {
  const jwtToken = getZoomJwtToken();
  const cabinetView = (
    <CabinetBody onLogout={onLogout} canUseZoomSdk={Boolean(jwtToken)} />
  );

  if (!jwtToken) {
    return cabinetView;
  }

  return <ZoomProvider jwtToken={jwtToken}>{cabinetView}</ZoomProvider>;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
