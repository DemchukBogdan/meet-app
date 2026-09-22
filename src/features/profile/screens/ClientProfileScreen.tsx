// react
import { useMemo } from 'react';

// react-native
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// constants
import { BUKI_GREEN } from '@/features/auth/constants';
import { PROFILE_PAGE_TITLE, PROFILE_RETRY_TITLE } from '../constants';

// features
import { JoinZoomAsClientBlock } from '@/features/zoom';

// components
import { ProfilePlates } from '../components/ProfilePlates';

// types
import type { ClientProfileType } from '../types';

type ClientProfileContentPropsType = {
  profile: ClientProfileType | null;
  isLoading: boolean;
  errorMessage: string | null;
  canUseZoomSdk: boolean;
  onRetry: VoidFunction;
};

export function ClientProfileContent({
  profile,
  isLoading,
  errorMessage,
  canUseZoomSdk,
  onRetry,
}: ClientProfileContentPropsType) {
  const contentView = useMemo(() => {
    if (isLoading) {
      return (
        <View style={styles.stateWrap}>
          <ActivityIndicator color={BUKI_GREEN} />
        </View>
      );
    }

    if (errorMessage || !profile) {
      return (
        <View style={styles.stateWrap}>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <Pressable onPress={onRetry} style={styles.retryButton}>
            <Text style={styles.retryLabel}>{PROFILE_RETRY_TITLE}</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}
      >
        <Text style={styles.pageTitle}>{PROFILE_PAGE_TITLE}</Text>
        <ProfilePlates profile={profile} />
        <JoinZoomAsClientBlock
          displayName={profile.name}
          canUseZoomSdk={canUseZoomSdk}
        />
      </ScrollView>
    );
  }, [canUseZoomSdk, errorMessage, isLoading, onRetry, profile]);

  return contentView;
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 24,
  },
  pageTitle: {
    color: '#000',
    fontWeight: '700',
    fontSize: 18,
    lineHeight: 22,
    textAlign: 'center',
    paddingTop: 10,
    marginBottom: 10,
  },
  stateWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#000',
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    backgroundColor: BUKI_GREEN,
  },
  retryLabel: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
    color: '#fff',
  },
});
