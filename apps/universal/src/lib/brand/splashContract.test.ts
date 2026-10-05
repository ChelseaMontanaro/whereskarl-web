import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

function read(relativePath: string): Buffer {
  return readFileSync(resolve(process.cwd(), relativePath));
}

describe('native splash branding', () => {
  it('keeps the navy splash and the approved Karl cloud, not the Expo chevron', () => {
    const appJson = JSON.parse(read('app.json').toString('utf8')) as {
      expo: {
        version: string;
        icon: string;
        ios: { bundleIdentifier: string; buildNumber: string; icon: string };
        plugins: Array<string | [string, { backgroundColor?: string; image?: string; imageWidth?: number }]>;
      };
    };
    const splash = appJson.expo.plugins.find(
      (plugin) => Array.isArray(plugin) && plugin[0] === 'expo-splash-screen',
    );
    expect(splash).toBeTruthy();
    const config = (splash as [string, { backgroundColor: string; image: string; imageWidth: number }])[1];

    expect(config.backgroundColor).toBe('#030B14');
    expect(config.image).toBe('./assets/images/splash-icon.png');
    expect(config.imageWidth).toBe(76);
    expect(appJson.expo.ios.icon).toBe('./assets/images/wheres-karl-app-icon.png');
    expect(appJson.expo.version).toBe('1.0.1');
    expect(appJson.expo.ios.buildNumber).toBe('4');
    expect(appJson.expo.ios.bundleIdentifier).toBe('whereskarl.live.app');

    const splashBytes = read('assets/images/splash-icon.png');
    const approvedCloud = read('assets/images/brand/wheres-karl-logo@2x.png');
    const expoChevron = read('assets/images/expo-logo.png');
    const iosIcon = read('assets/images/wheres-karl-app-icon.png');

    expect(splashBytes.equals(approvedCloud)).toBe(true);
    expect(splashBytes.equals(expoChevron)).toBe(false);
    expect(splashBytes.equals(iosIcon)).toBe(false);
    expect(splashBytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe(
      true,
    );
  });
});
