/**
 * Map list/search presentation — aligned with whereskarl-web/lib/map/conditions.ts.
 */

import type { LocationWeather } from '@/types/weather';
import {
  filterLocationsByProductRegion,
  type BayAreaVisibleProductRegionId,
} from '@/lib/map/regions';

export const CLEAR_SKIES_SCORE_THRESHOLD = 50;

export type LocationSortMode = 'brightest' | 'name' | 'temperature';

export type LocationFilterMode = 'all' | 'brightest';

export type FogIntensity = 'clear' | 'lightFog' | 'foggy' | 'karlTerritory';

type LocationConditionInput = Pick<
  LocationWeather,
  'fogScore' | 'sunshineScore' | 'status'
>;

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function resolveFogScore(location: LocationConditionInput): number | null {
  if (
    typeof location.fogScore === 'number' &&
    Number.isFinite(location.fogScore)
  ) {
    return clampScore(location.fogScore);
  }

  if (
    typeof location.sunshineScore === 'number' &&
    Number.isFinite(location.sunshineScore)
  ) {
    return clampScore(100 - location.sunshineScore);
  }

  return null;
}

function getFogIntensity(fogScore: number | null): FogIntensity {
  if (fogScore === null) {
    return 'clear';
  }

  if (fogScore < 25) {
    return 'clear';
  }

  if (fogScore < 50) {
    return 'lightFog';
  }

  if (fogScore < 75) {
    return 'foggy';
  }

  return 'karlTerritory';
}

function locationQualifiesAsClearIntensity(
  location: LocationConditionInput,
): boolean {
  const fogScore = resolveFogScore(location);

  if (fogScore !== null && fogScore < 25) {
    return true;
  }

  if (
    typeof location.sunshineScore === 'number' &&
    Number.isFinite(location.sunshineScore) &&
    location.sunshineScore >= 70
  ) {
    return true;
  }

  return false;
}

export function resolveLocationFogIntensity(
  location: LocationConditionInput,
): FogIntensity {
  if (locationQualifiesAsClearIntensity(location)) {
    return 'clear';
  }

  return getFogIntensity(resolveFogScore(location));
}

/** Raw fogScore bands only — use for filter matching. */
export function resolveRawLocationFogIntensity(
  location: LocationConditionInput,
): FogIntensity {
  return getFogIntensity(resolveFogScore(location));
}

/**
 * Canonical condition filter matching for map markers and overlays.
 * Clear uses clear-sky qualification; Light Fog excludes strong clear-sky locations.
 */
export function locationMatchesFogIntensityFilter(
  location: LocationConditionInput,
  intensity: FogIntensity,
): boolean {
  if (intensity === 'clear') {
    return locationQualifiesAsClearIntensity(location);
  }

  if (intensity === 'lightFog') {
    return (
      resolveRawLocationFogIntensity(location) === 'lightFog' &&
      !locationQualifiesAsClearIntensity(location)
    );
  }

  return resolveRawLocationFogIntensity(location) === intensity;
}

export function toggleConditionFilter(
  current: FogIntensity | null,
  next: FogIntensity,
): FogIntensity | null {
  return current === next ? null : next;
}

export function getFogIntensityLabel(intensity: FogIntensity): string {
  switch (intensity) {
    case 'clear':
      return 'Clear';
    case 'lightFog':
      return 'Light Fog';
    case 'foggy':
      return 'Foggy';
    case 'karlTerritory':
      return 'Karl Territory';
  }
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

export function getLocationConditionLabel(location: LocationConditionInput): string {
  const fogScore = resolveFogScore(location);

  if (fogScore !== null) {
    return getFogIntensityLabel(resolveLocationFogIntensity(location));
  }

  return location.status?.trim() || 'Conditions unavailable';
}

export function getCloudSummary(location: LocationWeather): string {
  const conditionLabel = getLocationConditionLabel(location);
  const status = location.status?.trim();

  if (status && status !== conditionLabel) {
    return `${conditionLabel} · ${status}`;
  }

  return status || conditionLabel;
}

export function formatConfidenceLabel(
  label: string | null | undefined,
): string | null {
  const trimmed = label?.trim();
  if (!trimmed || trimmed.toLowerCase() === 'unavailable') {
    return null;
  }

  return trimmed;
}

export function filterLocationsBySearch(
  locations: LocationWeather[],
  query: string,
): LocationWeather[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return locations;
  }

  return locations.filter((location) => {
    const name = location.name.toLowerCase();
    const region = location.region?.toLowerCase() ?? '';
    return (
      name.includes(normalizedQuery) ||
      region.includes(normalizedQuery) ||
      location.id.toLowerCase().includes(normalizedQuery)
    );
  });
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

  const searchMatches = filterLocationsBySearch(locations, query);
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
  const searched = filterLocationsBySearch(locations, options.query);
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
  const searched = filterLocationsBySearch(locations, options.query);
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
