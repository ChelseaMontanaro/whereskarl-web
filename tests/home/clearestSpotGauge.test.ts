// @vitest-environment happy-dom

import { describe, expect, it } from "vitest";

import {
  CLEAREST_SPOT_GAUGE_CENTER_X,
  CLEAREST_SPOT_GAUGE_CENTER_Y,
  CLEAREST_SPOT_GAUGE_RADIUS,
  clearestSpotGaugeActiveArcPath,
  clearestSpotGaugeArcEnd,
  clearestSpotGaugeArcStart,
  clearestSpotGaugeAriaLabel,
  clearestSpotGaugeInactiveArcPath,
  clearestSpotGaugeMarkerPoint,
} from "@/lib/home/clearestSpotGauge";

describe("clearestSpotGauge", () => {
  it("builds the clearest spot gauge accessibility label", () => {
    expect(clearestSpotGaugeAriaLabel(60)).toBe("Clearest spot score: 60 out of 100");
    expect(clearestSpotGaugeAriaLabel(140)).toBe("Clearest spot score: 100 out of 100");
  });

  it.each([
    [0, clearestSpotGaugeArcStart()],
    [100, clearestSpotGaugeArcEnd()],
  ])("places score %i marker on the arc endpoint", (score, expectedPoint) => {
    const marker = clearestSpotGaugeMarkerPoint(score);

    expect(marker.x).toBeCloseTo(expectedPoint.x, 5);
    expect(marker.y).toBeCloseTo(expectedPoint.y, 5);
  });

  it("places score 50 at the top center of the semicircle", () => {
    const marker = clearestSpotGaugeMarkerPoint(50);

    expect(marker.x).toBeCloseTo(CLEAREST_SPOT_GAUGE_CENTER_X, 5);
    expect(marker.y).toBeCloseTo(CLEAREST_SPOT_GAUGE_CENTER_Y - CLEAREST_SPOT_GAUGE_RADIUS, 5);
  });

  it("places score 60 slightly right of top center", () => {
    const marker = clearestSpotGaugeMarkerPoint(60);

    expect(marker.x).toBeGreaterThan(CLEAREST_SPOT_GAUGE_CENTER_X);
    expect(marker.y).toBeLessThan(CLEAREST_SPOT_GAUGE_CENTER_Y);
  });

  it.each([0, 25, 60, 80, 100])(
    "derives active and inactive arc paths for score %i",
    (score) => {
      const marker = clearestSpotGaugeMarkerPoint(score);
      const activeArcPath = clearestSpotGaugeActiveArcPath(score);
      const inactiveArcPath = clearestSpotGaugeInactiveArcPath(score);

      if (score <= 0) {
        expect(activeArcPath).toBeNull();
      } else {
        expect(activeArcPath).toContain(" A ");
        expect(activeArcPath).toContain(`${marker.x} ${marker.y}`);
      }

      if (score >= 100) {
        expect(inactiveArcPath).toBeNull();
      } else {
        expect(inactiveArcPath).toContain(" A ");
        expect(inactiveArcPath).toContain(`${marker.x} ${marker.y}`);
      }
    },
  );
});
