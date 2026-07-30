import {
  MAP_LOCATION_ALIAS_QUERY_PARAM,
  MAP_LOCATION_QUERY_PARAM,
  MAP_REGION_QUERY_PARAM,
} from "@whereskarl/config";
import { normalizeLocationId } from "@whereskarl/search";

import {
  findBayAreaProductRegion,
  isBayAreaProductRegionId,
  normalizeVisibleMapRegionId,
  type BayAreaProductRegion,
} from "@/lib/map/config";

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
