import {
  findBayAreaProductRegion,
  isBayAreaProductRegionId,
  normalizeVisibleMapRegionId,
  type BayAreaProductRegion,
} from "@/lib/map/config";

export const MAP_LOCATION_QUERY_PARAM = "location";
export const MAP_LOCATION_ALIAS_QUERY_PARAM = "selected";
export const MAP_REGION_QUERY_PARAM = "region";

type SearchParamRecord = Record<string, string | string[] | undefined>;

export type MapQueryState = {
  requestedLocationId: string | null;
  activeRegionId: BayAreaProductRegion["id"] | null;
  unknownLocationId: string | null;
  unknownRegionId: string | null;
};

function readRecordParamValue(
  params: SearchParamRecord,
  key: string,
): string | null {
  const raw = params[key];
  if (Array.isArray(raw)) {
    const value = raw[0];
    return value && value.trim().length > 0 ? value.trim() : null;
  }

  return raw && raw.trim().length > 0 ? raw.trim() : null;
}

/**
 * Deep-link / legacy query aliases remapped to canonical catalog ids.
 * These must never appear as catalog entries. `ocean-beach-sf` → `ocean-beach`.
 * Bare `richmond` is intentionally NOT remapped (ambiguous: richmond-district vs richmond-ca).
 */
const LOCATION_ID_COMPAT_ALIASES: Record<string, string> = {
  "ocean-beach-sf": "ocean-beach",
};

export function normalizeLocationId(
  value: string | null | undefined,
): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return null;
  }

  const lowered = trimmed.toLowerCase();
  return LOCATION_ID_COMPAT_ALIASES[lowered] ?? trimmed;
}

export function readMapLocationParam(
  params: URLSearchParams | Readonly<URLSearchParams> | SearchParamRecord,
): string | null {
  if (typeof (params as URLSearchParams).get === "function") {
    const searchParams = params as URLSearchParams;
    return (
      normalizeLocationId(searchParams.get(MAP_LOCATION_QUERY_PARAM)) ??
      normalizeLocationId(searchParams.get(MAP_LOCATION_ALIAS_QUERY_PARAM))
    );
  }

  const record = params as SearchParamRecord;
  return (
    normalizeLocationId(readRecordParamValue(record, MAP_LOCATION_QUERY_PARAM)) ??
    normalizeLocationId(
      readRecordParamValue(record, MAP_LOCATION_ALIAS_QUERY_PARAM),
    )
  );
}

export function readMapRegionParam(
  params: URLSearchParams | Readonly<URLSearchParams> | SearchParamRecord,
): string | null {
  if (typeof (params as URLSearchParams).get === "function") {
    const searchParams = params as URLSearchParams;
    return normalizeLocationId(searchParams.get(MAP_REGION_QUERY_PARAM));
  }

  const record = params as SearchParamRecord;
  return normalizeLocationId(readRecordParamValue(record, MAP_REGION_QUERY_PARAM));
}

export function resolveMapQueryState(
  params: URLSearchParams | Readonly<URLSearchParams> | SearchParamRecord,
): MapQueryState {
  const requestedLocationId = readMapLocationParam(params);

  if (requestedLocationId) {
    return {
      requestedLocationId,
      activeRegionId: null,
      unknownLocationId: null,
      unknownRegionId: null,
    };
  }

  const requestedRegionId = readMapRegionParam(params);
  if (!requestedRegionId) {
    return {
      requestedLocationId: null,
      activeRegionId: null,
      unknownLocationId: null,
      unknownRegionId: null,
    };
  }

  const activeRegionId = normalizeVisibleMapRegionId(requestedRegionId);
  if (activeRegionId && isBayAreaProductRegionId(activeRegionId)) {
    return {
      requestedLocationId: null,
      activeRegionId,
      unknownLocationId: null,
      unknownRegionId: null,
    };
  }

  return {
    requestedLocationId: null,
    activeRegionId: null,
    unknownLocationId: null,
    unknownRegionId: requestedRegionId,
  };
}

export function buildMapHref(locationId?: string | null): string {
  const normalized = normalizeLocationId(locationId ?? null);

  if (!normalized) {
    return "/map";
  }

  return `/map?${MAP_LOCATION_QUERY_PARAM}=${encodeURIComponent(normalized)}`;
}

export function buildMapRegionHref(
  regionId: BayAreaProductRegion["id"] | null | undefined,
): string {
  if (!regionId || !findBayAreaProductRegion(regionId)) {
    return "/map";
  }

  return `/map?${MAP_REGION_QUERY_PARAM}=${encodeURIComponent(regionId)}`;
}
