import { describe, expect, it } from "vitest";

import {
  formatHumidityPercent,
  humidityCategoryFromValue,
  presentHumidity,
} from "@/lib/weather/humidity";

describe("presentHumidity", () => {
  it("formats whole-percent humidity from a finite number", () => {
    expect(formatHumidityPercent(72.4)).toBe("72%");
    expect(presentHumidity(72)).toMatchObject({
      available: true,
      value: 72,
      formatted: "72%",
      category: "comfortable",
      label: "Comfortable",
    });
  });

  it("maps product-approved RH bands to display labels", () => {
    expect(humidityCategoryFromValue(20)).toEqual({
      category: "dry",
      label: "Dry",
    });
    expect(humidityCategoryFromValue(34)).toEqual({
      category: "dry",
      label: "Dry",
    });
    expect(humidityCategoryFromValue(35)).toEqual({
      category: "comfortable",
      label: "Comfortable",
    });
    expect(humidityCategoryFromValue(79)).toEqual({
      category: "comfortable",
      label: "Comfortable",
    });
    expect(humidityCategoryFromValue(80)).toEqual({
      category: "sticky",
      label: "Sticky",
    });
  });

  it("treats missing or non-finite humidity as Unavailable", () => {
    expect(presentHumidity(undefined).formatted).toBe("Unavailable");
    expect(presentHumidity(null).available).toBe(false);
    expect(presentHumidity(null).label).toBe("Unavailable");
    expect(presentHumidity(Number.NaN).available).toBe(false);
    expect(presentHumidity(Number.POSITIVE_INFINITY).formatted).toBe(
      "Unavailable",
    );
  });
});
