import { describe, expect, it } from "vitest";

import {
  formatHumidityPercent,
  presentHumidity,
} from "@/lib/weather/humidity";

describe("presentHumidity", () => {
  it("formats whole-percent humidity from a finite number", () => {
    expect(formatHumidityPercent(72.4)).toBe("72%");
    expect(presentHumidity(72)).toEqual({
      available: true,
      value: 72,
      formatted: "72%",
    });
  });

  it("treats missing or non-finite humidity as Unavailable", () => {
    expect(presentHumidity(undefined).formatted).toBe("Unavailable");
    expect(presentHumidity(null).available).toBe(false);
    expect(presentHumidity(Number.NaN).available).toBe(false);
    expect(presentHumidity(Number.POSITIVE_INFINITY).formatted).toBe(
      "Unavailable",
    );
  });

  it("does not invent qualitative comfort labels", () => {
    const presented = presentHumidity(94);
    expect(presented.formatted).toBe("94%");
    expect(presented.formatted).not.toMatch(/comfortable|dry|muggy/i);
  });
});
