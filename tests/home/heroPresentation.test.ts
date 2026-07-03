import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
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
    expect(presentation.altText).toBeTruthy();
    expect(selectHeroImageSource({
      imageUrl: presentation.imageUrl,
      remoteLoadFailed: false,
    })).toBe("remote");
  });

  it("falls back visually when imageUrl is missing or remote load fails", () => {
    const fixture = karlIntelligenceResponseSchema.parse(
      JSON.parse(
        readFileSync(join(FIXTURES_DIR, "karl-intelligence.json"), "utf8"),
      ),
    );

    const presentation = resolveHeroPresentation(fixture.heroImagery);

    expect(presentation.imageUrl).toBeNull();
    expect(
      selectHeroImageSource({
        imageUrl: presentation.imageUrl,
        remoteLoadFailed: false,
      }),
    ).toBe("fallback");
    expect(
      selectHeroImageSource({
        imageUrl: "https://cdn.example.com/assets/hero/mill-valley/day.png",
        remoteLoadFailed: true,
      }),
    ).toBe("fallback");
  });
});
