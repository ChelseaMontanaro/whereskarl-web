import type { LocationWeather } from '@/types/weather';

function trimmedNonEmpty(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export type BestRightNowMapItem = {
  locationId: string;
  locationName: string;
  score: number;
  scoreLabel: string;
};

export function getBayAreaStatusSummary(
  locations: LocationWeather[],
  isLoading = false,
): string {
  if (isLoading && locations.length === 0) {
    return 'Checking live conditions across the Bay…';
  }

  if (locations.length === 0) {
    return 'Live Bay Area conditions are unavailable right now.';
  }

  const foggiest = [...locations].sort(
    (left, right) => right.fogScore - left.fogScore,
  )[0];
  const reason =
    trimmedNonEmpty(foggiest.karlReason) ?? trimmedNonEmpty(foggiest.status);

  if (reason) {
    return reason;
  }

  return 'Explore live fog and clear skies around the Bay.';
}

export function getLatestUpdatedAt(
  locations: LocationWeather[],
): string | null {
  let latest: string | null = null;

  for (const location of locations) {
    const updatedAt = trimmedNonEmpty(location.updatedAt);
    if (!updatedAt) {
      continue;
    }

    if (!latest || Date.parse(updatedAt) > Date.parse(latest)) {
      latest = updatedAt;
    }
  }

  return latest;
}

export function formatRelativeUpdatedAt(updatedAt: string | null): string {
  if (!updatedAt) {
    return 'Updated recently';
  }

  const timestamp = Date.parse(updatedAt);
  if (Number.isNaN(timestamp)) {
    return 'Updated recently';
  }

  const elapsedMs = Date.now() - timestamp;
  const elapsedMinutes = Math.max(0, Math.floor(elapsedMs / 60_000));

  if (elapsedMinutes < 1) {
    return 'Last updated just now';
  }

  if (elapsedMinutes < 60) {
    return `Last updated ${elapsedMinutes} min ago`;
  }

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) {
    return `Last updated ${elapsedHours} hr ago`;
  }

  return 'Last updated recently';
}

export function getBestRightNowMapItems(
  locations: LocationWeather[],
  limit = 4,
  excludeLocationId: string | null = null,
): BestRightNowMapItem[] {
  const excludedId = excludeLocationId?.trim().toLowerCase() ?? null;

  return [...locations]
    .filter(
      (location) =>
        !excludedId || location.id.trim().toLowerCase() !== excludedId,
    )
    .sort((left, right) => right.sunshineScore - left.sunshineScore)
    .slice(0, limit)
    .map((location, index) => ({
      locationId: location.id,
      locationName: location.name,
      score: Math.round(location.sunshineScore),
      scoreLabel: index === 0 ? 'Clearest' : `${Math.round(location.sunshineScore)} clear`,
    }));
}

export function getSelectedLocationSubtitle(
  location: Pick<LocationWeather, 'karlReason' | 'status'>,
): string {
  return (
    trimmedNonEmpty(location.karlReason) ??
    trimmedNonEmpty(location.status) ??
    'Conditions unavailable'
  );
}
