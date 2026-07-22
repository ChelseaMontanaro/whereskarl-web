import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("root viewport safe-area activation", () => {
  it("exports viewport-fit=cover so phone map safe-area insets resolve", () => {
    const source = readFileSync(
      join(process.cwd(), "app/layout.tsx"),
      "utf8",
    );

    expect(source).toContain("viewportFit: \"cover\"");
    expect(source).toContain("export const viewport");
  });

  it("keeps the approved phone-portrait search header top locked to safe-area", () => {
    const source = readFileSync(
      join(process.cwd(), "components/map/MapView.tsx"),
      "utf8",
    );

    expect(source).toContain(
      "top-[calc(1.375rem+env(safe-area-inset-top))]",
    );
  });

  it("keeps bottom nav on canonical bottom safe-area padding without device offsets", () => {
    const source = readFileSync(
      join(process.cwd(), "components/layout/AppShell.tsx"),
      "utf8",
    );

    expect(source).toContain(
      "pb-[max(env(safe-area-inset-bottom,0px),0.5rem)]",
    );
    expect(source).not.toContain("pb-[34px]");
    expect(source).not.toContain("paddingBottom: 34");
  });

  it("keeps phone /map on min-h-screen while suppressing in-flow footers that clip fixed chrome", () => {
    const source = readFileSync(
      join(process.cwd(), "components/layout/AppShell.tsx"),
      "utf8",
    );

    // Home still owns the no-min-h-screen immersive shell.
    expect(source).toContain('pathname === "/" && isPhonePortrait');
    // Phone map suppresses footers without re-applying the 17ae4a3 shell trim.
    expect(source).toContain('pathname === "/map" && isPhonePortrait');
    expect(source).toContain("hideInFlowChrome");
    expect(source).not.toContain(
      'isPhonePortrait && (pathname === "/" || pathname === "/map")',
    );
  });

  it("keeps full-bleed map hosts on min-h-screen for the known-good phone viewport model", () => {
    const source = readFileSync(
      join(process.cwd(), "components/map/BayAreaMap.tsx"),
      "utf8",
    );

    expect(source).toContain('isFullBleed ? "h-full min-h-screen"');
    expect(source).not.toContain('isFullBleed ? "h-full min-h-full"');
  });

  it("locks the combined phone map top and bottom safe-area control model", () => {
    const mapView = readFileSync(
      join(process.cwd(), "components/map/MapView.tsx"),
      "utf8",
    );
    const appShell = readFileSync(
      join(process.cwd(), "components/layout/AppShell.tsx"),
      "utf8",
    );
    const searchControls = readFileSync(
      join(process.cwd(), "components/map/MapPhonePortraitControls.tsx"),
      "utf8",
    );
    const mapPage = readFileSync(join(process.cwd(), "app/map/page.tsx"), "utf8");

    expect(mapView).toContain(
      "top-[calc(1.375rem+env(safe-area-inset-top))]",
    );
    expect(appShell).toContain(
      "pb-[max(env(safe-area-inset-bottom,0px),0.5rem)]",
    );
    expect(searchControls).toContain("mx-1");
    expect(mapView).toContain(
      "top-[calc(7.125rem+env(safe-area-inset-top))]",
    );
    expect(mapView).toContain("restorePhoneMapChrome()");
    expect(mapView).toContain("key={selectedLocation.id}");
    expect(mapPage).toContain("data-karl-phone-map-root");
  });
});
