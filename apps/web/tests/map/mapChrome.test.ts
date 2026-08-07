import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  MAP_REGION_CHIP_BASE_CLASS,
  PHONE_MAP_BOTTOM_NAV_CLEARANCE_REM,
  PHONE_MAP_SHEET_BOTTOM_CLASS,
  TABLET_MAP_BOTTOM_STACK_CLASS,
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
});
