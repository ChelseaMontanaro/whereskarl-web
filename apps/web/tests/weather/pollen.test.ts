import { describe, expect, it } from "vitest";

import type { Pollen } from "@/lib/schemas/weather";
import {
  POLLEN_COLOR_BY_TOKEN,
  formatPollenCompact,
  presentPollen,
} from "@/lib/weather/pollen";

function pollenFixture(
  overrides: Partial<Pollen> &
    Pick<Pollen, "value" | "category" | "label">,
): Pollen {
  return {
    description: null,
    dominantType: "grass",
    types: {
      tree: null,
      grass: null,
      weed: null,
    },
    forecastDate: "2026-07-14",
    source: "Google Pollen",
    isAvailable: true,
    colorToken: overrides.category
      ? (`pollen.${overrides.category}` as Pollen["colorToken"])
      : "pollen.unavailable",
    ...overrides,
  };
}

describe("pollen presentation", () => {
  it("uses backend colorToken for semantic styling without re-banding", () => {
    const cases: Array<[NonNullable<Pollen["category"]>, string]> = [
      ["none", "None"],
      ["very-low", "Very Low"],
      ["low", "Low"],
      ["moderate", "Moderate"],
      ["high", "High"],
      ["very-high", "Very High"],
    ];

    for (const [category, label] of cases) {
      const colorToken = `pollen.${category}` as const;
      const presentation = presentPollen(
        pollenFixture({
          value: 3,
          category,
          label,
          colorToken,
        }),
      );

      expect(presentation.available).toBe(true);
      expect(presentation.category).toBe(category);
      expect(presentation.colorToken).toBe(colorToken);
      expect(presentation.label).toBe(label);
      expect(presentation.color).toBe(POLLEN_COLOR_BY_TOKEN[colorToken]);
    }
  });

  it("reports availability and canonical color for present data", () => {
    expect(
      presentPollen(
        pollenFixture({
          value: 4,
          category: "high",
          label: "High",
          colorToken: "pollen.high",
          description: "Pollen allergy symptoms are likely for sensitive people.",
        }),
      ),
    ).toEqual({
      available: true,
      value: 4,
      category: "high",
      colorToken: "pollen.high",
      color: POLLEN_COLOR_BY_TOKEN["pollen.high"],
      label: "High",
      description: "Pollen allergy symptoms are likely for sensitive people.",
    });
  });

  it("reports unavailable without inventing a value when data is missing", () => {
    for (const value of [null, undefined]) {
      expect(presentPollen(value)).toEqual({
        available: false,
        value: null,
        category: null,
        colorToken: "pollen.unavailable",
        color: null,
        label: "Unavailable",
        description: null,
      });
    }

    expect(
      presentPollen(
        pollenFixture({
          value: 3,
          category: "moderate",
          label: "Moderate",
          isAvailable: false,
        }),
      ).available,
    ).toBe(false);
  });

  it("treats UPI 0 None as available", () => {
    const presentation = presentPollen(
      pollenFixture({
        value: 0,
        category: "none",
        label: "None",
        colorToken: "pollen.none",
      }),
    );

    expect(presentation.available).toBe(true);
    expect(presentation.value).toBe(0);
    expect(formatPollenCompact(presentation)).toBe("0 · None");
  });

  it("renders every UPI index 0 through 5 with finite-number checks (not truthiness)", () => {
    const bands: Array<[number, NonNullable<Pollen["category"]>, string]> = [
      [0, "none", "None"],
      [1, "very-low", "Very Low"],
      [2, "low", "Low"],
      [3, "moderate", "Moderate"],
      [4, "high", "High"],
      [5, "very-high", "Very High"],
    ];

    for (const [value, category, label] of bands) {
      const presentation = presentPollen(
        pollenFixture({
          value,
          category,
          label,
          colorToken: `pollen.${category}`,
        }),
      );
      expect(presentation.available).toBe(true);
      expect(presentation.value).toBe(value);
      expect(presentation.category).toBe(category);
      expect(presentation.label).toBe(label);
    }
  });

  it("treats null value, missing pollen, and NaN as unavailable", () => {
    expect(
      presentPollen(
        pollenFixture({
          value: null as unknown as number,
          category: "low",
          label: "Low",
          isAvailable: true,
        }),
      ).available,
    ).toBe(false);

    expect(presentPollen(undefined).available).toBe(false);
    expect(presentPollen(null).available).toBe(false);

    expect(
      presentPollen(
        pollenFixture({
          value: Number.NaN,
          category: "low",
          label: "Low",
        }),
      ).available,
    ).toBe(false);
  });

  it("formats compact copy", () => {
    expect(
      formatPollenCompact(
        presentPollen(
          pollenFixture({
            value: 3,
            category: "moderate",
            label: "Moderate",
          }),
        ),
      ),
    ).toBe("3 · Moderate");

    expect(formatPollenCompact(presentPollen(null))).toBe("Unavailable");
  });
});
