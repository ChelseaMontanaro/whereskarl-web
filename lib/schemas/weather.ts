import { z } from "zod";

import { BAY_AREA_BACKEND_REGION_IDS } from "@/lib/map/config";
import {
  apiDateTimeSchema,
  apiSourceSchema,
  confidenceFieldsSchema,
  dataStatusSchema,
  weatherPredictionSchema,
} from "@/lib/schemas/shared";

export const backendRegionIdSchema = z.enum(BAY_AREA_BACKEND_REGION_IDS);

export const airQualityCategorySchema = z.enum([
  "good",
  "moderate",
  "unhealthy-sensitive",
  "unhealthy",
  "very-unhealthy",
  "hazardous",
]);

export const airQualityColorTokenSchema = z.enum([
  "aqi.good",
  "aqi.moderate",
  "aqi.unhealthy-sensitive",
  "aqi.unhealthy",
  "aqi.very-unhealthy",
  "aqi.hazardous",
  "aqi.unavailable",
]);

export const airQualitySchema = z.object({
  aqi: z.number().nullable(),
  category: airQualityCategorySchema.nullable(),
  // Backend-owned semantic presentation token. Platforms map this to local
  // design colors once; they must not invent alternate AQI band keys.
  colorToken: airQualityColorTokenSchema.optional(),
  label: z.string(),
  description: z.string().nullable().optional(),
  pollutant: z.string().nullable().optional(),
  observedAt: apiDateTimeSchema.nullable().optional(),
  source: z.string().nullable().optional(),
  isAvailable: z.boolean(),
});

export const locationWeatherSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    region: backendRegionIdSchema.optional(),
    latitude: z.number(),
    longitude: z.number(),
    distanceText: z.string(),
    status: z.string(),
    temperature: z.number(),
    sunshineScore: z.number(),
    cloudCover: z.number(),
    visibility: z.number(),
    humidity: z.number(),
    windSpeed: z.number(),
    windDirection: z.string(),
    weatherCode: z.number(),
    iconName: z.string(),
    fogScore: z.number(),
    // Canonical AQI object from the backend pipeline. Optional for backward
    // compatibility with older payloads; when absent, UI treats as unavailable.
    airQuality: airQualitySchema.optional(),
    updatedAt: apiDateTimeSchema,
    karlReason: z.string(),
    primaryDrivers: z.array(z.string()),
    microclimateFactors: z.array(z.string()),
    prediction: weatherPredictionSchema,
    dataStatus: dataStatusSchema.optional(),
  })
  .merge(confidenceFieldsSchema);

export const locationsResponseSchema = z.object({
  locations: z.array(locationWeatherSchema),
});

export type LocationWeather = z.infer<typeof locationWeatherSchema>;
export type LocationsResponse = z.infer<typeof locationsResponseSchema>;
export type AirQuality = z.infer<typeof airQualitySchema>;
export type AirQualityCategory = z.infer<typeof airQualityCategorySchema>;

export const currentResponseSchema = z
  .object({
    id: z.literal("bay-area-current"),
    summary: z.string(),
    status: z.string(),
    temperature: z.number(),
    fogCoverage: z.number(),
    sunshineScore: z.number(),
    windSpeed: z.number(),
    windDirection: z.string(),
    cloudCover: z.number(),
    visibility: z.number(),
    humidity: z.number(),
    weatherCode: z.number(),
    iconName: z.string(),
    updatedAt: apiDateTimeSchema,
    source: apiSourceSchema,
    airQuality: airQualitySchema.optional(),
    dataStatus: dataStatusSchema.optional(),
  })
  .merge(confidenceFieldsSchema);

export type CurrentResponse = z.infer<typeof currentResponseSchema>;

export const recommendationModeSchema = z.enum(["current", "lookahead"]);

export const bestSunshineResponseSchema = z
  .object({
    id: z.string(),
    locationID: z.string(),
    locationName: z.string(),
    latitude: z.number(),
    longitude: z.number(),
    status: z.string(),
    temperature: z.number(),
    sunshineScore: z.number(),
    fogScore: z.number(),
    distanceText: z.string(),
    reason: z.string(),
    iconName: z.string(),
    updatedAt: apiDateTimeSchema,
    source: apiSourceSchema,
    airQuality: airQualitySchema.optional(),
    dataStatus: dataStatusSchema.optional(),
    recommendationMode: recommendationModeSchema,
    lookaheadMinutes: z.number(),
    recommendationScore: z.number(),
    projectedSunshineScore1h: z.number().nullable(),
    recommendationReason: z.string(),
  })
  .merge(confidenceFieldsSchema);

export type BestSunshineResponse = z.infer<typeof bestSunshineResponseSchema>;

export type GetBestSunshineOptions = {
  lookahead?: 60;
};
