import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { presentMapLocationCardFogMetric } from '@/lib/map/mapLocationCardFogMetric';

const QUALITATIVE_FOG_LABELS = [
  'Clear',
  'Clear Night',
  'Light Fog',
  'Patchy',
  'Patchy Fog',
  'Foggy',
  'Karl Territory',
];

describe('map location card fog metric', () => {
  it.each([0, 11, 35, 72, 100])(
    'keeps %s% and labels the supporting line Coverage',
    (fogScore) => {
      expect(presentMapLocationCardFogMetric(fogScore)).toEqual({
        title: 'FOG',
        value: `${fogScore}%`,
        supporting: 'Coverage',
      });
    },
  );

  it('does not invent a qualitative descriptor for any fog percentage', () => {
    for (const fogScore of [0, 11, 35, 72, 100]) {
      const metric = presentMapLocationCardFogMetric(fogScore);
      expect(metric.supporting).toBe('Coverage');
      expect(QUALITATIVE_FOG_LABELS).not.toContain(metric.supporting);
    }
  });

  it('keeps a missing score as the existing placeholder', () => {
    expect(presentMapLocationCardFogMetric(null)).toEqual({
      title: 'FOG',
      value: '—',
      supporting: 'Coverage',
    });
  });
});

describe('map location card fog source contract', () => {
  const preview = readFileSync(
    resolve(process.cwd(), 'src/components/SelectedLocationPreview.tsx'),
    'utf8',
  );
  const favoritesCard = readFileSync(
    resolve(process.cwd(), 'src/components/favorites/SavedLocationCard.tsx'),
    'utf8',
  );
  const detail = readFileSync(
    resolve(process.cwd(), 'src/lib/location/detailDisplay.ts'),
    'utf8',
  );

  it('renders Coverage only on the Map selected-location Fog cell', () => {
    expect(preview).toContain('presentMapLocationCardFogMetric(fogScore)');
    expect(preview).toContain('title="FOG"');
    expect(preview).toContain('value={fogMetric.value}');
    expect(preview).toContain('supporting={fogMetric.supporting}');
    expect(preview).toContain('resolveFogScore(location)');
    expect(preview).not.toContain('getFogIntensityLabel');
    expect(preview).toContain('title="CLEAR SKY SCORE"');
    expect(preview).toContain('title="TEMP"');
    expect(preview).toContain('title="WIND"');
  });

  it('leaves Favorites and location detail on the shared qualitative label', () => {
    expect(favoritesCard).toContain('getFogIntensityLabel');
    expect(detail).toContain('getLocationConditionLabel');
  });
});