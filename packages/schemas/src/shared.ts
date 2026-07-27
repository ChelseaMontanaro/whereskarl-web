import { z } from "zod";

export const apiSourceSchema = z.enum(["live", "mock"]);

/** Accepts legacy `Z`, offset (`+00:00`), and local backend datetime strings. */
export const apiDateTimeSchema = z.string().refine(
  (value) => !Number.isNaN(Date.parse(value)),
  { message: "Invalid API datetime" },
);

export const dataStatusSourceSchema = z.enum(["live", "degraded"]);

export const dataStatusSchema = z.object({
  source: dataStatusSourceSchema,
  isDegraded: z.boolean(),
  lastLiveObservationAt: z.string().nullable(),
  freshnessMinutes: z.number().nullable(),
});

export const confidenceComponentsSchema = z.object({
  freshness: z.number(),
  observationQuality: z.number(),
  fieldCompleteness: z.number(),
  sourceReliability: z.number(),
});

export const confidenceFieldsSchema = z.object({
  confidenceScore: z.number(),
  confidenceLabel: z.string(),
  confidenceExplanation: z.string(),
  confidenceComponents: confidenceComponentsSchema,
});

export const weatherPredictionSchema = z.object({
  trend: z.string().optional(),
  projectedFogScore1h: z.number().optional(),
  burnOffEstimateLocal: z.string().nullable().optional(),
  predictionReason: z.string().optional(),
  predictionConfidenceScore: z.number().optional(),
  predictionConfidenceLabel: z.string().optional(),
  predictionDrivers: z.array(z.string()).optional(),
});

export type ApiSource = z.infer<typeof apiSourceSchema>;
export type DataStatus = z.infer<typeof dataStatusSchema>;
export type DataStatusSource = z.infer<typeof dataStatusSourceSchema>;
export type ConfidenceComponents = z.infer<typeof confidenceComponentsSchema>;
export type ConfidenceFields = z.infer<typeof confidenceFieldsSchema>;
export type WeatherPrediction = z.infer<typeof weatherPredictionSchema>;
