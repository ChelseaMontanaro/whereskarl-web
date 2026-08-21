import { describe, expect, it } from 'vitest';

import {
  getKarlReadParagraph,
  getSelectedLocationHourlyPeriods,
} from '@/lib/map/mapPanelDisplay';
import type { LocationWeather } from '@whereskarl/schemas';

function makeLocation(
  overrides: Partial<LocationWeather> = {},
): LocationWeather {
  return {
    id: 'tiburon',
    name: 'Tiburon',
    region: 'north-bay',
    latitude: 37.87,
    longitude: -122.46,
    temperature: 62,
    fogScore: 20,
    sunshineScore: 80,
    windSpeed: 8,
    windDirection: 'W',
    status: 'Clear skies',
    karlReason: 'Sun breaking through north of the Gate.',
    updatedAt: new Date().toISOString(),
    ...overrides,
  } as LocationWeather;
}

describe('mapPanelDisplay selected-location copy', () => {
  it('prefers karlReason for Karl’s Read', () => {
    expect(getKarlReadParagraph(makeLocation())).toBe(
      'Sun breaking through north of the Gate.',
    );
  });

  it('falls back to predictionReason then status', () => {
    expect(
      getKarlReadParagraph(
        makeLocation({
          karlReason: undefined,
          prediction: {
            projectedFogScore1h: 35,
            predictionReason: 'Fog likely to thicken next hour.',
          },
        }),
      ),
    ).toBe('Fog likely to thicken next hour.');

    expect(
      getKarlReadParagraph(
        makeLocation({
          karlReason: '  ',
          prediction: undefined,
          status: 'Patchy fog',
        }),
      ),
    ).toBe('Patchy fog');
  });

  it('builds Now + Next hr outlook when projection exists', () => {
    const periods = getSelectedLocationHourlyPeriods(
      makeLocation({
        prediction: {
          projectedFogScore1h: 55,
        },
      }),
    );

    expect(periods).toHaveLength(2);
    expect(periods[0]?.label).toBe('Now');
    expect(periods[1]?.label).toBe('Next hr');
    expect(periods[1]?.caption.length).toBeGreaterThan(0);
  });
});
