import { describe, expect, it } from "vitest";

import {
  getBestRightNowScoreLabel,
  getFogIntensity,
  getFogIntensityLabel,
  getFogOverlayStyle,
  getLocationConditionLabel,
  getLocationFogOverlayStyle,
  locationMatchesFogIntensityFilter,
  locationQualifiesAsClearIntensity,
  resolveFogScore,
  resolveLocationFogIntensity,
  resolveMarkerDisplayIntensity,
  resolveRawLocationFogIntensity,
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

  it("resolves raw fogScore bands for internal scoring helpers", () => {
    expect(resolveRawLocationFogIntensity({ fogScore: 25, sunshineScore: 75 })).toBe(
      "lightFog",
    );
    expect(resolveRawLocationFogIntensity({ fogScore: 26, sunshineScore: 82 })).toBe(
      "lightFog",
    );
    expect(resolveRawLocationFogIntensity({ fogScore: 41, sunshineScore: 74 })).toBe(
      "lightFog",
    );
    expect(resolveRawLocationFogIntensity({ fogScore: 49, sunshineScore: 51 })).toBe(
      "lightFog",
    );
    expect(resolveRawLocationFogIntensity({ fogScore: 82, sunshineScore: 74 })).toBe(
      "karlTerritory",
    );
    expect(resolveRawLocationFogIntensity({ fogScore: 60, sunshineScore: 40 })).toBe(
      "foggy",
    );
    expect(
      getLocationFogOverlayStyle({ fogScore: 26, sunshineScore: 82 }),
    ).toBeNull();
  });

  it("renders clear-qualified locations as Clear in the user-facing display contract", () => {
    expect(resolveLocationFogIntensity({ fogScore: 10, sunshineScore: 90 })).toBe(
      "clear",
    );
    expect(resolveLocationFogIntensity({ fogScore: 24, sunshineScore: 76 })).toBe(
      "clear",
    );
    expect(resolveLocationFogIntensity({ fogScore: 26, sunshineScore: 82 })).toBe(
      "clear",
    );
    expect(getLocationConditionLabel({ fogScore: 26, sunshineScore: 82 })).toBe(
      "Clear",
    );
    expect(getLocationFogOverlayStyle({ fogScore: 10, sunshineScore: 90 })).toBeNull();
  });

  it("renders moderate fog as Light Fog when sunshineScore is below the Clear threshold", () => {
    expect(resolveLocationFogIntensity({ fogScore: 35, sunshineScore: 55 })).toBe(
      "lightFog",
    );
    expect(getLocationConditionLabel({ fogScore: 35, sunshineScore: 55 })).toBe(
      "Light Fog",
    );
    expect(
      getLocationFogOverlayStyle({ fogScore: 35, sunshineScore: 55 }),
    ).toMatchObject({
      radiusMeters: 1400 + 35 * 18,
    });
  });

  it("keeps Karl Territory and foggy locations on raw fogScore bands", () => {
    expect(
      resolveLocationFogIntensity({ fogScore: 82, sunshineScore: 18 }),
    ).toBe("karlTerritory");
    expect(
      resolveLocationFogIntensity({ fogScore: 60, sunshineScore: 40 }),
    ).toBe("foggy");
    expect(
      resolveLocationFogIntensity({ fogScore: 41, sunshineScore: 40 }),
    ).toBe("lightFog");
  });

  it("treats strong clear-sky scores as Clear even when fogScore is in the Light Fog band", () => {
    const tiburonLike = { fogScore: 26, sunshineScore: 82 };
    const sanJoseLike = { fogScore: 26, sunshineScore: 76 };

    expect(locationQualifiesAsClearIntensity(tiburonLike)).toBe(true);
    expect(locationMatchesFogIntensityFilter(tiburonLike, "clear")).toBe(true);
    expect(locationMatchesFogIntensityFilter(tiburonLike, "lightFog")).toBe(
      false,
    );
    expect(getBestRightNowScoreLabel(tiburonLike)).toBe("82 clear");

    expect(locationQualifiesAsClearIntensity(sanJoseLike)).toBe(true);
    expect(locationMatchesFogIntensityFilter(sanJoseLike, "clear")).toBe(true);
    expect(getBestRightNowScoreLabel(sanJoseLike)).toBe("76 clear");
  });

  it("keeps moderate fog in Light Fog when sunshineScore is below the Clear threshold", () => {
    const moderateFog = { fogScore: 35, sunshineScore: 55 };

    expect(locationQualifiesAsClearIntensity(moderateFog)).toBe(false);
    expect(locationMatchesFogIntensityFilter(moderateFog, "clear")).toBe(false);
    expect(locationMatchesFogIntensityFilter(moderateFog, "lightFog")).toBe(
      true,
    );
    expect(getBestRightNowScoreLabel(moderateFog)).toBe("55 sunshine");
  });

  it("treats fogScore below 25 as Clear even when sunshineScore is below 70", () => {
    const sanJoseLike = { fogScore: 24, sunshineScore: 76 };

    expect(locationQualifiesAsClearIntensity(sanJoseLike)).toBe(true);
    expect(locationMatchesFogIntensityFilter(sanJoseLike, "clear")).toBe(true);
    expect(getBestRightNowScoreLabel(sanJoseLike)).toBe("76 clear");
  });

  it("aligns marker display intensity with the user-facing contract", () => {
    const tiburonLike = { fogScore: 26, sunshineScore: 82 };
    const moderateFog = { fogScore: 35, sunshineScore: 55 };

    expect(resolveMarkerDisplayIntensity(tiburonLike)).toBe("clear");
    expect(resolveMarkerDisplayIntensity(moderateFog)).toBe("lightFog");
  });

  it("builds iOS-aligned location fog overlay styling without a new score model", () => {
    const overlay = getLocationFogOverlayStyle({ fogScore: 82, sunshineScore: 18 });

    expect(overlay).toMatchObject({
      color: "rgb(184 214 237)",
      radiusMeters: 2800 + 82 * 58,
    });
    expect(getLocationFogOverlayStyle({ fogScore: 10, sunshineScore: 90 })).toBeNull();
    expect(getFogOverlayStyle(10)).toBeNull();
  });

  it("uses smaller overlays for light fog and larger ones for Karl Territory", () => {
    const lightFog = getLocationFogOverlayStyle({
      fogScore: 30,
      sunshineScore: 40,
    });
    const foggy = getLocationFogOverlayStyle({ fogScore: 60, sunshineScore: 35 });
    const karlTerritory = getLocationFogOverlayStyle({
      fogScore: 82,
      sunshineScore: 18,
    });

    expect(lightFog?.radiusMeters).toBeLessThan(foggy?.radiusMeters ?? 0);
    expect(foggy?.radiusMeters).toBeLessThan(karlTerritory?.radiusMeters ?? 0);
  });
});
