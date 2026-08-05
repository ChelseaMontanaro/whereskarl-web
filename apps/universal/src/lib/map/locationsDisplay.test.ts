import { describe, expect, it } from 'vitest';

import type { LocationWeather } from '@whereskarl/schemas';

import {
  findStrongSearchMatch,
  prepareLocationResults,
  prepareMapLocationResults,
} from '@/lib/map/locationsDisplay';

function createLocation(
  id: string,
  name: string,
  region: LocationWeather['region'],
  aliases: string[] = [],
): LocationWeather {
  return {
    id,
    name,
    region,
    latitude: 37.8,
    longitude: -122.4,
    sunshineScore: 70,
    fogScore: 30,
    temperature: 62,
    cloudCover: 20,
    status: 'Clear',
    search: { aliases },
  } as LocationWeather;
}

const CATALOG = [
  createLocation('ocean-beach', 'Ocean Beach', 'san-francisco', [
    'OB',
    'Ocean Beach SF',
  ]),
  createLocation('tiburon', 'Tiburon', 'north-bay'),
  createLocation('richmond-district', 'Richmond District', 'san-francisco', [
    'Inner Richmond',
  ]),
];

describe('Universal search composition', () => {
  it('keeps alias-aware prefix matching via @whereskarl/search', () => {
    const results = prepareLocationResults(CATALOG, {
      query: 'oce',
      sortMode: 'name',
      filterMode: 'all',
    });

    expect(results.map((location) => location.id)).toEqual(['ocean-beach']);
  });

  it('resolves a unique alias hit as a strong match', () => {
    expect(findStrongSearchMatch(CATALOG, 'inner rich')?.id).toBe(
      'richmond-district',
    );
  });

  it('list search covers the full catalog independent of map region filters', () => {
    const searched = prepareLocationResults(CATALOG, {
      query: 'tib',
      sortMode: 'name',
      filterMode: 'all',
    });

    expect(searched.map((location) => location.id)).toEqual(['tiburon']);
  });

  it('map composition applies region filter after canonical search', () => {
    const results = prepareMapLocationResults(CATALOG, {
      query: 'tib',
      regionId: 'san-francisco',
      conditionFilter: null,
    });

    // Tiburon matches search but lives in north-bay, so the SF region filter
    // correctly yields no map markers for this query+region pair.
    expect(results).toEqual([]);
  });
});
