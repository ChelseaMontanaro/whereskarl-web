// @vitest-environment happy-dom

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { HomeDesktopBackground } from "@/components/home/HomeDesktopBackground";
import { resolveHeroPresentation } from "@/lib/home/heroPresentation";
import { karlIntelligenceResponseSchema } from "@/lib/schemas/intelligence";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("HomeDesktopBackground", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders a fixed full-page desktop background layer", () => {
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
    expect(layer).toHaveClass("fixed", "inset-0", "hidden", "lg:block");
  });
});
