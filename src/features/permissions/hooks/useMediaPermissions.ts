import { useCallback, useEffect, useMemo, useState } from 'react';

// react-native
import { AppState, Linking } from 'react-native';

// api
import {
  areMediaPermissionsGranted,
  getMediaPermissionsStatus,
  getPermissionStatusLabel,
  requestMediaPermissions,
} from '../api/mediaPermissions';

// types
import type { MediaPermissionsStatusType } from '../types';

type UseMediaPermissionsParamsType = {
  onAllGranted: VoidFunction;
};

export function useMediaPermissions({
  onAllGranted,
}: UseMediaPermissionsParamsType) {
  const [status, setStatus] = useState<MediaPermissionsStatusType | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);

  const refreshPermissions = useCallback(async () => {
    const nextStatus = await getMediaPermissionsStatus();
    setStatus(nextStatus);
  }, []);

  // Load current camera/mic grants so the first screen reflects OS state.
  useEffect(() => {
    refreshPermissions();
  }, [refreshPermissions]);

  // Re-check after the user returns from system Settings.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        refreshPermissions();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [refreshPermissions]);

  const hasAllPermissions = areMediaPermissionsGranted(status);
  const needsSettings = Boolean(
    status &&
      ((!status.camera.isGranted && !status.camera.canAskAgain) ||
        (!status.microphone.isGranted && !status.microphone.canAskAgain))
  );

  const handleAllow = useCallback(async () => {
    setIsRequesting(true);
    try {
      const nextStatus = await requestMediaPermissions();
      setStatus(nextStatus);
      if (areMediaPermissionsGranted(nextStatus)) {
        onAllGranted();
      }
    } finally {
      setIsRequesting(false);
    }
  }, [onAllGranted]);

  const handleOpenSettings = useCallback(async () => {
    await Linking.openSettings();
  }, []);

  const cameraLabel = useMemo(() => {
    if (!status) {
      return 'Checking…';
    }

    return getPermissionStatusLabel(status.camera);
  }, [status]);

  const microphoneLabel = useMemo(() => {
    if (!status) {
      return 'Checking…';
    }

    return getPermissionStatusLabel(status.microphone);
  }, [status]);

  const primaryButton = useMemo(() => {
    if (hasAllPermissions) {
      return {
        title: 'Continue',
        onPress: onAllGranted,
        isDisabled: false,
      };
    }

    return {
      title: isRequesting ? 'Waiting for system dialog…' : 'Allow access',
      onPress: handleAllow,
      isDisabled: isRequesting || status == null,
    };
  }, [hasAllPermissions, isRequesting, onAllGranted, handleAllow, status]);

  return {
    isCameraGranted: Boolean(status?.camera.isGranted),
    isMicrophoneGranted: Boolean(status?.microphone.isGranted),
    needsSettings,
    cameraLabel,
    microphoneLabel,
    primaryButton,
    handleOpenSettings,
  };
}
