import { Camera } from 'expo-camera';

// types
import type {
  MediaPermissionsStatusType,
  PermissionItemStatusType,
} from '../types';

function toPermissionItemStatus(permission: {
  granted: boolean;
  canAskAgain: boolean;
}): PermissionItemStatusType {
  return {
    isGranted: permission.granted,
    canAskAgain: permission.canAskAgain,
  };
}

export async function getMediaPermissionsStatus(): Promise<MediaPermissionsStatusType> {
  const [camera, microphone] = await Promise.all([
    Camera.getCameraPermissionsAsync(),
    Camera.getMicrophonePermissionsAsync(),
  ]);

  return {
    camera: toPermissionItemStatus(camera),
    microphone: toPermissionItemStatus(microphone),
  };
}

export async function requestMediaPermissions(): Promise<MediaPermissionsStatusType> {
  const camera = await Camera.requestCameraPermissionsAsync();
  const microphone = await Camera.requestMicrophonePermissionsAsync();

  return {
    camera: toPermissionItemStatus(camera),
    microphone: toPermissionItemStatus(microphone),
  };
}

export function areMediaPermissionsGranted(
  status: MediaPermissionsStatusType | null,
): boolean {
  return Boolean(status?.camera.isGranted && status?.microphone.isGranted);
}

export function getPermissionStatusLabel(
  item: PermissionItemStatusType,
): string {
  if (item.isGranted) {
    return 'Allowed';
  }

  if (!item.canAskAgain) {
    return 'Blocked — enable in Settings';
  }

  return 'Not allowed';
}
