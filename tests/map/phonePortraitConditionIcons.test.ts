import { describe, expect, it } from "vitest";

import {
  getPhonePortraitFogRailConditionIconDataUri,
  getPhonePortraitMarkerIconMarkup,
} from "@/lib/map/phonePortraitConditionIcons";

// The cloud shapes in the detailed clear artwork use these light-blue rect
// fills; the cloud-free sun/moon icons never include them.
const CLOUD_FILL = "#E4EEF7";
const SUN_FILL = "#F2A326";
const MOON_FILL = "#9FC4E6";

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

  it("leaves light fog, foggy, and Karl Territory markers unchanged", () => {
    const lightFog = getPhonePortraitMarkerIconMarkup("lightFog");
    const foggy = getPhonePortraitMarkerIconMarkup("foggy");
    const karlTerritory = getPhonePortraitMarkerIconMarkup("karlTerritory");

    // Detailed fog artwork keeps its layered cloud fills.
    expect(lightFog).toContain("#C6CFD8");
    expect(foggy).toContain("#AAB5C1");
    expect(karlTerritory).toContain("#8F9BA9");
    for (const markup of [lightFog, foggy, karlTerritory]) {
      expect(markup).toContain("karl-universal-map-marker__svg");
    }
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
