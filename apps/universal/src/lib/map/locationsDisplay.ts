/**
 * Map list/search presentation orchestration.
 * Fog intensity classification/labels and confidence formatting live in
 * `@whereskarl/domain`. Overlay geometry stays app-local.
 */

import {
  CLEAR_SKIES_SCORE_THRESHOLD,
  getFogIntensity,
  getLocationConditionLabel,
  locationMatchesFogIntensityFilter,
  locationQualifiesAsClearIntensity,
  resolveFogScore,
  type FogIntensity,
  type LocationConditionInput,
} from '@whereskarl/domain';
import { filterCanonicalLocationsBySearch } from '@whereskarl/search';

import type { LocationWeather } from '@whereskarl/schemas';
import {
  filterLocationsByProductRegion,
  type BayAreaVisibleProductRegionId,
} from '@/lib/map/regions';

export type LocationSortMode = 'brightest' | 'name' | 'temperature';

export type LocationFilterMode = 'all' | 'brightest';

export function toggleConditionFilter(
  current: FogIntensity | null,
  next: FogIntensity,
): FogIntensity | null {
  return current === next ? null : next;
}

export type FogOverlayStyle = {
  color: string;
  opacity: number;
  radiusMeters: number;
};

function getFogOverlayIntensity(
  location: LocationConditionInput,
): FogIntensity | null {
  const fogScore = resolveFogScore(location);
  if (fogScore === null || locationQualifiesAsClearIntensity(location)) {
    return null;
  }

  return getFogIntensity(fogScore);
}

export function getLocationFogOverlayStyle(
  location: LocationConditionInput,
): FogOverlayStyle | null {
  const intensity = getFogOverlayIntensity(location);
  const fogScore = resolveFogScore(location);

  if (!intensity || fogScore === null) {
    return null;
  }

  switch (intensity) {
    case 'clear':
      return null;
    case 'lightFog':
      return {
        color: 'rgb(228 236 244)',
        opacity: Math.min(0.22, 0.06 + (fogScore / 100) * 0.12),
        radiusMeters: 1400 + fogScore * 18,
      };
    case 'foggy':
      return {
        color: 'rgb(210 224 238)',
        opacity: Math.min(0.36, 0.1 + (fogScore / 100) * 0.22),
        radiusMeters: 2200 + fogScore * 42,
      };
    case 'karlTerritory':
      return {
        color: 'rgb(184 214 237)',
        opacity: Math.min(0.48, 0.14 + (fogScore / 100) * 0.28),
        radiusMeters: 2800 + fogScore * 58,
      };
    default:
      return null;
  }
}

export function getCloudSummary(location: LocationWeather): string {
  const conditionLabel = getLocationConditionLabel(location);
  const status = location.status?.trim();

  if (status && status !== conditionLabel) {
    return `${conditionLabel} · ${status}`;
  }

  return status || conditionLabel;
}

/**
 * Returns a single location when the query is an exact or strong match.
 * Used to auto-select/focus while typing in map search.
 */
export function findStrongSearchMatch(
  locations: LocationWeather[],
  query: string,
): LocationWeather | null {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return null;
  }

  const exactId = locations.find(
    (location) => location.id.toLowerCase() === normalizedQuery,
  );
  if (exactId) {
    return exactId;
  }

  const exactNameMatches = locations.filter(
    (location) => location.name.toLowerCase() === normalizedQuery,
  );
  if (exactNameMatches.length === 1) {
    return exactNameMatches[0];
  }

  const prefixMatches = locations.filter((location) =>
    location.name.toLowerCase().startsWith(normalizedQuery),
  );
  if (prefixMatches.length === 1) {
    return prefixMatches[0];
  }

  const searchMatches = filterCanonicalLocationsBySearch(locations, query);
  if (searchMatches.length === 1) {
    return searchMatches[0];
  }

  return null;
}

export function filterLocationsByMode(
  locations: LocationWeather[],
  mode: LocationFilterMode,
): LocationWeather[] {
  if (mode === 'all') {
    return locations;
  }

  return locations.filter(
    (location) => location.sunshineScore >= CLEAR_SKIES_SCORE_THRESHOLD,
  );
}

export function sortLocations(
  locations: LocationWeather[],
  mode: LocationSortMode,
): LocationWeather[] {
  const sorted = [...locations];

  switch (mode) {
    case 'name':
      return sorted.sort((left, right) =>
        left.name.localeCompare(right.name, undefined, { sensitivity: 'base' }),
      );
    case 'temperature':
      return sorted.sort((left, right) => right.temperature - left.temperature);
    case 'brightest':
    default:
      return sorted.sort((left, right) => {
        if (left.sunshineScore === right.sunshineScore) {
          return left.fogScore - right.fogScore;
        }

        return right.sunshineScore - left.sunshineScore;
      });
  }
}

export function prepareLocationResults(
  locations: LocationWeather[],
  options: {
    query: string;
    sortMode: LocationSortMode;
    filterMode: LocationFilterMode;
  },
): LocationWeather[] {
  const searched = options.query.trim()
    ? filterCanonicalLocationsBySearch(locations, options.query)
    : locations;
  const filtered = filterLocationsByMode(searched, options.filterMode);
  return sortLocations(filtered, options.sortMode);
}

export function prepareMapLocationResults(
  locations: LocationWeather[],
  options: {
    query: string;
    regionId: BayAreaVisibleProductRegionId | null;
    conditionFilter: FogIntensity | null;
  },
): LocationWeather[] {
  const searched = options.query.trim()
    ? filterCanonicalLocationsBySearch(locations, options.query)
    : locations;
  const regionFiltered = filterLocationsByProductRegion(
    searched,
    options.regionId,
  );
  const conditionFiltered = options.conditionFilter
    ? regionFiltered.filter((location) =>
        locationMatchesFogIntensityFilter(location, options.conditionFilter!),
      )
    : regionFiltered;

  return sortLocations(conditionFiltered, 'brightest');
}
