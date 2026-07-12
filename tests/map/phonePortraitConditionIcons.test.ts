import { describe, expect, it } from "vitest";

import { KARL_LOGO_SRC } from "@/lib/brand/karlLogo";
import {
  getPhonePortraitFogRailConditionIconDataUri,
  getPhonePortraitMarkerIconMarkup,
} from "@/lib/map/phonePortraitConditionIcons";

// The cloud shapes in the detailed clear artwork use these light-blue rect
// fills; the cloud-free sun/moon icons never include them.
const CLOUD_FILL = "#E4EEF7";
const SUN_FILL = "#F2A326";
const MOON_FILL = "#9FC4E6";
// Fill from the retired Karl Territory fog-cloud artwork.
const KARL_FOG_CLOUD_FILL = "#8F9BA9";

describe("getPhonePortraitMarkerIconMarkup — Clear markers", () => {
  it("renders a sun-only icon (no cloud) for clear daytime", () => {
    const markup = getPhonePortraitMarkerIconMarkup("clear", {
      isNighttime: false,
    });

    expect(markup).toContain(SUN_FILL);
    expect(markup).not.toContain(CLOUD_FILL);
    expect(markup).not.toContain(MOON_FILL);
    expect(markup).toContain("karl-universal-map-marker__svg");
  });

  it("renders a moon-only icon (no cloud) for clear nighttime", () => {
    const markup = getPhonePortraitMarkerIconMarkup("clear", {
      isNighttime: true,
    });

    expect(markup).toContain(MOON_FILL);
    expect(markup).not.toContain(CLOUD_FILL);
    expect(markup).not.toContain(SUN_FILL);
    expect(markup).toContain("karl-universal-map-marker__svg");
  });

  it("leaves light fog and foggy markers on their detailed fog artwork", () => {
    const lightFog = getPhonePortraitMarkerIconMarkup("lightFog");
    const foggy = getPhonePortraitMarkerIconMarkup("foggy");

    // Detailed fog artwork keeps its layered cloud fills.
    expect(lightFog).toContain("#C6CFD8");
    expect(foggy).toContain("#AAB5C1");
    for (const markup of [lightFog, foggy]) {
      expect(markup).toContain("karl-universal-map-marker__svg");
      // The retired Karl fog-cloud artwork must not leak into other states.
      expect(markup).not.toContain(KARL_LOGO_SRC);
    }
  });
});

describe("getPhonePortraitMarkerIconMarkup — Karl Territory markers", () => {
  it("renders the approved Where's Karl logo, not a fog cloud", () => {
    const markup = getPhonePortraitMarkerIconMarkup("karlTerritory");

    expect(markup).toContain(KARL_LOGO_SRC);
    expect(markup).toContain("<img");
    // No trace of the retired fog-cloud artwork.
    expect(markup).not.toContain(KARL_FOG_CLOUD_FILL);
    expect(markup).not.toContain("<svg");
    // Sized via the shared marker class so dimensions stay unchanged.
    expect(markup).toContain("karl-universal-map-marker__svg");
  });

  it("uses the same canonical logo source day and night", () => {
    const day = getPhonePortraitMarkerIconMarkup("karlTerritory", {
      isNighttime: false,
    });
    const night = getPhonePortraitMarkerIconMarkup("karlTerritory", {
      isNighttime: true,
    });

    expect(day).toBe(night);
    expect(day).toContain(KARL_LOGO_SRC);
  });
});

describe("getPhonePortraitFogRailConditionIconDataUri — Clear rail icon", () => {
  it("still resolves to the cloud-free sun/moon artwork", () => {
    const day = decodeURIComponent(
      getPhonePortraitFogRailConditionIconDataUri("clear", {
        isNighttime: false,
      }),
    );
    const night = decodeURIComponent(
      getPhonePortraitFogRailConditionIconDataUri("clear", {
        isNighttime: true,
      }),
    );

    expect(day).toContain(SUN_FILL);
    expect(day).not.toContain(CLOUD_FILL);
    expect(night).toContain(MOON_FILL);
    expect(night).not.toContain(CLOUD_FILL);
  });
});
