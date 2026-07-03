export const MAP_LOCATION_QUERY_PARAM = "location";
export const MAP_LOCATION_ALIAS_QUERY_PARAM = "selected";

type SearchParamRecord = Record<string, string | string[] | undefined>;

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

export function normalizeLocationId(
  value: string | null | undefined,
): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
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

export function buildMapHref(locationId?: string | null): string {
  const normalized = normalizeLocationId(locationId ?? null);

  if (!normalized) {
    return "/map";
  }

  return `/map?${MAP_LOCATION_QUERY_PARAM}=${encodeURIComponent(normalized)}`;
}
