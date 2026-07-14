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

export const ultravioletIndexCategorySchema = z.enum([
  "low",
  "moderate",
  "high",
  "very-high",
  "extreme",
]);

export const ultravioletIndexColorTokenSchema = z.enum([
  "uv.low",
  "uv.moderate",
  "uv.high",
  "uv.very-high",
  "uv.extreme",
  "uv.unavailable",
]);

export const ultravioletIndexSchema = z.object({
  value: z.number().nullable(),
  category: ultravioletIndexCategorySchema.nullable(),
  // Backend-owned semantic presentation token. Platforms map this to local
  // design colors once; they must not invent alternate UV Index band keys.
  colorToken: ultravioletIndexColorTokenSchema.optional(),
  label: z.string(),
  description: z.string().nullable().optional(),
  observedAt: apiDateTimeSchema.nullable().optional(),
  source: z.string().nullable().optional(),
  isAvailable: z.boolean(),
});

/** Calendar day for Google daily pollen forecasts (YYYY-MM-DD). */
export const pollenForecastDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid pollen forecast date");

export const pollenCategorySchema = z.enum([
  "none",
  "very-low",
  "low",
  "moderate",
  "high",
  "very-high",
]);

export const pollenColorTokenSchema = z.enum([
  "pollen.none",
  "pollen.very-low",
  "pollen.low",
  "pollen.moderate",
  "pollen.high",
  "pollen.very-high",
  "pollen.unavailable",
]);

export const pollenDominantTypeSchema = z.enum(["tree", "grass", "weed"]);

export const pollenTypeMetricSchema = z.object({
  value: z.number().nullable(),
  category: pollenCategorySchema.nullable(),
  colorToken: pollenColorTokenSchema.optional(),
  label: z.string(),
  description: z.string().nullable().optional(),
  inSeason: z.boolean().nullable().optional(),
});

export const pollenSchema = z.object({
  value: z.number().nullable(),
  category: pollenCategorySchema.nullable(),
  // Backend-owned semantic presentation token. Platforms map this to local
  // design colors once; they must not invent alternate UPI band keys.
  colorToken: pollenColorTokenSchema.optional(),
  label: z.string(),
  description: z.string().nullable().optional(),
  dominantType: pollenDominantTypeSchema.nullable().optional(),
  types: z
    .object({
      tree: pollenTypeMetricSchema.nullable(),
      grass: pollenTypeMetricSchema.nullable(),
      weed: pollenTypeMetricSchema.nullable(),
    })
    .optional(),
  // Daily forecast calendar day — not an observation timestamp.
  forecastDate: pollenForecastDateSchema.nullable().optional(),
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
    // Canonical UV Index from the shared environmental pipeline. Optional for
    // backward compatibility; when absent, consumers treat as unavailable.
    // Selected Location is the first UI consumer — the field is intentionally
    // surface-agnostic for Map / Home / Favorites / Notifications / etc.
    uvIndex: ultravioletIndexSchema.optional(),
    // Canonical pollen from Google UPI via the shared environmental pipeline.
    // Phone Selected Location is the first UI consumer; desktop defers pollen
    // (same product decision as UV). Payload remains surface-agnostic.
    pollen: pollenSchema.optional(),
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
export type UltravioletIndex = z.infer<typeof ultravioletIndexSchema>;
export type UltravioletIndexCategory = z.infer<
  typeof ultravioletIndexCategorySchema
>;
export type Pollen = z.infer<typeof pollenSchema>;
export type PollenCategory = z.infer<typeof pollenCategorySchema>;
export type PollenDominantType = z.infer<typeof pollenDominantTypeSchema>;

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
    uvIndex: ultravioletIndexSchema.optional(),
    pollen: pollenSchema.optional(),
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
    uvIndex: ultravioletIndexSchema.optional(),
    pollen: pollenSchema.optional(),
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
