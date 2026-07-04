import { z } from "zod";

import { BAY_AREA_BACKEND_REGION_IDS } from "@/lib/map/config";
import {
  apiSourceSchema,
  confidenceFieldsSchema,
  weatherPredictionSchema,
} from "@/lib/schemas/shared";

export const backendRegionIdSchema = z.enum(BAY_AREA_BACKEND_REGION_IDS);

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
    updatedAt: z.string().datetime(),
    karlReason: z.string(),
    primaryDrivers: z.array(z.string()),
    microclimateFactors: z.array(z.string()),
    prediction: weatherPredictionSchema,
  })
  .merge(confidenceFieldsSchema);

export const locationsResponseSchema = z.object({
  locations: z.array(locationWeatherSchema),
});

export type LocationWeather = z.infer<typeof locationWeatherSchema>;
export type LocationsResponse = z.infer<typeof locationsResponseSchema>;

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
    updatedAt: z.string().datetime(),
    source: apiSourceSchema,
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
    updatedAt: z.string().datetime(),
    source: apiSourceSchema,
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
