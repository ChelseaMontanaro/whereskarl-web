/**
 * Map list/search presentation — aligned with whereskarl-web/lib/map/conditions.ts.
 */

import type { LocationWeather } from '@/types/weather';

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

function resolveFogScore(location: LocationConditionInput): number | null {
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
