/**
 * Weather API types — mirrors whereskarl-web/lib/schemas/weather.ts.
 */

import type {
  ApiSource,
  ConfidenceFields,
  DataStatus,
  WeatherPrediction,
} from '@/types/shared';

export type AirQualityCategory =
  | 'good'
  | 'moderate'
  | 'unhealthy-sensitive'
  | 'unhealthy'
  | 'very-unhealthy'
  | 'hazardous';

export type AirQualityColorToken =
  | 'aqi.good'
  | 'aqi.moderate'
  | 'aqi.unhealthy-sensitive'
  | 'aqi.unhealthy'
  | 'aqi.very-unhealthy'
  | 'aqi.hazardous'
  | 'aqi.unavailable';

export type AirQuality = {
  aqi: number | null;
  category: AirQualityCategory | null;
  colorToken?: AirQualityColorToken;
  label: string;
  description?: string | null;
  pollutant?: string | null;
  observedAt?: string | null;
  source?: string | null;
  isAvailable: boolean;
};

export type UltravioletIndexCategory =
  | 'low'
  | 'moderate'
  | 'high'
  | 'very-high'
  | 'extreme';

export type UltravioletIndexColorToken =
  | 'uv.low'
  | 'uv.moderate'
  | 'uv.high'
  | 'uv.very-high'
  | 'uv.extreme'
  | 'uv.unavailable';

export type UltravioletIndex = {
  value: number | null;
  category: UltravioletIndexCategory | null;
  colorToken?: UltravioletIndexColorToken;
  label: string;
  description?: string | null;
  observedAt?: string | null;
  source?: string | null;
  isAvailable: boolean;
};

export type PollenCategory =
  | 'none'
  | 'very-low'
  | 'low'
  | 'moderate'
  | 'high'
  | 'very-high';

export type PollenColorToken =
  | 'pollen.none'
  | 'pollen.very-low'
  | 'pollen.low'
  | 'pollen.moderate'
  | 'pollen.high'
  | 'pollen.very-high'
  | 'pollen.unavailable';

export type PollenDominantType = 'tree' | 'grass' | 'weed';

export type PollenTypeMetric = {
  value: number | null;
  category: PollenCategory | null;
  colorToken?: PollenColorToken;
  label: string;
  description?: string | null;
  inSeason?: boolean | null;
};

export type Pollen = {
  value: number | null;
  category: PollenCategory | null;
  colorToken?: PollenColorToken;
  label: string;
  description?: string | null;
  dominantType?: PollenDominantType | null;
  types?: {
    tree: PollenTypeMetric | null;
    grass: PollenTypeMetric | null;
    weed: PollenTypeMetric | null;
  };
  /** Daily forecast calendar day (YYYY-MM-DD) — not an observation timestamp. */
  forecastDate?: string | null;
  source?: string | null;
  isAvailable: boolean;
};

export type LocationWeather = {
  id: string;
  name: string;
  region?: string;
  latitude: number;
  longitude: number;
  distanceText: string;
  status: string;
  temperature: number;
  sunshineScore: number;
  cloudCover: number;
  visibility: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  weatherCode: number;
  iconName: string;
  fogScore: number;
  airQuality?: AirQuality;
  uvIndex?: UltravioletIndex;
  pollen?: Pollen;
  updatedAt: string;
  karlReason: string;
  primaryDrivers: string[];
  microclimateFactors: string[];
  prediction: WeatherPrediction;
  dataStatus?: DataStatus;
} & ConfidenceFields;

export type LocationsResponse = {
  locations: LocationWeather[];
};

export type CurrentResponse = {
  id: 'bay-area-current';
  summary: string;
  status: string;
  temperature: number;
  fogCoverage: number;
  sunshineScore: number;
  windSpeed: number;
  windDirection: string;
  cloudCover: number;
  visibility: number;
  humidity: number;
  weatherCode: number;
  iconName: string;
  updatedAt: string;
  source: ApiSource;
  airQuality?: AirQuality;
  uvIndex?: UltravioletIndex;
  pollen?: Pollen;
  dataStatus?: DataStatus;
} & ConfidenceFields;

export type RecommendationMode = 'current' | 'lookahead';

export type BestSunshineResponse = {
  id: string;
  locationID: string;
  locationName: string;
  latitude: number;
  longitude: number;
  status: string;
  temperature: number;
  sunshineScore: number;
  fogScore: number;
  distanceText: string;
  reason: string;
  iconName: string;
  updatedAt: string;
  source: ApiSource;
  airQuality?: AirQuality;
  uvIndex?: UltravioletIndex;
  pollen?: Pollen;
  dataStatus?: DataStatus;
  recommendationMode: RecommendationMode;
  lookaheadMinutes: number;
  recommendationScore: number;
  projectedSunshineScore1h: number | null;
  recommendationReason: string;
} & ConfidenceFields;

export type GetBestSunshineOptions = {
  lookahead?: 60;
};

export type ForecastHour = {
  hour: string;
  temperature: number;
  sunshineScore: number;
  iconName: string;
  status: string;
};
