/**
 * Selected-location presentation helpers.
 */

import {
  formatConfidenceLabel,
  getCloudSummary,
  getLocationConditionLabel,
} from '@/lib/map/locationsDisplay';
import {
  formatAirQualityCompact,
  presentAirQuality,
} from '@/lib/weather/airQuality';
import {
  formatPollenCompact,
  presentPollen,
} from '@/lib/weather/pollen';
import {
  formatUvIndexCompact,
  presentUvIndex,
} from '@/lib/weather/uvIndex';
import type { WeatherPrediction } from '@/types/shared';
import type { LocationWeather } from '@/types/weather';

function trimmedNonEmpty(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function formatConfidenceExplanation(
  explanation: string | null | undefined,
): string | null {
  const trimmed = trimmedNonEmpty(explanation);
  if (!trimmed || trimmed.toLowerCase() === 'unavailable') {
    return null;
  }

  return trimmed;
}

export function getLocationConfidenceCopy(location: LocationWeather): {
  label: string | null;
  explanation: string | null;
} {
  return {
    label: formatConfidenceLabel(location.confidenceLabel),
    explanation: formatConfidenceExplanation(location.confidenceExplanation),
  };
}

export function getKarlReadHeadline(
  location: Pick<LocationWeather, 'karlReason' | 'status'>,
): string {
  return (
    trimmedNonEmpty(location.karlReason) ??
    trimmedNonEmpty(location.status) ??
    'Karl intelligence is still forming for this spot.'
  );
}

export function getKarlReadDrivers(
  location: Pick<
    LocationWeather,
    'primaryDrivers' | 'microclimateFactors'
  >,
): string[] {
  const drivers = [
    ...(location.primaryDrivers ?? []),
    ...(location.microclimateFactors ?? []),
  ]
    .map((item) => item.trim())
    .filter(Boolean);

  return [...new Set(drivers)];
}

export function isPredictionUnavailable(
  prediction: WeatherPrediction | null | undefined,
): boolean {
  const label = trimmedNonEmpty(prediction?.predictionConfidenceLabel);
  return label?.toLowerCase() === 'unavailable';
}

function displayPredictionTrend(trend: string | null | undefined): string | null {
  const normalized = trimmedNonEmpty(trend)?.toLowerCase().replaceAll('_', ' ');

  switch (normalized) {
    case 'clearing':
    case 'clearing up':
    case 'improving':
      return 'Clearing up';
    case 'thickening':
    case 'building':
    case 'worsening':
      return 'Fog building';
    case 'holding steady':
    case 'steady':
    case 'holding':
    case 'unchanged':
      return 'Holding steady';
    case 'retreating':
    case 'retreat':
    case 'lifting':
      return 'Fog lifting';
    case 'advancing':
    case 'advance':
    case 'spreading':
      return 'Fog spreading';
    default:
      return normalized
        ? normalized.charAt(0).toUpperCase() + normalized.slice(1)
        : null;
  }
}

function formatLocalTimeCopy(value: string): string {
  const trimmed = value.trim();

  if (/^\d{1,2}:\d{2}/.test(trimmed)) {
    const [hourText, minuteText = '00'] = trimmed.split(':');
    const hour = Number.parseInt(hourText, 10);
    const minute = Number.parseInt(minuteText, 10);

    if (Number.isFinite(hour) && Number.isFinite(minute)) {
      const date = new Date();
      date.setHours(hour, minute, 0, 0);
      return date.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
      });
    }
  }

  return trimmed;
}

export type LocationMetric = {
  label: string;
  value: string;
};

export function getLocationMetrics(location: LocationWeather): LocationMetric[] {
  const airQuality = presentAirQuality(location.airQuality);
  const uvIndex = presentUvIndex(location.uvIndex);
  const pollen = presentPollen(location.pollen);

  const metrics: LocationMetric[] = [
    {
      label: 'Temperature',
      value: `${Math.round(location.temperature)}°`,
    },
    {
      label: 'Clear skies',
      value: `${Math.round(location.sunshineScore)}%`,
    },
    {
      label: 'AQI',
      value: formatAirQualityCompact(airQuality),
    },
    {
      label: 'UV',
      value: formatUvIndexCompact(uvIndex),
    },
    {
      label: 'Pollen',
      value: formatPollenCompact(pollen),
    },
    {
      label: 'Cloud cover',
      value: `${Math.round(location.cloudCover)}%`,
    },
    {
      label: 'Fog score',
      value: `${Math.round(location.fogScore)}%`,
    },
  ];

  if (airQuality.available && airQuality.description) {
    metrics.push({
      label: 'Air quality',
      value: airQuality.description,
    });
  }

  if (uvIndex.available && uvIndex.description) {
    metrics.push({
      label: 'Ultraviolet',
      value: uvIndex.description,
    });
  }

  if (pollen.available && pollen.description) {
    metrics.push({
      label: 'Pollen detail',
      value: pollen.description,
    });
  }

  if (Number.isFinite(location.visibility)) {
    metrics.push({
      label: 'Visibility',
      value: `${location.visibility.toFixed(1)} mi`,
    });
  }

  if (Number.isFinite(location.humidity)) {
    metrics.push({
      label: 'Humidity',
      value: `${Math.round(location.humidity)}%`,
    });
  }

  if (Number.isFinite(location.windSpeed)) {
    const direction = trimmedNonEmpty(location.windDirection);
    metrics.push({
      label: 'Wind',
      value: direction
        ? `${direction} ${Math.round(location.windSpeed)} mph`
        : `${Math.round(location.windSpeed)} mph`,
    });
  }

  return metrics;
}

export type LocationForecastPreviewItem = {
  title: string;
  detail: string;
};

export function getLocationForecastPreviewItems(
  location: LocationWeather,
): LocationForecastPreviewItem[] {
  const prediction = location.prediction;

  if (!prediction || isPredictionUnavailable(prediction)) {
    return [];
  }

  const items: LocationForecastPreviewItem[] = [];
  const trend = displayPredictionTrend(prediction.trend);

  if (trend) {
    items.push({
      title: 'Trend',
      detail: trend,
    });
  }

  const reason = trimmedNonEmpty(prediction.predictionReason);
  if (reason) {
    items.push({
      title: 'Outlook',
      detail: reason,
    });
  }

  const burnOff = trimmedNonEmpty(prediction.burnOffEstimateLocal);
  if (burnOff) {
    items.push({
      title: 'Burn-off',
      detail: `Around ${formatLocalTimeCopy(burnOff)}`,
    });
  }

  if (
    typeof prediction.projectedFogScore1h === 'number' &&
    Number.isFinite(prediction.projectedFogScore1h)
  ) {
    items.push({
      title: 'Projected fog',
      detail: `${Math.round(prediction.projectedFogScore1h)}% in 1 hour`,
    });
  }

  const predictionLabel = trimmedNonEmpty(prediction.predictionConfidenceLabel);
  if (predictionLabel && predictionLabel.toLowerCase() !== 'unavailable') {
    items.push({
      title: 'Forecast confidence',
      detail: predictionLabel,
    });
  }

  const drivers = (prediction.predictionDrivers ?? [])
    .map((item) => item.trim())
    .filter(Boolean);

  if (drivers.length > 0) {
    items.push({
      title: 'Drivers',
      detail: drivers.join(' · '),
    });
  }

  return items;
}

export function getLocationHeroSummary(
  location: Pick<LocationWeather, 'status' | 'fogScore' | 'sunshineScore'>,
): string {
  return getCloudSummary(location as LocationWeather);
}

export function getLocationConditionHeadline(
  location: Pick<LocationWeather, 'status' | 'fogScore' | 'sunshineScore'>,
): string {
  return getLocationConditionLabel(location);
}
