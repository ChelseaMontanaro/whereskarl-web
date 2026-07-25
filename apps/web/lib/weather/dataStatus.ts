import type { DataStatus } from "@/lib/schemas/shared";

export function isLocationDataDegraded(
  dataStatus?: DataStatus | null,
): boolean {
  return dataStatus?.isDegraded === true;
}

export const DEGRADED_LOCATION_STATUS_LABEL =
  "Live data temporarily unavailable";

export const DEGRADED_BEST_RIGHT_NOW_LABEL = "Fallback data";

export function degradedMarkerAriaSuffix(
  dataStatus?: DataStatus | null,
): string | null {
  return isLocationDataDegraded(dataStatus)
    ? "using fallback conditions"
    : null;
}
