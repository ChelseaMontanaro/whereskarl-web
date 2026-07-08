/**
 * Weather API types — mirrors whereskarl-web/lib/schemas/weather.ts.
 */

import type {
  ApiSource,
  ConfidenceFields,
  DataStatus,
  WeatherPrediction,
} from '@/types/shared';

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
