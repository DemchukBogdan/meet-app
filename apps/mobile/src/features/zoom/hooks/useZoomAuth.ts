import { useEffect, useState } from 'react';

// libraries
import { useZoomEvents } from '@zoom/meetingsdk-react-native';

// constants
import { AUTH_SUCCESS_ERRORS } from '../constants';

// types
import type { ZoomAuthStatusType, ZoomServiceType } from '../types';

export function useZoomAuth(zoomService: ZoomServiceType) {
  const [authStatus, setAuthStatus] = useState<ZoomAuthStatusType>('pending');
  const [authError, setAuthError] = useState<string | null>(null);

  useZoomEvents({
    onAuthReturn: ({ error, internalErrorCode }) => {
      console.log('[Zoom auth]', { error, internalErrorCode });
      if (AUTH_SUCCESS_ERRORS.has(error)) {
        setAuthStatus('ready');
        setAuthError(null);
        return;
      }
      setAuthStatus('error');
      setAuthError(
        internalErrorCode != null
          ? `${error} (internal ${internalErrorCode})`
          : error,
      );
    },
  });

  // Cover the race where auth finished before the event listener attached.
  useEffect(() => {
    let isCancelled = false;

    const checkInitialized = async () => {
      try {
        const isReady = await zoomService.isInitialized();
        if (!isCancelled && isReady) {
          setAuthStatus('ready');
          setAuthError(null);
        }
      } catch {
        // Keep waiting for onAuthReturn if the native query is not ready yet.
      }
    };

    checkInitialized();

    return () => {
      isCancelled = true;
    };
  }, [zoomService]);

  return {
    authStatus,
    authError,
    isSdkReady: authStatus === 'ready',
  };
}
