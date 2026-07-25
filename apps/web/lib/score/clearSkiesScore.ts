/**
 * Canonical Clear Skies Score presentation.
 *
 * This is the single source of truth for how a Clear Skies Score is formatted
 * and colored across every surface. Consumers (map markers, the Selected
 * Location card, the Home recommendation, and future location pages) should
 * read from here instead of re-deriving thresholds or colors so the score
 * always reads the same way everywhere.
 *
 * Canonical thresholds (product spec):
 *   75–100 → green  (clear)
 *   50–74  → orange (moderate)
 *    0–49  → red    (poor)
 */

export type ClearSkiesScoreBand = "clear" | "moderate" | "poor";

/** Lowest score that still reads as green / clear. */
export const CLEAR_SKIES_SCORE_GREEN_THRESHOLD = 75;
/** Lowest score that still reads as orange / moderate. */
export const CLEAR_SKIES_SCORE_ORANGE_THRESHOLD = 50;

/** Canonical band colors. Shared with the AQI palette intentionally. */
export const CLEAR_SKIES_SCORE_COLORS: Record<ClearSkiesScoreBand, string> = {
  clear: "#22E36B",
  moderate: "#F5A623",
  poor: "#FF5A5F",
};

/**
 * Canonical Clear Sky Score quality labels (product spec):
 *   75–100 → green  → Excellent
 *   50–74  → orange → Good
 *    0–49  → red    → Poor
 */
const CLEAR_SKIES_SCORE_QUALITY_LABELS: Record<ClearSkiesScoreBand, string> = {
  clear: "Excellent",
  moderate: "Good",
  poor: "Poor",
};

export function clampClearSkiesScore(score: number): number {
  if (!Number.isFinite(score)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function resolveClearSkiesScoreBand(score: number): ClearSkiesScoreBand {
  const clamped = clampClearSkiesScore(score);

  if (clamped >= CLEAR_SKIES_SCORE_GREEN_THRESHOLD) {
    return "clear";
  }

  if (clamped >= CLEAR_SKIES_SCORE_ORANGE_THRESHOLD) {
    return "moderate";
  }

  return "poor";
}

export function clearSkiesScoreColor(score: number): string {
  return CLEAR_SKIES_SCORE_COLORS[resolveClearSkiesScoreBand(score)];
}

/** Future-facing quality label — reserved for richer surfaces. */
export function clearSkiesScoreQualityLabel(score: number): string {
  return CLEAR_SKIES_SCORE_QUALITY_LABELS[resolveClearSkiesScoreBand(score)];
}

export type ClearSkiesScorePresentation = {
  score: number;
  band: ClearSkiesScoreBand;
  color: string;
  qualityLabel: string;
};

export function presentClearSkiesScore(
  score: number,
): ClearSkiesScorePresentation {
  const clamped = clampClearSkiesScore(score);
  const band = resolveClearSkiesScoreBand(clamped);

  return {
    score: clamped,
    band,
    color: CLEAR_SKIES_SCORE_COLORS[band],
    qualityLabel: CLEAR_SKIES_SCORE_QUALITY_LABELS[band],
  };
}
