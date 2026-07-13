import { describe, expect, it } from "vitest";

import {
  CLEAR_SKIES_SCORE_COLORS,
  clampClearSkiesScore,
  clearSkiesScoreColor,
  clearSkiesScoreQualityLabel,
  presentClearSkiesScore,
  resolveClearSkiesScoreBand,
} from "@/lib/score/clearSkiesScore";

describe("clearSkiesScore presentation", () => {
  it("bands scores using canonical thresholds", () => {
    expect(resolveClearSkiesScoreBand(100)).toBe("clear");
    expect(resolveClearSkiesScoreBand(75)).toBe("clear");
    expect(resolveClearSkiesScoreBand(74)).toBe("moderate");
    expect(resolveClearSkiesScoreBand(50)).toBe("moderate");
    expect(resolveClearSkiesScoreBand(49)).toBe("poor");
    expect(resolveClearSkiesScoreBand(0)).toBe("poor");
  });

  it("maps each band to its canonical color", () => {
    expect(clearSkiesScoreColor(88)).toBe(CLEAR_SKIES_SCORE_COLORS.clear);
    expect(clearSkiesScoreColor(60)).toBe(CLEAR_SKIES_SCORE_COLORS.moderate);
    expect(clearSkiesScoreColor(20)).toBe(CLEAR_SKIES_SCORE_COLORS.poor);
  });

  it("clamps out-of-range and non-finite scores", () => {
    expect(clampClearSkiesScore(140)).toBe(100);
    expect(clampClearSkiesScore(-10)).toBe(0);
    expect(clampClearSkiesScore(Number.NaN)).toBe(0);
    expect(clampClearSkiesScore(72.6)).toBe(73);
  });

  it("owns the canonical quality label for each band", () => {
    // 75–100 → green → Excellent
    expect(clearSkiesScoreQualityLabel(90)).toBe("Excellent");
    expect(clearSkiesScoreQualityLabel(75)).toBe("Excellent");
    // 50–74 → orange → Good
    expect(clearSkiesScoreQualityLabel(60)).toBe("Good");
    expect(clearSkiesScoreQualityLabel(50)).toBe("Good");
    // 0–49 → red → Poor
    expect(clearSkiesScoreQualityLabel(49)).toBe("Poor");
    expect(clearSkiesScoreQualityLabel(10)).toBe("Poor");
  });

  it("presents a full record for consumers", () => {
    expect(presentClearSkiesScore(82)).toEqual({
      score: 82,
      band: "clear",
      color: CLEAR_SKIES_SCORE_COLORS.clear,
      qualityLabel: "Excellent",
    });
  });
});
