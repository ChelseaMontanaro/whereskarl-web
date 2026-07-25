import { describe, expect, it } from "vitest";

import { getMarkerIconMarkup } from "@/lib/map/markerIcons";

describe("getMarkerIconMarkup", () => {
  it("uses a sun icon for clear daytime conditions", () => {
    const markup = getMarkerIconMarkup("clear", { isNighttime: false });

    expect(markup).toContain("<circle");
    expect(markup).not.toContain("karl-map-marker__logo");
  });

  it("uses a moon icon for clear nighttime conditions", () => {
    const markup = getMarkerIconMarkup("clear", { isNighttime: true });

    expect(markup).toContain('fill="#8CB8D8"');
    expect(markup).not.toContain("<circle");
  });

  it("uses distinct icons for light fog, foggy, and Karl Territory", () => {
    const lightFog = getMarkerIconMarkup("lightFog");
    const foggy = getMarkerIconMarkup("foggy");
    const karlTerritory = getMarkerIconMarkup("karlTerritory");

    expect(lightFog).not.toContain("stroke=\"#93B8D8\"");
    expect(foggy).toContain("stroke=\"#93B8D8\"");
    expect(karlTerritory).toContain('class="karl-map-marker__logo"');
    expect(karlTerritory).toContain("/brand/wheres-karl-logo@2x.png");
  });
});
