import { describe, expect, it } from "vitest";

import {
  getFogIntensity,
  getFogIntensityLabel,
  getLocationConditionLabel,
  getFogOverlayStyle,
  resolveFogScore,
} from "@/lib/map/conditions";

describe("map conditions", () => {
  it("derives fog intensity from backend fogScore", () => {
    expect(resolveFogScore({ fogScore: 82, sunshineScore: 74 })).toBe(82);
    expect(getFogIntensity(82)).toBe("karlTerritory");
    expect(getFogIntensityLabel("karlTerritory")).toBe("Karl Territory");
  });

  it("falls back to sunshineScore when fogScore is missing", () => {
    expect(resolveFogScore({ sunshineScore: 80 })).toBe(20);
    expect(getFogIntensity(20)).toBe("clear");
  });

  it("returns unavailable language when condition data is missing", () => {
    expect(getLocationConditionLabel({})).toBe("Conditions unavailable");
    expect(getLocationConditionLabel({ status: "Mostly Sunny" })).toBe("Mostly Sunny");
  });

  it("builds iOS-aligned location fog overlay styling without a new score model", () => {
    const overlay = getFogOverlayStyle(82);

    expect(overlay).toMatchObject({
      color: "rgb(184 214 237)",
      radiusMeters: 1800 + 82 * 58,
    });
    expect(getFogOverlayStyle(10)).toBeNull();
  });
});
