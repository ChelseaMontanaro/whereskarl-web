/**
 * `@whereskarl/schemas` — Zod contracts and inferred types mirroring backend API responses.
 *
 * Platform-agnostic. No fetch, React, env, or presentation logic.
 */

export { parseApiResponse } from "./parse";

export {
  apiSourceSchema,
  apiDateTimeSchema,
  dataStatusSourceSchema,
  dataStatusSchema,
  confidenceComponentsSchema,
  confidenceFieldsSchema,
  weatherPredictionSchema,
  type ApiSource,
  type DataStatus,
  type DataStatusSource,
  type ConfidenceComponents,
  type ConfidenceFields,
  type WeatherPrediction,
} from "./shared";

export {
  healthResponseSchema,
  type HealthResponse,
} from "./health";

export {
  BAY_AREA_BACKEND_REGION_IDS,
  backendRegionIdSchema,
  CLIMATE_VALUES,
  climateSchema,
  locationSearchSchema,
  focalPointSchema,
  airQualityCategorySchema,
  airQualityColorTokenSchema,
  airQualitySchema,
  ultravioletIndexCategorySchema,
  ultravioletIndexColorTokenSchema,
  ultravioletIndexSchema,
  pollenForecastDateSchema,
  pollenCategorySchema,
  pollenColorTokenSchema,
  pollenDominantTypeSchema,
  pollenTypeMetricSchema,
  pollenSchema,
  locationWeatherSchema,
  locationsResponseSchema,
  currentResponseSchema,
  recommendationModeSchema,
  bestSunshineResponseSchema,
  type LocationWeather,
  type LocationsResponse,
  type Climate,
  type LocationSearch,
  type FocalPoint,
  type AirQuality,
  type AirQualityCategory,
  type UltravioletIndex,
  type UltravioletIndexCategory,
  type Pollen,
  type PollenCategory,
  type PollenDominantType,
  type CurrentResponse,
  type BestSunshineResponse,
  type GetBestSunshineOptions,
} from "./weather";

export {
  karlLocationFogSummarySchema,
  karlRegionalNarrativeSchema,
  karlClearingNarrativeSchema,
  karlNarrativeSchema,
  karlRegionTrendSchema,
  karlMovementContextSchema,
  karlRegionalTrendsSchema,
  karlMovementEvidenceSchema,
  karlMovementAssessmentSchema,
  karlClearingEvidenceSchema,
  karlLocationClearingPredictionSchema,
  karlClearingPredictionsSchema,
  karlDestinationRecommendationSchema,
  karlBestDestinationsSchema,
  karlRankedDestinationSchema,
  karlRegionRankingSummarySchema,
  karlMultiRegionRankingSchema,
  karlHeroImageryPresentationSchema,
  karlHeroImagerySchema,
  karlIntelligenceResponseSchema,
  type KarlHeroImageryMetadata,
  type KarlIntelligenceResponse,
  type GetKarlIntelligenceOptions,
} from "./intelligence";
