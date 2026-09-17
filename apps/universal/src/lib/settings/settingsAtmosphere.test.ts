import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  SETTINGS_ATMOSPHERE_FOCAL_POINT,
  SETTINGS_ATMOSPHERE_IMAGE_KEY,
  SETTINGS_ATMOSPHERE_IMAGE_SIZE,
  SETTINGS_ATMOSPHERE_SUBJECT,
  resolveSettingsAtmosphereContentPosition,
  resolveSettingsAtmosphereCoverCrop,
  resolveSettingsAtmosphereImageUrl,
} from '@/lib/settings/settingsAtmosphere';
import { HERO_CDN_BASE, heroCdnUrlForKey } from '@/lib/home/heroAssets';
import { LAYOUT_VERIFICATION_WIDTHS } from '@/lib/layout/responsiveWidth';

function readSource(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf8');
}

describe('Phase 26 — Settings atmosphere uses the approved production asset', () => {
  it('resolves marin-headlands/day.png through the existing Home CDN helper', () => {
    expect(SETTINGS_ATMOSPHERE_IMAGE_KEY).toBe('hero/marin-headlands/day.png');
    expect(resolveSettingsAtmosphereImageUrl()).toBe(
      heroCdnUrlForKey(SETTINGS_ATMOSPHERE_IMAGE_KEY),
    );
    expect(resolveSettingsAtmosphereImageUrl()).toBe(
      `${HERO_CDN_BASE}/hero/marin-headlands/day.png`,
    );
  });

  it('uses the shared expo-image focal-position helper', () => {
    expect(resolveSettingsAtmosphereContentPosition()).toEqual({
      left: '50%',
      top: '40%',
    });
    expect(SETTINGS_ATMOSPHERE_FOCAL_POINT).toEqual({ x: 0.5, y: 0.4 });
  });

  it('keeps the bridge/fog subject in frame at every verification size', () => {
    for (const viewport of LAYOUT_VERIFICATION_WIDTHS) {
      const crop = resolveSettingsAtmosphereCoverCrop(
        viewport.width,
        viewport.height,
      );
      expect(crop.x0).toBeLessThanOrEqual(SETTINGS_ATMOSPHERE_SUBJECT.xMin + 0.02);
      expect(crop.x1).toBeGreaterThanOrEqual(
        SETTINGS_ATMOSPHERE_SUBJECT.xMax - 0.02,
      );
    }
  });

  it('does not bundle a PNG or import Favorites/Home background components', () => {
    const background = readSource(
      'src/components/settings/SettingsAtmosphereBackground.tsx',
    );
    const atmosphere = readSource('src/lib/settings/settingsAtmosphere.ts');
    const screen = readSource('src/app/settings.tsx');

    expect(atmosphere).toContain('heroCdnUrlForKey');
    expect(background).toContain('resolveSettingsAtmosphereImageUrl');
    expect(background).toContain('contentFit="cover"');
    expect(background).not.toContain('require(');
    expect(screen).toContain('<SettingsAtmosphereBackground');
    expect(screen).not.toContain('FavoritesAtmosphereBackground');
    expect(screen).not.toContain('HomeHeroBackground');
    expect(SETTINGS_ATMOSPHERE_IMAGE_SIZE.width).toBe(1672);
  });
});
