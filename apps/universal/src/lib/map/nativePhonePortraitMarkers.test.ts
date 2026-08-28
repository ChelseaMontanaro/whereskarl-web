import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  resolveMarkerDisplayIntensity,
  resolveFogScore,
} from '@whereskarl/domain';

describe('native phone-portrait map markers', () => {
  it('matches mobile-web marker meta: clear-sky score only, never fog percent', () => {
    const markerViewSource = readFileSync(
      resolve(
        process.cwd(),
        'src/components/KarlMap/KarlMapMarkerView.tsx',
      ),
      'utf8',
    );

    expect(markerViewSource).not.toMatch(/fogScore|formatFogPercent|Fog:/);
    expect(markerViewSource).toContain('getPhonePortraitMarkerScoreValue');
    expect(markerViewSource).not.toContain('formatMarkerTemperature');
  });

  it('uses the same marker intensity resolver as mobile web', () => {
    expect(
      resolveMarkerDisplayIntensity({ fogScore: 26, sunshineScore: 82 }),
    ).toBe('clear');
    expect(
      resolveMarkerDisplayIntensity({ fogScore: 35, sunshineScore: 55 }),
    ).toBe('lightFog');
    expect(
      resolveMarkerDisplayIntensity({ fogScore: 60, sunshineScore: 35 }),
    ).toBe('foggy');
    expect(
      resolveMarkerDisplayIntensity({ fogScore: 96, sunshineScore: 10 }),
    ).toBe('karlTerritory');
  });

  it('keeps fog score off markers while still using it for intensity artwork', () => {
    const foggy = { fogScore: 82, sunshineScore: 18 };
    expect(resolveFogScore(foggy)).toBe(82);
    expect(Math.round(foggy.sunshineScore)).toBe(18);
  });
});

describe('native phone-portrait fog rail', () => {
  it('renders text labels and the canonical Karl logo for Karl Territory', () => {
    const railSource = readFileSync(
      resolve(
        process.cwd(),
        'src/components/map/MapPhonePortraitFogRail.tsx',
      ),
      'utf8',
    );

    expect(railSource).toContain('Fog');
    expect(railSource).toContain('Intensity');
    expect(railSource).toContain('getFogIntensityLabel');
    expect(railSource).toContain("intensity === 'karlTerritory'");
    expect(railSource).toContain('<KarlLogo size={RAIL_ICON_SIZE} />');
  });

  it('loads the shared Where\'s Karl logo asset for native surfaces', () => {
    const logoSource = readFileSync(
      resolve(process.cwd(), 'src/lib/brand/karlLogo.ts'),
      'utf8',
    );

    expect(logoSource).toContain('wheres-karl-logo.png');
    expect(logoSource).not.toContain('wheres-karl-logo@2x.png');
  });

  it('keeps Peninsula fully scrollable on the phone region chip row', () => {
    const controlsSource = readFileSync(
      resolve(
        process.cwd(),
        'src/components/map/MapPhonePortraitControls.tsx',
      ),
      'utf8',
    );

    expect(controlsSource).toContain('horizontal');
    expect(controlsSource).toContain('flexShrink: 0');
    expect(controlsSource).toContain('chipRowTrailing');
    expect(controlsSource).toContain('marginHorizontal: -Spacing.sm');
  });
});
