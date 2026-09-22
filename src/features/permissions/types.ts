export type PermissionItemStatusType = {
  isGranted: boolean;
  canAskAgain: boolean;
};

export type MediaPermissionsStatusType = {
  camera: PermissionItemStatusType;
  microphone: PermissionItemStatusType;
};
