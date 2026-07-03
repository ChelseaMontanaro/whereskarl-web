import { z } from "zod";

import { apiSourceSchema } from "@/lib/schemas/shared";

export const karlLocationFogSummarySchema = z.object({
  locationId: z.string(),
  fogScore: z.number(),
  sunshineScore: z.number(),
});

export const karlRegionalNarrativeSchema = z.object({
  regionId: z.string(),
  regionName: z.string(),
  trendLabel: z.string(),
  narrative: z.string(),
});

export const karlClearingNarrativeSchema = z.object({
  locationId: z.string(),
  locationName: z.string(),
  clearingStatus: z.string(),
  estimatedClearingWindow: z.string().nullable(),
  narrative: z.string(),
});

export const karlNarrativeSchema = z.object({
  headline: z.string(),
  summary: z.string(),
  movementNarrative: z.string().nullable(),
  regionalNarratives: z.array(karlRegionalNarrativeSchema),
  clearingNarratives: z.array(karlClearingNarrativeSchema),
  confidence: z.number(),
  confidenceLabel: z.string(),
});

export const karlRegionTrendSchema = z.object({
  regionId: z.string(),
  regionName: z.string(),
  averageFogScore: z.number().nullable(),
  averageSunshineScore: z.number().nullable(),
  clearestLocation: karlLocationFogSummarySchema.nullable(),
  foggiestLocation: karlLocationFogSummarySchema.nullable(),
  locationCount: z.number(),
  monitoredLocationCount: z.number(),
  trendLabel: z.string(),
  confidence: z.number(),
  confidenceLabel: z.string(),
  explanation: z.string(),
});

export const karlMovementContextSchema = z.object({
  movementType: z.string(),
  confidence: z.number(),
  confidenceLabel: z.string(),
  affectedLocations: z.array(z.string()),
  explanation: z.string(),
});

export const karlRegionalTrendsSchema = z.object({
  regions: z.array(karlRegionTrendSchema),
  movementContext: karlMovementContextSchema.nullable(),
  validLocationCount: z.number(),
});

export const karlMovementEvidenceSchema = z.object({
  type: z.string().optional(),
  fromLocationId: z.string().optional(),
  toLocationId: z.string().optional(),
  fromFogScore: z.number().optional(),
  toFogScore: z.number().optional(),
  gradient: z.number().optional(),
  signal: z.string().optional(),
  pathId: z.string().optional(),
  fromRegionId: z.string().optional(),
  toRegionId: z.string().optional(),
  expectedMovementType: z.string().optional(),
  fromAverageFogScore: z.number().optional(),
  toAverageFogScore: z.number().optional(),
  locationIds: z.array(z.string()).optional(),
  fogScores: z.array(z.number()).optional(),
});

export const karlMovementAssessmentSchema = z.object({
  movementType: z.string(),
  confidence: z.number(),
  confidenceLabel: z.string(),
  evidence: z.array(karlMovementEvidenceSchema),
  affectedLocations: z.array(z.string()),
  explanation: z.string(),
});

export const karlClearingEvidenceSchema = z.object({
  type: z.string().optional(),
  fogScore: z.number().optional(),
  sunshineScore: z.number().optional(),
  signal: z.string().optional(),
  regionId: z.string().optional(),
  trendLabel: z.string().optional(),
  averageFogScore: z.number().optional(),
  movementType: z.string().optional(),
  affectedLocations: z.array(z.string()).optional(),
  historyTrend: z.string().optional(),
  fogChange: z.number().optional(),
  observationCount: z.number().optional(),
  profileExposure: z.string().optional(),
  profilePersistence: z.string().optional(),
});

export const karlLocationClearingPredictionSchema = z.object({
  locationId: z.string(),
  clearingStatus: z.string(),
  estimatedClearingWindow: z.string().nullable(),
  confidence: z.number(),
  confidenceLabel: z.string(),
  evidence: z.array(karlClearingEvidenceSchema),
  explanation: z.string(),
});

export const karlClearingPredictionsSchema = z.object({
  locations: z.array(karlLocationClearingPredictionSchema),
  validLocationCount: z.number(),
});

export const karlDestinationRecommendationSchema = z.object({
  locationId: z.string(),
  locationName: z.string(),
  regionId: z.string().nullable(),
  recommendationType: z.string().nullable(),
  score: z.number(),
  confidence: z.number(),
  confidenceLabel: z.string(),
  reasons: z.array(z.string()),
  explanation: z.string(),
  rank: z.number().nullable(),
});

export const karlBestDestinationsSchema = z.object({
  destinations: z.array(karlDestinationRecommendationSchema),
  validLocationCount: z.number(),
});

export const karlRankedDestinationSchema = z.object({
  locationId: z.string(),
  locationName: z.string(),
  regionId: z.string().nullable(),
  rank: z.number(),
  score: z.number(),
  confidence: z.number(),
  confidenceLabel: z.string(),
  reasons: z.array(z.string()),
  explanation: z.string(),
});

export const karlRegionRankingSummarySchema = z.object({
  regionId: z.string(),
  regionName: z.string(),
  trendLabel: z.string(),
  averageFogScore: z.number().nullable(),
  averageSunshineScore: z.number().nullable(),
  clearestLocation: karlLocationFogSummarySchema.nullable(),
  foggiestLocation: karlLocationFogSummarySchema.nullable(),
  locationCount: z.number(),
  monitoredLocationCount: z.number(),
  confidence: z.number(),
  confidenceLabel: z.string(),
  summary: z.string(),
});

export const karlMultiRegionRankingSchema = z.object({
  bestRightNow: z.array(karlRankedDestinationSchema),
  clearingSoon: z.array(karlRankedDestinationSchema),
  improvingFastest: z.array(karlRankedDestinationSchema),
  avoidForNow: z.array(karlRankedDestinationSchema),
  watchList: z.array(karlRankedDestinationSchema),
  regionSummaries: z.array(karlRegionRankingSummarySchema),
  movementContext: karlMovementContextSchema.nullable(),
  validLocationCount: z.number(),
});

export const karlHeroImageryPresentationSchema = z.object({
  style: z.string().nullable().optional(),
  conditionState: z.string().nullable().optional(),
  timeOfDay: z.string().nullable().optional(),
  daypart: z.string().nullable().optional(),
  colorGrade: z.string().nullable().optional(),
  baseVariant: z.string().nullable().optional(),
  sceneId: z.string().nullable().optional(),
  sceneName: z.string().nullable().optional(),
  usesRemoteAsset: z.boolean().nullable().optional(),
  localFallbackAsset: z.string().nullable().optional(),
  atmosphereTopOpacity: z.number().nullable().optional(),
  atmosphereBottomOpacity: z.number().nullable().optional(),
  bottomGradientLeadOpacity: z.number().nullable().optional(),
  bottomGradientMidOpacity: z.number().nullable().optional(),
});

export const karlHeroImagerySchema = z.object({
  conditionState: z.string(),
  stabilityKey: z.string(),
  imageUrl: z.string().nullable(),
  localFallbackAsset: z.string().nullable(),
  presentation: karlHeroImageryPresentationSchema.nullable(),
  source: z.string().nullable(),
  confidenceLabel: z.string().nullable(),
  imageKey: z.string().nullable(),
  focusLocationId: z.string().nullable(),
  sceneId: z.string().nullable().optional(),
  sceneName: z.string().nullable().optional(),
  timeOfDay: z.string().nullable().optional(),
  baseVariant: z.string().nullable().optional(),
  daypart: z.string().nullable().optional(),
  colorGrade: z.string().nullable().optional(),
  fallbackReason: z.string().nullable(),
  altText: z.string().nullable(),
});

export const karlIntelligenceResponseSchema = z.object({
  narrative: karlNarrativeSchema,
  regionalTrends: karlRegionalTrendsSchema,
  movementAssessment: karlMovementAssessmentSchema,
  clearingPredictions: karlClearingPredictionsSchema,
  bestDestinations: karlBestDestinationsSchema,
  multiRegionRanking: karlMultiRegionRankingSchema,
  heroImagery: karlHeroImagerySchema,
  generatedAt: z.string().datetime(),
  validLocationCount: z.number(),
  source: apiSourceSchema,
});

export type KarlIntelligenceResponse = z.infer<
  typeof karlIntelligenceResponseSchema
>;

export type GetKarlIntelligenceOptions = {
  locationId?: string;
};
