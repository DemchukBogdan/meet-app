import { useMemo } from 'react';

// libraries
import { useZoom } from '@zoom/meetingsdk-react-native';

// services
import { createZoomService } from '../services/createZoomService';

export function useZoomService() {
  const sdk = useZoom();

  return useMemo(() => createZoomService(sdk), [sdk]);
}
