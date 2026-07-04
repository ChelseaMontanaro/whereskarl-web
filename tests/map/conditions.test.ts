import { describe, expect, it } from "vitest";

import {
  getFogIntensity,
  getFogIntensityLabel,
  getFogOverlayStyle,
  getLocationConditionLabel,
  getLocationFogOverlayStyle,
  resolveFogScore,
  resolveLocationFogIntensity,
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

  it("keeps fogScore below 25 in the Clear band regardless of sunshineScore", () => {
    expect(resolveLocationFogIntensity({ fogScore: 10, sunshineScore: 90 })).toBe(
      "clear",
    );
    expect(resolveLocationFogIntensity({ fogScore: 24, sunshineScore: 76 })).toBe(
      "clear",
    );
    expect(getLocationConditionLabel({ fogScore: 10, sunshineScore: 90 })).toBe(
      "Clear",
    );
    expect(getLocationFogOverlayStyle({ fogScore: 10, sunshineScore: 90 })).toBeNull();
  });

  it("resolves fogScore 25–49 to Light Fog even when sunshineScore is at least 50", () => {
    expect(
      resolveLocationFogIntensity({ fogScore: 25, sunshineScore: 75 }),
    ).toBe("lightFog");
    expect(
      resolveLocationFogIntensity({ fogScore: 26, sunshineScore: 82 }),
    ).toBe("lightFog");
    expect(
      resolveLocationFogIntensity({ fogScore: 41, sunshineScore: 74 }),
    ).toBe("lightFog");
    expect(
      resolveLocationFogIntensity({ fogScore: 49, sunshineScore: 51 }),
    ).toBe("lightFog");
    expect(getLocationConditionLabel({ fogScore: 26, sunshineScore: 82 })).toBe(
      "Light Fog",
    );
    expect(
      getLocationFogOverlayStyle({ fogScore: 26, sunshineScore: 82 }),
    ).toMatchObject({
      radiusMeters: 1400 + 26 * 18,
    });
  });

  it("keeps Karl Territory and foggy locations out of the clear band", () => {
    expect(
      resolveLocationFogIntensity({ fogScore: 82, sunshineScore: 74 }),
    ).toBe("karlTerritory");
    expect(
      resolveLocationFogIntensity({ fogScore: 60, sunshineScore: 40 }),
    ).toBe("foggy");
    expect(
      resolveLocationFogIntensity({ fogScore: 41, sunshineScore: 40 }),
    ).toBe("lightFog");
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
