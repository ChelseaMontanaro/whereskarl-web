// @vitest-environment happy-dom

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { karlIntelligenceResponseSchema } from "@/lib/schemas/intelligence";
import {
  lastKnownIntelligenceForHydration,
  loadLastKnownWeather,
  saveLastKnownWeather,
  stripHeroImageryFromIntelligence,
} from "@/lib/storage/lastKnownWeather";
import { STORAGE_KEYS } from "@/lib/constants/config";

const FIXTURES_DIR = join(process.cwd(), "tests/fixtures");

describe("stripHeroImageryFromIntelligence", () => {
  it("clears remote hero URLs while preserving narrative fields", () => {
    const intelligence = karlIntelligenceResponseSchema.parse(
      JSON.parse(
        readFileSync(
          join(FIXTURES_DIR, "karl-intelligence-mill-valley.json"),
          "utf8",
        ),
      ),
    );

    const stripped = stripHeroImageryFromIntelligence(intelligence);

    expect(stripped.heroImagery.imageUrl).toBeNull();
    expect(stripped.heroImagery.localFallbackAsset).toBe(
      intelligence.heroImagery.localFallbackAsset,
    );
    expect(stripped.heroImagery.stabilityKey).toBe(
      intelligence.heroImagery.stabilityKey,
    );
    expect(stripped.narrative.headline).toBe(intelligence.narrative.headline);
    expect(stripped.multiRegionRanking).toEqual(intelligence.multiRegionRanking);
  });

  it("returns undefined from lastKnownIntelligenceForHydration when absent", () => {
    expect(lastKnownIntelligenceForHydration(undefined)).toBeUndefined();
  });
});

describe("saveLastKnownWeather", () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it("persists intelligence without hero image URLs", () => {
    const intelligence = karlIntelligenceResponseSchema.parse(
      JSON.parse(
        readFileSync(
          join(FIXTURES_DIR, "karl-intelligence-mill-valley.json"),
          "utf8",
        ),
      ),
    );

    saveLastKnownWeather({
      current: JSON.parse(readFileSync(join(FIXTURES_DIR, "current.json"), "utf8")),
      locations: JSON.parse(
        readFileSync(join(FIXTURES_DIR, "locations.json"), "utf8"),
      ),
      bestSunshine: JSON.parse(
        readFileSync(join(FIXTURES_DIR, "best-sunshine.json"), "utf8"),
      ),
      intelligence,
      savedAt: "2026-07-01T16:00:00.000Z",
    });

    const restored = loadLastKnownWeather();

    expect(restored?.intelligence?.heroImagery.imageUrl).toBeNull();
    expect(restored?.intelligence?.heroImagery.localFallbackAsset).toBe(
      "hero_mixed",
    );
    expect(restored?.intelligence?.heroImagery.stabilityKey).toBe(
      intelligence.heroImagery.stabilityKey,
    );
    expect(
      window.localStorage.getItem(STORAGE_KEYS.lastKnownWeather),
    ).not.toContain("cdn.example.com/assets/hero");
  });
});
