import { describe, expect, it } from "vitest";

import {
  HERO_CDN_BASE,
  resolveHeroImageUrls,
  resolveLocalFallbackImageUrl,
} from "@/lib/home/heroAssets";
import { karlIntelligenceResponseSchema } from "@/lib/schemas/intelligence";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const FIXTURES_DIR = join(process.cwd(), "tests/fixtures");

describe("resolveLocalFallbackImageUrl", () => {
  it("maps hero_mixed to a day/night CDN scene", () => {
    expect(resolveLocalFallbackImageUrl("hero_mixed", "day")).toBe(
      `${HERO_CDN_BASE}/hero/marin-headlands/day.png`,
    );
    expect(resolveLocalFallbackImageUrl("hero_mixed", "night")).toBe(
      `${HERO_CDN_BASE}/hero/marin-headlands/night.png`,
    );
  });

  it("maps hero_clearing for new-location fallbacks", () => {
    expect(resolveLocalFallbackImageUrl("hero_clearing", "night")).toBe(
      `${HERO_CDN_BASE}/hero/oakland/night.png`,
    );
  });
});

describe("resolveHeroImageUrls", () => {
  it("uses remote imageUrl when available", () => {
    const fixture = karlIntelligenceResponseSchema.parse(
      JSON.parse(
        readFileSync(
          join(FIXTURES_DIR, "karl-intelligence-mill-valley.json"),
          "utf8",
        ),
      ),
    );

    const urls = resolveHeroImageUrls(fixture.heroImagery);

    expect(urls.imageUrl).toBe(
      "https://cdn.example.com/assets/hero/mill-valley/day.png",
    );
    expect(urls.fallbackImageUrl).toBe(
      `${HERO_CDN_BASE}/hero/marin-headlands/day.png`,
    );
  });

  it("falls back to localFallbackAsset when imageUrl is missing", () => {
    const fixture = karlIntelligenceResponseSchema.parse(
      JSON.parse(
        readFileSync(join(FIXTURES_DIR, "karl-intelligence.json"), "utf8"),
      ),
    );

    const urls = resolveHeroImageUrls(fixture.heroImagery);

    expect(urls.imageUrl).toBe(`${HERO_CDN_BASE}/hero/marin-headlands/day.png`);
    expect(urls.fallbackImageUrl).toBeNull();
  });

  it("keeps a local fallback when remote URL exists for unknown scene assets", () => {
    const urls = resolveHeroImageUrls({
      conditionState: "clearing-retreat",
      stabilityKey: "clearing-retreat|pacifica|night|night|hero/scenes/pacifica-night.jpg",
      imageUrl:
        "https://snhitxyrhse7o7xm.public.blob.vercel-storage.com/hero/scenes/pacifica-night.jpg",
      localFallbackAsset: "hero_clearing",
      presentation: {
        timeOfDay: "night",
        localFallbackAsset: "hero_clearing",
      },
      source: "cdn",
      confidenceLabel: "High",
      imageKey: "hero/scenes/pacifica-night.jpg",
      focusLocationId: "pacifica",
      fallbackReason: null,
      altText: "Fog retreating toward the Pacific coastline.",
    });

    expect(urls.imageUrl).toContain("pacifica-night.jpg");
    expect(urls.fallbackImageUrl).toBe(
      `${HERO_CDN_BASE}/hero/oakland/night.png`,
    );
  });
});
