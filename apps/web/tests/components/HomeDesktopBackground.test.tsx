// @vitest-environment happy-dom

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { HomeDesktopBackground } from "@/components/home/HomeDesktopBackground";
import { resolveHeroPresentation } from "@/lib/home/heroPresentation";
import { karlIntelligenceResponseSchema } from "@/lib/schemas/intelligence";

describe("HomeDesktopBackground", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders a fixed full-page background layer across breakpoints", () => {
    const fixture = karlIntelligenceResponseSchema.parse(
      JSON.parse(
        readFileSync(
          join(process.cwd(), "tests/fixtures/karl-intelligence-mill-valley.json"),
          "utf8",
        ),
      ),
    );
    const presentation = resolveHeroPresentation(fixture.heroImagery);

    const { container } = render(
      <HomeDesktopBackground presentation={presentation} />,
    );

    const layer = container.firstElementChild;
    expect(layer).toHaveClass("fixed", "inset-0", "z-0");
    expect(layer).not.toHaveClass("hidden");
  });

  it("renders the hero image from presentation", () => {
    const fixture = karlIntelligenceResponseSchema.parse(
      JSON.parse(
        readFileSync(
          join(process.cwd(), "tests/fixtures/karl-intelligence-mill-valley.json"),
          "utf8",
        ),
      ),
    );
    const presentation = resolveHeroPresentation(fixture.heroImagery);

    const { container } = render(
      <HomeDesktopBackground presentation={presentation} />,
    );

    const image = container.querySelector("img");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", presentation.imageUrl);
    expect(image).toHaveAttribute("alt", "");
  });
});
