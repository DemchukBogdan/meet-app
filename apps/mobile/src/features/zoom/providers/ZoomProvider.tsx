import { useMemo, type ReactNode } from 'react';

// libraries
import { ZoomSDKProvider } from '@zoom/meetingsdk-react-native';

// config
import { getZoomScreenShareConfig } from '../config/zoomConfig';

// constants
import { ZOOM_SDK_DOMAIN, ZOOM_SDK_LOG_SIZE } from '../constants';

type ZoomProviderPropsType = {
  jwtToken: string;
  children: ReactNode;
};

export function ZoomProvider({ jwtToken, children }: ZoomProviderPropsType) {
  const screenShare = getZoomScreenShareConfig();
  const config = useMemo(
    () => ({
      jwtToken,
      domain: ZOOM_SDK_DOMAIN,
      enableLog: true,
      logSize: ZOOM_SDK_LOG_SIZE,
      appGroupId: screenShare.appGroupId,
      replaykitBundleIdentifier: screenShare.replaykitBundleIdentifier,
    }),
    [jwtToken, screenShare.appGroupId, screenShare.replaykitBundleIdentifier],
  );

  return <ZoomSDKProvider config={config}>{children}</ZoomSDKProvider>;
}
