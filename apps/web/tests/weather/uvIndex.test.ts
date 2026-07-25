import { describe, expect, it } from "vitest";

import type { UltravioletIndex } from "@/lib/schemas/weather";
import {
  UV_INDEX_COLOR_BY_TOKEN,
  formatUvIndexCompact,
  presentUvIndex,
} from "@/lib/weather/uvIndex";

function uvIndexFixture(
  overrides: Partial<UltravioletIndex> &
    Pick<UltravioletIndex, "value" | "category" | "label">,
): UltravioletIndex {
  return {
    description: null,
    observedAt: "2026-07-13T20:00:00.000Z",
    source: "Open-Meteo",
    isAvailable: true,
    colorToken: overrides.category
      ? (`uv.${overrides.category}` as UltravioletIndex["colorToken"])
      : "uv.unavailable",
    ...overrides,
  };
}

describe("uvIndex presentation", () => {
  it("uses backend colorToken for semantic styling without re-banding", () => {
    const cases: Array<[NonNullable<UltravioletIndex["category"]>, string]> = [
      ["low", "Low"],
      ["moderate", "Moderate"],
      ["high", "High"],
      ["very-high", "Very High"],
      ["extreme", "Extreme"],
    ];

    for (const [category, label] of cases) {
      const colorToken = `uv.${category}` as const;
      const presentation = presentUvIndex(
        uvIndexFixture({
          value: 8,
          category,
          label,
          colorToken,
        }),
      );

      expect(presentation.available).toBe(true);
      expect(presentation.category).toBe(category);
      expect(presentation.colorToken).toBe(colorToken);
      expect(presentation.label).toBe(label);
      expect(presentation.color).toBe(UV_INDEX_COLOR_BY_TOKEN[colorToken]);
    }
  });

  it("reports availability and canonical color for present data", () => {
    expect(
      presentUvIndex(
        uvIndexFixture({
          value: 8,
          category: "very-high",
          label: "Very High",
          colorToken: "uv.very-high",
          description: "Sun protection is strongly recommended.",
        }),
      ),
    ).toEqual({
      available: true,
      value: 8,
      category: "very-high",
      colorToken: "uv.very-high",
      color: UV_INDEX_COLOR_BY_TOKEN["uv.very-high"],
      label: "Very High",
      description: "Sun protection is strongly recommended.",
    });
  });

  it("reports unavailable without inventing a value when data is missing", () => {
    for (const value of [
      null,
      undefined,
      {
        value: null,
        category: null,
        colorToken: "uv.unavailable" as const,
        label: "Unavailable",
        description: null,
        observedAt: null,
        source: null,
        isAvailable: false,
      } satisfies UltravioletIndex,
      uvIndexFixture({
        value: Number.NaN,
        category: "low",
        label: "Low",
        isAvailable: true,
      }),
      uvIndexFixture({
        value: 8,
        category: null,
        label: "Very High",
        isAvailable: true,
      }),
    ]) {
      expect(presentUvIndex(value)).toEqual({
        available: false,
        value: null,
        category: null,
        colorToken: "uv.unavailable",
        color: null,
        label: "Unavailable",
        description: null,
      });
    }
  });

  it("formats compact copy for any surface", () => {
    expect(
      formatUvIndexCompact(
        presentUvIndex(
          uvIndexFixture({
            value: 8,
            category: "very-high",
            label: "Very High",
          }),
        ),
      ),
    ).toBe("8 · Very High");

    expect(formatUvIndexCompact(presentUvIndex(null))).toBe("Unavailable");
  });
});
