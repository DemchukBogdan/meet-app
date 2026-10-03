import Constants from 'expo-constants';

// utils
import { isRecord } from '@/shared/utils/isRecord';

export type ZoomExtraType = {
  zoomJwtToken?: string;
  zoomAccountId?: string;
  zoomS2sClientId?: string;
  zoomS2sClientSecret?: string;
  zoomUserEmail?: string;
  zoomAppGroupId?: string;
  zoomReplaykitBundleIdentifier?: string;
};

export type ZoomScreenShareConfigType = {
  appGroupId: string;
  replaykitBundleIdentifier: string;
};

function readExtraString(source: unknown, key: keyof ZoomExtraType): string {
  if (!isRecord(source)) {
    return '';
  }

  const value = source[key];
  return typeof value === 'string' ? value : '';
}

function loadRuntimeCredentials(): ZoomExtraType {
  try {
    // Optional file. A static import fails the bundle when it is absent,
    // so this stays a runtime require that Metro can resolve when present.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('../../../../zoom.runtime.json');
  } catch {
    return {};
  }
}

export function getZoomExtra(): ZoomExtraType {
  const extra = Constants.expoConfig?.extra;
  const runtime = loadRuntimeCredentials();

  return {
    zoomJwtToken: readExtraString(extra, 'zoomJwtToken'),
    zoomAccountId:
      readExtraString(runtime, 'zoomAccountId') ||
      readExtraString(extra, 'zoomAccountId'),
    zoomS2sClientId:
      readExtraString(runtime, 'zoomS2sClientId') ||
      readExtraString(extra, 'zoomS2sClientId'),
    zoomS2sClientSecret:
      readExtraString(runtime, 'zoomS2sClientSecret') ||
      readExtraString(extra, 'zoomS2sClientSecret'),
    zoomUserEmail:
      readExtraString(runtime, 'zoomUserEmail') ||
      readExtraString(extra, 'zoomUserEmail'),
    zoomAppGroupId: readExtraString(extra, 'zoomAppGroupId'),
    zoomReplaykitBundleIdentifier: readExtraString(
      extra,
      'zoomReplaykitBundleIdentifier',
    ),
  };
}

export function getZoomJwtToken(): string {
  return getZoomExtra().zoomJwtToken ?? '';
}

export function getZoomScreenShareConfig(): ZoomScreenShareConfigType {
  const extra = getZoomExtra();
  const bundleId = Constants.expoConfig?.ios?.bundleIdentifier ?? '';

  return {
    appGroupId: extra.zoomAppGroupId || (bundleId ? `group.${bundleId}` : ''),
    replaykitBundleIdentifier:
      extra.zoomReplaykitBundleIdentifier ||
      (bundleId ? `${bundleId}.ZoomScreenShare` : ''),
  };
}

export function hasZoomCreateCredentials(extra: ZoomExtraType): boolean {
  return Boolean(
    extra.zoomAccountId &&
    extra.zoomS2sClientId &&
    extra.zoomS2sClientSecret &&
    extra.zoomUserEmail,
  );
}

export function getZoomCreateConfigLog(extra: ZoomExtraType) {
  return {
    hasJwt: Boolean(extra.zoomJwtToken),
    hasAccountId: Boolean(extra.zoomAccountId),
    hasS2sClientId: Boolean(extra.zoomS2sClientId),
    hasS2sClientSecret: Boolean(extra.zoomS2sClientSecret),
    hasUserEmail: Boolean(extra.zoomUserEmail),
    hasAppGroup: Boolean(extra.zoomAppGroupId),
    hasReplaykitExtension: Boolean(extra.zoomReplaykitBundleIdentifier),
    canCreate: hasZoomCreateCredentials(extra),
  };
}
