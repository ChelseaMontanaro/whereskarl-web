import { describe, expect, it } from 'vitest';

import { contentPositionFromFocalPoint } from '@/lib/location/locationCircularImage';
import {
  getPhonePortraitConditionIconSvg,
  getPhonePortraitFogRailConditionIconDataUri,
  getPhonePortraitMarkerConditionIconDataUri,
} from '@/lib/map/phonePortraitConditionIcons';

describe('LocationCircularImage focal crop', () => {
  it('defaults to center when focalPoint is absent', () => {
    expect(contentPositionFromFocalPoint(null)).toEqual({
      top: '50%',
      left: '50%',
    });
  });

  it('maps normalized focal fractions to percent contentPosition', () => {
    expect(contentPositionFromFocalPoint({ x: 0.5, y: 0.52 })).toEqual({
      left: '50%',
      top: '52%',
    });
  });
});

describe('phone-portrait marker icon treatment', () => {
  it('uses a lighter native marker footprint than web CSS rem tokens', async () => {
    const { PHONE_PORTRAIT_MARKER_ICON_PX, PHONE_PORTRAIT_MARKER_ICON_OPACITY } =
      await import('@/lib/map/phonePortraitMapPresentation');
    expect(PHONE_PORTRAIT_MARKER_ICON_PX).toBeLessThanOrEqual(28);
    expect(PHONE_PORTRAIT_MARKER_ICON_OPACITY).toBeGreaterThan(0.9);
    expect(PHONE_PORTRAIT_MARKER_ICON_OPACITY).toBeLessThan(1);
  });

  it('uses cloud-free clear artwork for day and night', () => {
    const day = getPhonePortraitConditionIconSvg('clear', { isNighttime: false });
    const night = getPhonePortraitConditionIconSvg('clear', { isNighttime: true });
    expect(day).toContain('#F2A326');
    expect(night).toContain('#9FC4E6');
    expect(day).not.toContain('rect x="8" y="25.8"');
  });

  it('keeps fog-tier semantics distinct across rail and markers', () => {
    const lightFog = getPhonePortraitFogRailConditionIconDataUri('lightFog');
    const foggy = getPhonePortraitMarkerConditionIconDataUri('foggy');
    expect(lightFog.startsWith('data:image/svg+xml')).toBe(true);
    expect(foggy.startsWith('data:image/svg+xml')).toBe(true);
    expect(lightFog).not.toBe(foggy);
  });
});
