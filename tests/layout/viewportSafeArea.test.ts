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
    // Do not disable user zoom as an iOS input auto-zoom workaround.
    expect(source).not.toContain("maximumScale");
    expect(source).not.toContain("userScalable");
  });

  it("documents and locks phone portrait search input at 16px against iOS WebKit auto-zoom", () => {
    const source = readFileSync(
      join(process.cwd(), "components/map/MapPhonePortraitControls.tsx"),
      "utf8",
    );

    const inputBlock = source.match(
      /type="search"[\s\S]*?className="([^"]+)"/,
    );
    const className = inputBlock?.[1] ?? "";
    const arbitraryFontTokens = [
      ...className.matchAll(/\btext-\[([^\]]+)\]/g),
    ].map((match) => match[1]);

    expect(arbitraryFontTokens).toEqual(["16px"]);
    expect(className.split(/\s+/)).toContain("text-[16px]");
    expect(className).not.toMatch(/\btext-(xs|sm)\b/);
    expect(className).not.toContain("text-[0.9375rem]");

    // Architectural comment must stay with the input so the 16px floor is not
    // treated as a magic number during future UI polish.
    expect(source).toContain(
      "iOS WebKit auto-zooms focused form controls below 16px",
    );
    expect(source).toContain("Chrome on iOS both use WebKit");
    expect(source).toContain("That auto-zoom changes the visual");
    expect(source).toContain("viewport so fixed-position UI");
    expect(source).toContain("not an AppShell or BottomSheet bug");
    expect(source).toContain(
      "do not shrink the actual input font below 16px",
    );
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
