import type { KarlIntelligenceResponse } from "@/lib/schemas/intelligence";
import type {
  BestSunshineResponse,
  CurrentResponse,
  LocationWeather,
} from "@/lib/schemas/weather";
import type { WeatherPrediction } from "@/lib/schemas/shared";

export type BestRightNowItem = {
  locationId: string;
  locationName: string;
  detail: string;
  score: number | null;
  rank: number | null;
};

function normalizeLocationId(locationId: string | null | undefined): string | null {
  const normalized = locationId?.trim().toLowerCase() ?? "";
  return normalized.length > 0 ? normalized : null;
}

export function bestRightNowLocationItems(
  locations: LocationWeather[] | undefined,
  excludeLocationId: string | null | undefined,
  limit = 4,
): BestRightNowItem[] {
  if (!locations?.length) {
    return [];
  }

  const excludedId = normalizeLocationId(excludeLocationId);

  return [...locations]
    .filter((location) => normalizeLocationId(location.id) !== excludedId)
    .sort((left, right) => right.sunshineScore - left.sunshineScore)
    .slice(0, limit)
    .map((location, index) => ({
      locationId: location.id,
      locationName: location.name,
      detail:
        trimmedNonEmpty(location.karlReason) ??
        trimmedNonEmpty(location.status) ??
        "Current conditions available",
      score: location.sunshineScore,
      rank: index + 1,
    }));
}

export function foggiestKarlLocation(
  locations: LocationWeather[],
): LocationWeather | null {
  if (locations.length === 0) {
    return null;
  }

  return [...locations].sort((left, right) => {
    if (left.sunshineScore === right.sunshineScore) {
      return right.cloudCover - left.cloudCover;
    }

    return left.sunshineScore - right.sunshineScore;
  })[0];
}

export function displayLocationName(locationId: string): string {
  return locationId
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatUpdatedAt(updatedAt: string): string {
  const date = new Date(updatedAt);

  if (Number.isNaN(date.getTime())) {
    return "Updated recently";
  }

  return date.toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

const MOVEMENT_PHRASES = [
  "advancing into",
  "retreating toward",
  "drifting through",
  "spilling into",
  "hugging",
  "lingering over",
  "rolling into",
  "gathering near",
  "settling over",
  "sliding through",
] as const;

export function movementPhrase(locationId: string): string {
  const normalizedKey = locationId.trim();
  let hash = 0;

  for (let index = 0; index < normalizedKey.length; index += 1) {
    hash = (hash * 31 + normalizedKey.charCodeAt(index)) | 0;
  }

  return MOVEMENT_PHRASES[Math.abs(hash) % MOVEMENT_PHRASES.length];
}

export function heroHeadline(input: {
  current: CurrentResponse | null;
  karlLocation: LocationWeather | null;
  intelligenceFocusLocationId?: string | null;
  hasLoadedWeather: boolean;
}): string {
  if (!input.hasLoadedWeather || !input.current) {
    return "Reading Karl intelligence";
  }

  if (input.current.fogCoverage < 28) {
    return "Karl is hanging offshore.";
  }

  if (input.intelligenceFocusLocationId) {
    const name = displayLocationName(input.intelligenceFocusLocationId);
    return `Karl is ${movementPhrase(input.intelligenceFocusLocationId)} ${name}.`;
  }

  if (input.karlLocation) {
    const locationKey =
      input.karlLocation.id.trim().length > 0
        ? input.karlLocation.id
        : input.karlLocation.name;
    return `Karl is ${movementPhrase(locationKey)} ${input.karlLocation.name}.`;
  }

  return input.current.summary;
}

export function heroSubheadline(input: {
  current: CurrentResponse | null;
  karlLocation: LocationWeather | null;
  hasLoadedWeather: boolean;
}): string {
  const preferredReason = trimmedNonEmpty(input.karlLocation?.karlReason);
  if (preferredReason) {
    return preferredReason;
  }

  if (!input.hasLoadedWeather || !input.current) {
    return "Checking conditions";
  }

  const { current, karlLocation } = input;

  if (current.windSpeed >= 6) {
    return `Marine layer nearby with ${Math.round(current.windSpeed)} mph coastal wind.`;
  }

  if (karlLocation && karlLocation.cloudCover >= 70) {
    return "Fog is strongest near the shoreline right now.";
  }

  if (current.fogCoverage < 30) {
    return "Karl is lighter across most of the Bay.";
  }

  if (current.sunshineScore >= 55) {
    return "Clearing skies are developing inland.";
  }

  return current.status;
}

export function heroConfidenceText(input: {
  intelligence: KarlIntelligenceResponse | null;
  karlLocation: LocationWeather | null;
  current: CurrentResponse | null;
}): string | null {
  const narrativeLabel = trimmedNonEmpty(
    input.intelligence?.narrative.confidenceLabel,
  );
  if (narrativeLabel && narrativeLabel.toLowerCase() !== "unavailable") {
    return `${narrativeLabel} confidence`;
  }

  const label =
    trimmedNonEmpty(input.karlLocation?.confidenceLabel) ??
    trimmedNonEmpty(input.current?.confidenceLabel);
  const explanation =
    trimmedNonEmpty(input.karlLocation?.confidenceExplanation) ??
    trimmedNonEmpty(input.current?.confidenceExplanation);

  if (label && explanation) {
    return `${label} · ${explanation}`;
  }

  if (label && label.toLowerCase() !== "unavailable") {
    return label;
  }

  return null;
}

function trimmedNonEmpty(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function displayPredictionTrend(trend: string | null | undefined): string | null {
  const normalized = trimmedNonEmpty(trend)?.toLowerCase().replaceAll("_", " ");

  switch (normalized) {
    case "clearing":
    case "clearing up":
    case "improving":
      return "Clearing up";
    case "thickening":
    case "building":
    case "worsening":
      return "Fog building";
    case "holding steady":
    case "steady":
    case "holding":
    case "unchanged":
      return "Holding steady";
    case "retreating":
    case "retreat":
    case "lifting":
      return "Fog lifting";
    case "advancing":
    case "advance":
    case "spreading":
      return "Fog spreading";
    default:
      return normalized
        ? normalized.charAt(0).toUpperCase() + normalized.slice(1)
        : null;
  }
}

export function isPredictionUnavailable(
  prediction: WeatherPrediction | null | undefined,
): boolean {
  const label = trimmedNonEmpty(prediction?.predictionConfidenceLabel);
  return label?.toLowerCase() === "unavailable";
}

export function nextHourOutlookSummary(
  prediction: WeatherPrediction | null | undefined,
): string | null {
  if (!prediction || isPredictionUnavailable(prediction)) {
    return null;
  }

  const parts: string[] = [];
  const trend = displayPredictionTrend(prediction.trend);

  if (trend) {
    parts.push(trend);
  }

  const reason = trimmedNonEmpty(prediction.predictionReason);
  if (reason) {
    parts.push(reason);
  } else {
    const burnOff = trimmedNonEmpty(prediction.burnOffEstimateLocal);
    if (burnOff) {
      parts.push(`Burn-off around ${burnOff}`);
    }
  }

  return parts.length > 0 ? parts.join(" · ") : null;
}

export function bestRightNowItems(
  intelligence: KarlIntelligenceResponse | null | undefined,
  fallbackRecommendation: BestSunshineResponse | null | undefined,
): BestRightNowItem[] {
  if (intelligence) {
    const ranked = intelligence.multiRegionRanking.bestRightNow.slice(0, 3).map(
      (item) => ({
        locationId: item.locationId,
        locationName: item.locationName,
        detail: item.explanation,
        score: item.score,
        rank: item.rank,
      }),
    );

    if (ranked.length > 0) {
      return ranked;
    }

    const destinations = intelligence.bestDestinations.destinations
      .slice()
      .sort((left, right) => {
        if (left.rank != null && right.rank != null && left.rank !== right.rank) {
          return left.rank - right.rank;
        }

        return right.score - left.score;
      })
      .slice(0, 3)
      .map((item) => ({
        locationId: item.locationId,
        locationName: item.locationName,
        detail: item.explanation,
        score: item.score,
        rank: item.rank,
      }));

    if (destinations.length > 0) {
      return destinations;
    }
  }

  if (fallbackRecommendation) {
    return [
      {
        locationId: fallbackRecommendation.locationID,
        locationName: fallbackRecommendation.locationName,
        detail:
          trimmedNonEmpty(fallbackRecommendation.recommendationReason) ??
          fallbackRecommendation.reason,
        score: fallbackRecommendation.sunshineScore,
        rank: 1,
      },
    ];
  }

  return [];
}

export function sunshineResultTitle(
  sunshineScore: number,
  isNighttime: boolean,
): string {
  if (sunshineScore >= 50) {
    return isNighttime ? "CLEAREST NIGHT" : "BEST SUNSHINE";
  }

  if (sunshineScore >= 25) {
    return "BEST BREAK IN THE FOG";
  }

  return "NO SUNSHINE NEARBY";
}

export function isNighttime(hour: number): boolean {
  return hour >= 19 || hour < 6;
}
