// @vitest-environment happy-dom

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { KarlLogo } from "@/components/brand/KarlLogo";
import { KARL_LOGO_SRC } from "@/lib/brand/karlLogo";
import { getMarkerIconMarkup } from "@/lib/map/markerIcons";
import { getPhonePortraitMarkerIconMarkup } from "@/lib/map/phonePortraitConditionIcons";

afterEach(cleanup);

describe("Where's Karl logo — canonical shared source", () => {
  it("KarlLogo (used by the Fog Intensity rail) renders the canonical asset", () => {
    const { container } = render(<KarlLogo className="h-6 w-6" />);
    const img = container.querySelector("img");

    expect(img).not.toBeNull();
    // next/image rewrites/encodes the URL, but the canonical asset path must
    // still be present once decoded.
    expect(decodeURIComponent(img?.getAttribute("src") ?? "")).toContain(
      KARL_LOGO_SRC,
    );
  });

  it("desktop, phone-portrait, and rail Karl icons all derive from KARL_LOGO_SRC", () => {
    expect(getMarkerIconMarkup("karlTerritory")).toContain(KARL_LOGO_SRC);
    expect(getPhonePortraitMarkerIconMarkup("karlTerritory")).toContain(
      KARL_LOGO_SRC,
    );
  });
});
