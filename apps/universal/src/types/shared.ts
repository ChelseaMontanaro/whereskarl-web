/**
 * Shared API field types — mirrors whereskarl-web/lib/schemas/shared.ts.
 */

export type ApiSource = 'live' | 'mock';

export type DataStatusSource = 'live' | 'degraded';

export type DataStatus = {
  source: DataStatusSource;
  isDegraded: boolean;
  lastLiveObservationAt: string | null;
  freshnessMinutes: number | null;
};

export type ConfidenceComponents = {
  freshness: number;
  observationQuality: number;
  fieldCompleteness: number;
  sourceReliability: number;
};

export type ConfidenceFields = {
  confidenceScore: number;
  confidenceLabel: string;
  confidenceExplanation: string;
  confidenceComponents: ConfidenceComponents;
};

export type WeatherPrediction = {
  trend?: string;
  projectedFogScore1h?: number;
  burnOffEstimateLocal?: string | null;
  predictionReason?: string;
  predictionConfidenceScore?: number;
  predictionConfidenceLabel?: string;
  predictionDrivers?: string[];
};
