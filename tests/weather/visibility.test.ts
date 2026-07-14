import { describe, expect, it } from "vitest";

import {
  formatVisibilityMiles,
  presentVisibility,
} from "@/lib/weather/visibility";

describe("presentVisibility", () => {
  it("formats whole miles without a trailing decimal", () => {
    expect(formatVisibilityMiles(10)).toBe("10 mi");
    expect(presentVisibility(10)).toEqual({
      available: true,
      value: 10,
      formatted: "10 mi",
    });
  });

  it("keeps one decimal for fractional miles", () => {
    expect(formatVisibilityMiles(0.8)).toBe("0.8 mi");
    expect(formatVisibilityMiles(9.55)).toBe("9.6 mi");
  });

  it("treats missing or non-finite visibility as Unavailable", () => {
    expect(presentVisibility(undefined).formatted).toBe("Unavailable");
    expect(presentVisibility(null).available).toBe(false);
    expect(presentVisibility(Number.NaN).available).toBe(false);
  });

  it("does not invent qualitative visibility labels", () => {
    const presented = presentVisibility(0.5);
    expect(presented.formatted).toBe("0.5 mi");
    expect(presented.formatted).not.toMatch(/excellent|poor|haze/i);
  });
});
