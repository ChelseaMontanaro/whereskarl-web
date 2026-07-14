import { describe, expect, it } from "vitest";

import {
  formatVisibilityMiles,
  presentVisibility,
  visibilityCategoryFromValue,
} from "@/lib/weather/visibility";

describe("presentVisibility", () => {
  it("formats whole miles without a trailing decimal", () => {
    expect(formatVisibilityMiles(10)).toBe("10 mi");
    expect(presentVisibility(10)).toMatchObject({
      available: true,
      value: 10,
      formatted: "10 mi",
      category: "excellent",
      label: "Excellent",
    });
  });

  it("keeps one decimal for fractional miles", () => {
    expect(formatVisibilityMiles(0.8)).toBe("0.8 mi");
    expect(formatVisibilityMiles(9.55)).toBe("9.6 mi");
  });

  it("maps product-approved mile bands to display labels", () => {
    expect(visibilityCategoryFromValue(10)).toEqual({
      category: "excellent",
      label: "Excellent",
    });
    expect(visibilityCategoryFromValue(6)).toEqual({
      category: "good",
      label: "Good",
    });
    expect(visibilityCategoryFromValue(3)).toEqual({
      category: "fair",
      label: "Fair",
    });
    expect(visibilityCategoryFromValue(0.5)).toEqual({
      category: "poor",
      label: "Poor",
    });
  });

  it("treats missing or non-finite visibility as Unavailable", () => {
    expect(presentVisibility(undefined).formatted).toBe("Unavailable");
    expect(presentVisibility(null).available).toBe(false);
    expect(presentVisibility(null).label).toBe("Unavailable");
    expect(presentVisibility(Number.NaN).available).toBe(false);
  });
});
