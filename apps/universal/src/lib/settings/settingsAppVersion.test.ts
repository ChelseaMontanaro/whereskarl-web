import { describe, expect, it } from 'vitest';

import { resolveSettingsAppVersionLabel } from '@/lib/settings/settingsAppVersion';

describe('Phase 26 — Settings app version label', () => {
  it('uses the Expo config version without inventing a build number', () => {
    expect(
      resolveSettingsAppVersionLabel({
        expoConfigVersion: '1.0.0',
        nativeApplicationVersion: null,
        iosBuildNumber: null,
        executionEnvironment: 'storeClient',
      }),
    ).toBe('Version 1.0.0');
  });

  it('does not append Expo Go host build numbers', () => {
    expect(
      resolveSettingsAppVersionLabel({
        expoConfigVersion: '1.0.0',
        nativeApplicationVersion: '1.0.0',
        iosBuildNumber: '2.32.18',
        executionEnvironment: 'storeClient',
      }),
    ).toBe('Version 1.0.0');
  });

  it('appends a build number only when Expo config actually defines one', () => {
    expect(
      resolveSettingsAppVersionLabel({
        expoConfigVersion: '1.0.0',
        nativeApplicationVersion: '1.0.0',
        iosBuildNumber: '14',
        executionEnvironment: 'standalone',
      }),
    ).toBe('Version 1.0.0 (14)');
  });

  it('does not hardcode the mockup Version 1.0.0 (1) string', () => {
    expect(
      resolveSettingsAppVersionLabel({
        expoConfigVersion: '1.0.0',
      }),
    ).not.toBe('Version 1.0.0 (1)');
  });

  it('falls back to nativeApplicationVersion, then unavailable', () => {
    expect(
      resolveSettingsAppVersionLabel({
        expoConfigVersion: null,
        nativeApplicationVersion: '1.2.3',
      }),
    ).toBe('Version 1.2.3');
    expect(resolveSettingsAppVersionLabel({})).toBe('Version unavailable');
  });
});
