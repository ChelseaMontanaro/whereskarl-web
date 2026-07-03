import { z } from "zod";

export const apiSourceSchema = z.enum(["live", "mock"]);

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
export type ConfidenceComponents = z.infer<typeof confidenceComponentsSchema>;
export type ConfidenceFields = z.infer<typeof confidenceFieldsSchema>;
export type WeatherPrediction = z.infer<typeof weatherPredictionSchema>;
