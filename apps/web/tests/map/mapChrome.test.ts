import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  DESKTOP_MAP_LAYERS_CLASS,
  DESKTOP_MAP_TOP_LEFT_CLASS,
  MAP_REGION_CHIP_BASE_CLASS,
  PHONE_MAP_BOTTOM_NAV_CLEARANCE_REM,
  PHONE_MAP_CONTROL_CLUSTER_TOP_CLASS,
  PHONE_MAP_SHEET_BOTTOM_CLASS,
  PHONE_MAP_SHEET_CONTAINER_CLASS,
  PHONE_MAP_SHEET_SURFACE_CLASS,
  PHONE_MAP_TOP_CHROME_CLASS,
  TABLET_MAP_BOTTOM_STACK_CLASS,
  mapRegionChipClassName,
  shouldShowMapTopChrome,
} from "@/lib/map/mapChrome";

describe("mapChrome", () => {
  it("exports a shared phone bottom-nav clearance used by sheets", () => {
    expect(PHONE_MAP_BOTTOM_NAV_CLEARANCE_REM).toBe(4.75);
    expect(PHONE_MAP_SHEET_BOTTOM_CLASS).toBe(
      "bottom-[calc(4.75rem+env(safe-area-inset-bottom))]",
    );
    expect(TABLET_MAP_BOTTOM_STACK_CLASS).toContain("5.5rem");
  });

  it("keeps phone attribution CSS clearance in sync with the shared rem", () => {
    const css = readFileSync(
      join(process.cwd(), "components/map/phone-portrait-map.web.css"),
      "utf8",
    );

    expect(css).toContain(
      `bottom: calc(${PHONE_MAP_BOTTOM_NAV_CLEARANCE_REM}rem + env(safe-area-inset-bottom, 0px)`,
    );
  });

  it("gives region chips a 40px touch floor", () => {
    expect(MAP_REGION_CHIP_BASE_CLASS).toContain("min-h-10");
    expect(MAP_REGION_CHIP_BASE_CLASS).toContain("px-3");
  });

  it("locks phone top chrome and control-cluster offsets", () => {
    expect(PHONE_MAP_TOP_CHROME_CLASS).toContain(
      "top-[calc(1.375rem+env(safe-area-inset-top))]",
    );
    expect(PHONE_MAP_CONTROL_CLUSTER_TOP_CLASS).toBe(
      "top-[calc(7.75rem+env(safe-area-inset-top))]",
    );
  });

  it("shares one phone sheet glass surface across BottomSheet and Layers", () => {
    expect(PHONE_MAP_SHEET_SURFACE_CLASS).toContain("max-w-[26rem]");
    expect(PHONE_MAP_SHEET_SURFACE_CLASS).toContain("backdrop-blur-xl");
    expect(PHONE_MAP_SHEET_CONTAINER_CLASS).toContain(PHONE_MAP_SHEET_BOTTOM_CLASS);
    expect(PHONE_MAP_SHEET_CONTAINER_CLASS).toContain(PHONE_MAP_SHEET_SURFACE_CLASS);
  });

  it("aligns desktop layers with the desktop top-left inset", () => {
    expect(DESKTOP_MAP_TOP_LEFT_CLASS).toContain("left-6");
    expect(DESKTOP_MAP_TOP_LEFT_CLASS).toContain("top-[5.5rem]");
    expect(DESKTOP_MAP_LAYERS_CLASS).toContain("right-6");
    expect(DESKTOP_MAP_LAYERS_CLASS).toContain("top-[5.5rem]");
  });

  it("keeps phone and panel chip selected languages distinct", () => {
    expect(mapRegionChipClassName("phone", true)).toContain("bg-karl-gold");
    expect(mapRegionChipClassName("panel", true)).toContain("bg-karl-gold/14");
  });

  it("hides tablet top chrome only while layers are open", () => {
    expect(shouldShowMapTopChrome("phone", true)).toBe(true);
    expect(shouldShowMapTopChrome("desktop", true)).toBe(true);
    expect(shouldShowMapTopChrome("tablet", true)).toBe(false);
    expect(shouldShowMapTopChrome("tablet", false)).toBe(true);
  });
});
