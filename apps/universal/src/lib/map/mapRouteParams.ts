import {
  MAP_LOCATION_ALIAS_QUERY_PARAM,
  MAP_LOCATION_QUERY_PARAM,
} from '@whereskarl/config';
import { normalizeLocationId } from '@whereskarl/search';

type RouteParamValue = string | string[] | undefined;

function readRawParam(value: RouteParamValue): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw?.trim()) {
    return null;
  }

  return raw;
}

/**
 * Resolve a map deep-link location id from Expo Router search params.
 * Accepts both canonical (`location`) and Universal alias (`selected`) keys,
 * then remaps legacy ids through `@whereskarl/search`.
 */
export function parseMapSelectedLocationId(params: {
  [MAP_LOCATION_QUERY_PARAM]?: RouteParamValue;
  [MAP_LOCATION_ALIAS_QUERY_PARAM]?: RouteParamValue;
  location?: RouteParamValue;
  selected?: RouteParamValue;
}): string | null {
  return (
    normalizeLocationId(readRawParam(params[MAP_LOCATION_QUERY_PARAM])) ??
    normalizeLocationId(readRawParam(params[MAP_LOCATION_ALIAS_QUERY_PARAM]))
  );
}

export function parseMapViewMode(
  value: RouteParamValue,
): 'list' | 'map' {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === 'list' ? 'list' : 'map';
}
