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
    return `Karl is lingering near ${displayLocationName(input.intelligenceFocusLocationId)}.`;
  }

  if (input.karlLocation) {
    return `Karl is ${input.karlLocation.status.toLowerCase()} near ${input.karlLocation.name}.`;
  }

  return input.current.summary;
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
