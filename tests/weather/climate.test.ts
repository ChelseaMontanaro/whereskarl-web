import { describe, expect, it } from "vitest";

import {
  CLIMATE_ICON_COLOR,
  CLIMATE_VALUES,
  isClimate,
  presentClimate,
} from "@/lib/weather/climate";

describe("presentClimate", () => {
  it("presents every approved Climate value", () => {
    for (const climate of CLIMATE_VALUES) {
      const presented = presentClimate(climate);
      expect(presented.available).toBe(true);
      expect(presented.value).toBe(climate);
      expect(presented.formatted).toBe(climate);
      expect(presented.iconLabel).toBe(`${climate} climate`);
      expect(CLIMATE_ICON_COLOR[climate]).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it("renders Unavailable for missing Climate", () => {
    expect(presentClimate(undefined)).toEqual({
      available: false,
      value: null,
      formatted: "Unavailable",
      iconLabel: "Climate unavailable",
    });
  });

  it("renders Unavailable for unsupported Climate strings", () => {
    expect(presentClimate("Coastal").available).toBe(false);
    expect(presentClimate("Valley").formatted).toBe("Unavailable");
    expect(presentClimate("marine").available).toBe(false);
    expect(isClimate("Fog Belt")).toBe(true);
    expect(isClimate("Karl Zone")).toBe(false);
  });
});
