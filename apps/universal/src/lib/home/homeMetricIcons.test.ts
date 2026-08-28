import { describe, expect, it } from 'vitest';

import {
  resolveFogCoverageMetricIcon,
  resolveFogCoverageMetricIntensity,
  resolveHomeClearConditionIconUri,
} from '@/lib/home/homeMetricIcons';
import {
  getPhonePortraitConditionIconSvg,
  getPhonePortraitFogRailConditionIconDataUri,
} from '@/lib/map/phonePortraitConditionIcons';

function svgFromDataUri(uri: string): string {
  return decodeURIComponent(uri.replace(/^data:image\/svg\+xml;charset=utf-8,/, ''));
}

describe('homeMetricIcons', () => {
  it.each([
    [0, 'clear'],
    [24, 'clear'],
    [25, 'lightFog'],
    [49, 'lightFog'],
    [50, 'foggy'],
    [74, 'foggy'],
    [75, 'karlTerritory'],
    [100, 'karlTerritory'],
  ] as const)(
    'maps fog coverage %i to Map intensity %s',
    (percent, intensity) => {
      expect(resolveFogCoverageMetricIntensity(percent)).toBe(intensity);
    },
  );

  it('uses phone-portrait fog artwork for non-Karl fog coverage', () => {
    const lightFog = resolveFogCoverageMetricIcon(30);
    expect(lightFog).toEqual({
      kind: 'condition',
      uri: getPhonePortraitFogRailConditionIconDataUri('lightFog'),
    });
  });

  it('uses KarlLogo for Karl Territory fog coverage', () => {
    expect(resolveFogCoverageMetricIcon(82)).toEqual({ kind: 'karlLogo' });
  });

  it('uses cloud-free Map clear sun/moon for Clear Skies icons', () => {
    const day = resolveHomeClearConditionIconUri({ isNighttime: false });
    const night = resolveHomeClearConditionIconUri({ isNighttime: true });

    expect(day).toBe(
      getPhonePortraitFogRailConditionIconDataUri('clear', {
        isNighttime: false,
      }),
    );
    expect(night).toBe(
      getPhonePortraitFogRailConditionIconDataUri('clear', {
        isNighttime: true,
      }),
    );
    expect(svgFromDataUri(day)).toBe(
      getPhonePortraitConditionIconSvg('clear', { isNighttime: false }),
    );
    expect(svgFromDataUri(night)).toContain('#9FC4E6');
    expect(day).not.toBe(night);
  });
});
