import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { ZoomProvider } from '@/features/zoom/providers/ZoomProvider';
import { useZoomAuth } from '@/features/zoom/hooks/useZoomAuth';
import { useZoomService } from '@/features/zoom/hooks/useZoomService';

import { ZoomSessionBridge } from '../join/zoom-session-bridge';

import type { ZoomJoinRequest } from '@meet/join';

type DeferredType = {
  resolve: () => void;
  reject: (error: unknown) => void;
};

type ZoomJoinHostProps = {
  bridge: ZoomSessionBridge;
  children: ReactNode;
};

export function ZoomJoinHost({ bridge, children }: ZoomJoinHostProps) {
  const [request, setRequest] = useState<ZoomJoinRequest | null>(null);
  const deferredRef = useRef<DeferredType | null>(null);

  const finish = useCallback((error?: unknown) => {
    const deferred = deferredRef.current;
    deferredRef.current = null;
    setRequest(null);
    if (!deferred) {
      return;
    }

    if (error) {
      deferred.reject(error);
      return;
    }

    deferred.resolve();
  }, []);

  useEffect(() => {
    // Mount the SDK only after a join signature arrives from the API.
    bridge.connect((next) => {
      setRequest(next);
      return new Promise<void>((resolve, reject) => {
        deferredRef.current = { resolve, reject };
      });
    });
  }, [bridge]);

  if (!request) {
    return children;
  }

  return (
    <ZoomProvider jwtToken={request.signature}>
      {children}
      <ZoomJoinRunner request={request} onFinish={finish} />
    </ZoomProvider>
  );
}

type ZoomJoinRunnerProps = {
  request: ZoomJoinRequest;
  onFinish: (error?: unknown) => void;
};

function ZoomJoinRunner({ request, onFinish }: ZoomJoinRunnerProps) {
  const zoomService = useZoomService();
  const { authError, isSdkReady } = useZoomAuth(zoomService);
  const hasStarted = useRef(false);

  useEffect(() => {
    // A rejected signature should fail the join instead of waiting forever.
    if (!authError || hasStarted.current) {
      return;
    }

    hasStarted.current = true;
    onFinish(new Error(authError));
  }, [authError, onFinish]);

  useEffect(() => {
    // Join once the native SDK accepts the backend signature.
    if (!isSdkReady || hasStarted.current) {
      return;
    }

    hasStarted.current = true;
    void zoomService
      .joinMeeting({
        userName: request.userName,
        meetingNumber: request.meetingNumber,
        password: '',
      })
      .then(() => {
        onFinish();
      })
      .catch((error: unknown) => {
        onFinish(error);
      });
  }, [
    isSdkReady,
    onFinish,
    request.meetingNumber,
    request.userName,
    zoomService,
  ]);

  return null;
}
