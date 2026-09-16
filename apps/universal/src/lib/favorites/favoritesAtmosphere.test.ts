import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  FAVORITES_ATMOSPHERE_FOCAL_POINT,
  FAVORITES_ATMOSPHERE_IMAGE_KEY,
  FAVORITES_ATMOSPHERE_IMAGE_SIZE,
  FAVORITES_ATMOSPHERE_SUBJECT,
  resolveCoverCrop,
  resolveFavoritesAtmosphereContentPosition,
  resolveFavoritesAtmosphereCoverCrop,
  resolveFavoritesAtmosphereImageUrl,
} from '@/lib/favorites/favoritesAtmosphere';
import { HERO_CDN_BASE, heroCdnUrlForKey } from '@/lib/home/heroAssets';
import { LAYOUT_VERIFICATION_WIDTHS } from '@/lib/layout/responsiveWidth';

function readSource(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf8');
}

describe('Favorites atmosphere — approved production asset', () => {
  it('resolves marin-headlands/day.png through the existing Home CDN URL-builder', () => {
    expect(FAVORITES_ATMOSPHERE_IMAGE_KEY).toBe('hero/marin-headlands/day.png');
    expect(resolveFavoritesAtmosphereImageUrl()).toBe(
      heroCdnUrlForKey(FAVORITES_ATMOSPHERE_IMAGE_KEY),
    );
    expect(resolveFavoritesAtmosphereImageUrl()).toBe(
      `${HERO_CDN_BASE}/hero/marin-headlands/day.png`,
    );
  });

  it('uses the shared expo-image focal-position helper rather than a second crop system', () => {
    expect(resolveFavoritesAtmosphereContentPosition()).toEqual({
      left: '50%',
      top: '40%',
    });
  });
});

describe('Favorites atmosphere — cover crop keeps Golden Gate / fog in frame', () => {
  it('keeps the bridge/fog subject inside the visible cover window at every verification size', () => {
    for (const viewport of LAYOUT_VERIFICATION_WIDTHS) {
      const crop = resolveFavoritesAtmosphereCoverCrop(
        viewport.width,
        viewport.height,
      );

      expect(crop.x0).toBeLessThanOrEqual(FAVORITES_ATMOSPHERE_SUBJECT.xMin + 0.02);
      expect(crop.x1).toBeGreaterThanOrEqual(FAVORITES_ATMOSPHERE_SUBJECT.xMax - 0.02);
      expect(crop.x0).toBeLessThan(0.5);
      expect(crop.x1).toBeGreaterThan(0.5);
    }
  });

  it('on 390/430 portrait, crops left/right only and still shows both towers', () => {
    for (const width of [390, 430] as const) {
      const height = width === 390 ? 844 : 932;
      const crop = resolveFavoritesAtmosphereCoverCrop(width, height);
      const imageAspect =
        FAVORITES_ATMOSPHERE_IMAGE_SIZE.width /
        FAVORITES_ATMOSPHERE_IMAGE_SIZE.height;
      const viewportAspect = width / height;

      expect(viewportAspect).toBeLessThan(imageAspect);
      expect(crop.y0).toBeCloseTo(0, 5);
      expect(crop.y1).toBeCloseTo(1, 5);
      expect(crop.x1 - crop.x0).toBeLessThan(0.3);
      expect(crop.x0).toBeLessThanOrEqual(0.4);
      expect(crop.x1).toBeGreaterThanOrEqual(0.6);
    }
  });

  it('does not use naive far-left focal that would clip the right tower on phones', () => {
    const leftBiased = resolveCoverCrop({
      imageWidth: FAVORITES_ATMOSPHERE_IMAGE_SIZE.width,
      imageHeight: FAVORITES_ATMOSPHERE_IMAGE_SIZE.height,
      viewportWidth: 390,
      viewportHeight: 844,
      focalX: 0.34,
      focalY: 0.38,
    });
    const approved = resolveFavoritesAtmosphereCoverCrop(390, 844);

    expect(leftBiased.x1).toBeLessThan(FAVORITES_ATMOSPHERE_SUBJECT.xMax);
    expect(approved.x1).toBeGreaterThanOrEqual(FAVORITES_ATMOSPHERE_SUBJECT.xMax);
    expect(FAVORITES_ATMOSPHERE_FOCAL_POINT.x).toBe(0.5);
  });
});

describe('Favorites atmosphere — full-view presentation contract', () => {
  it('fills the Favorites viewport instead of a 280–440pt header band', () => {
    const background = readSource(
      'src/components/favorites/FavoritesAtmosphereBackground.tsx',
    );
    const screen = readSource('src/app/favorites.tsx');

    expect(background).toContain('contentFit="cover"');
    expect(background).toContain('StyleSheet.absoluteFill');
    expect(background).toContain("height: '40%'");
    expect(background).not.toContain("height: '62%'");
    expect(background).not.toContain('0.94');
    expect(background).not.toContain('resolveFavoritesAtmosphereHeight');
    expect(background).not.toMatch(/height:\s*280/);
    expect(background).not.toMatch(/height:\s*440/);
    expect(screen).toContain('<FavoritesAtmosphereBackground');
    expect(screen).not.toContain('atmosphereHeight');
    expect(screen).not.toContain('resolveFavoritesAtmosphereHeight');
  });

  it('references the photo remotely via heroCdnUrlForKey and does not bundle a PNG', () => {
    const background = readSource(
      'src/components/favorites/FavoritesAtmosphereBackground.tsx',
    );
    const atmosphere = readSource('src/lib/favorites/favoritesAtmosphere.ts');

    expect(atmosphere).toContain('heroCdnUrlForKey');
    expect(background).toContain('resolveFavoritesAtmosphereImageUrl');
    expect(background).not.toContain('require(');
    expect(atmosphere).not.toMatch(/\.png['"]\s*\)/);
  });

  it('keeps the photo fixed behind scrolling content without tiling', () => {
    const screen = readSource('src/app/favorites.tsx');

    expect(screen).toContain('contentInsetAdjustmentBehavior="never"');
    expect(screen.indexOf('<FavoritesAtmosphereBackground')).toBeLessThan(
      screen.indexOf('<ScrollView'),
    );
    expect(screen).not.toContain('resizeMode="repeat"');
  });
});
