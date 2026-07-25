import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { HERO_CDN_BASE } from "@/lib/home/heroAssets";
import {
  activeHeroImageUrl,
  resolveHeroPresentation,
  selectHeroImageSource,
} from "@/lib/home/heroPresentation";
import { karlIntelligenceResponseSchema } from "@/lib/schemas/intelligence";

const FIXTURES_DIR = join(process.cwd(), "tests/fixtures");

describe("resolveHeroPresentation", () => {
  it("uses remote imageUrl from intelligence heroImagery", () => {
    const fixture = karlIntelligenceResponseSchema.parse(
      JSON.parse(
        readFileSync(
          join(FIXTURES_DIR, "karl-intelligence-mill-valley.json"),
          "utf8",
        ),
      ),
    );

    const presentation = resolveHeroPresentation(fixture.heroImagery);

    expect(presentation.imageUrl).toBe(
      "https://cdn.example.com/assets/hero/mill-valley/day.png",
    );
    expect(presentation.fallbackImageUrl).toBe(
      `${HERO_CDN_BASE}/hero/marin-headlands/day.png`,
    );
    expect(presentation.altText).toBeTruthy();
    expect(
      selectHeroImageSource({
        imageUrl: presentation.imageUrl,
        fallbackImageUrl: presentation.fallbackImageUrl,
        remoteLoadFailed: false,
      }),
    ).toBe("remote");
  });

  it("uses local fallback metadata when imageUrl is missing", () => {
    const fixture = karlIntelligenceResponseSchema.parse(
      JSON.parse(
        readFileSync(join(FIXTURES_DIR, "karl-intelligence.json"), "utf8"),
      ),
    );

    const presentation = resolveHeroPresentation(fixture.heroImagery);

    expect(presentation.imageUrl).toBe(
      `${HERO_CDN_BASE}/hero/marin-headlands/day.png`,
    );
    expect(presentation.fallbackImageUrl).toBeNull();
    expect(
      selectHeroImageSource({
        imageUrl: presentation.imageUrl,
        fallbackImageUrl: presentation.fallbackImageUrl,
        remoteLoadFailed: false,
      }),
    ).toBe("remote");
  });

  it("switches to local fallback after remote load failure", () => {
    const fixture = karlIntelligenceResponseSchema.parse(
      JSON.parse(
        readFileSync(
          join(FIXTURES_DIR, "karl-intelligence-mill-valley.json"),
          "utf8",
        ),
      ),
    );
    const presentation = resolveHeroPresentation(fixture.heroImagery);

    expect(
      selectHeroImageSource({
        imageUrl: presentation.imageUrl,
        fallbackImageUrl: presentation.fallbackImageUrl,
        remoteLoadFailed: true,
      }),
    ).toBe("local-fallback");
    expect(activeHeroImageUrl(presentation, "local-fallback")).toBe(
      presentation.fallbackImageUrl,
    );
  });

  it("falls back visually when image URLs are unavailable or both loads fail", () => {
    const presentation = resolveHeroPresentation(null);

    expect(presentation.imageUrl).toBeNull();
    expect(presentation.fallbackImageUrl).toBeNull();
    expect(
      selectHeroImageSource({
        imageUrl: presentation.imageUrl,
        fallbackImageUrl: presentation.fallbackImageUrl,
        remoteLoadFailed: false,
      }),
    ).toBe("gradient");
    expect(
      selectHeroImageSource({
        imageUrl: "https://cdn.example.com/assets/hero/mill-valley/day.png",
        fallbackImageUrl: `${HERO_CDN_BASE}/hero/marin-headlands/day.png`,
        remoteLoadFailed: true,
        fallbackLoadFailed: true,
      }),
    ).toBe("gradient");
  });
});
