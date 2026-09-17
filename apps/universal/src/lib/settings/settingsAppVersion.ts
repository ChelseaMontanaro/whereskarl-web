/**
 * Settings footer version label.
 *
 * Uses Expo app config (`expo.version`) when available. A native build number
 * is appended only when `ios.buildNumber` is actually configured — never
 * invented as "(1)" from the mockup, and never taken from Expo Go's host app.
 */
export type SettingsAppVersionSource = {
  expoConfigVersion?: string | null;
  nativeApplicationVersion?: string | null;
  iosBuildNumber?: string | null;
  executionEnvironment?: string | null;
};

function trimmed(value: string | null | undefined): string | null {
  const next = value?.trim();
  return next ? next : null;
}

export function resolveSettingsAppVersionLabel(
  source: SettingsAppVersionSource,
): string {
  const version =
    trimmed(source.expoConfigVersion) ??
    trimmed(source.nativeApplicationVersion);

  if (!version) {
    return 'Version unavailable';
  }

  const configuredBuild = trimmed(source.iosBuildNumber);
  const runningInExpoGo = source.executionEnvironment === 'storeClient';

  if (configuredBuild && !runningInExpoGo) {
    return `Version ${version} (${configuredBuild})`;
  }

  return `Version ${version}`;
}
