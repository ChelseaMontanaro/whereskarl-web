import { describe, expect, it } from "vitest";

import {
  airQualityAccessibleLabel,
  compactAirQualityTileLabel,
} from "@/lib/weather/environmentalDisplay";
import type { AirQualityPresentation } from "@/lib/weather/airQuality";

function presentation(
  overrides: Partial<AirQualityPresentation>,
): AirQualityPresentation {
  return {
    available: true,
    aqi: 125,
    category: "unhealthy-sensitive",
    colorToken: "aqi.unhealthy-sensitive",
    color: "#F97316",
    label: "Unhealthy for Sensitive Groups",
    description: null,
    ...overrides,
  };
}

describe("compactAirQualityTileLabel", () => {
  it("uses Sensitive for unhealthy-sensitive while keeping full accessible copy", () => {
    const presented = presentation({});
    expect(compactAirQualityTileLabel(presented)).toBe("Sensitive");
    expect(airQualityAccessibleLabel(presented)).toBe(
      "AQI, 125, Unhealthy for Sensitive Groups",
    );
    expect(presented.label).toBe("Unhealthy for Sensitive Groups");
  });

  it("maps other categories to deliberate short tile labels", () => {
    expect(
      compactAirQualityTileLabel(
        presentation({ category: "good", aqi: 40, label: "Good" }),
      ),
    ).toBe("Good");
    expect(
      compactAirQualityTileLabel(
        presentation({ category: "hazardous", aqi: 320, label: "Hazardous" }),
      ),
    ).toBe("Hazardous");
  });

  it("returns empty when AQI is unavailable", () => {
    expect(
      compactAirQualityTileLabel(
        presentation({
          available: false,
          aqi: null,
          category: null,
          label: "Unavailable",
          colorToken: "aqi.unavailable",
          color: null,
        }),
      ),
    ).toBe("");
  });
});
