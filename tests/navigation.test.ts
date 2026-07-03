import { describe, expect, it } from "vitest";

import {
  isPrimaryNavActive,
  isSecondaryNavActive,
  primaryNavItems,
} from "@/lib/navigation";

describe("navigation helpers", () => {
  it("marks home only on the root path", () => {
    expect(isPrimaryNavActive("/", "/")).toBe(true);
    expect(isPrimaryNavActive("/map", "/")).toBe(false);
  });

  it("marks nested product routes as active", () => {
    expect(isPrimaryNavActive("/map", "/map")).toBe(true);
    expect(isPrimaryNavActive("/favorites/extra", "/favorites")).toBe(true);
  });

  it("marks secondary routes as active", () => {
    expect(isSecondaryNavActive("/privacy", "/privacy")).toBe(true);
    expect(isSecondaryNavActive("/support", "/privacy")).toBe(false);
  });

  it("defines the four primary product tabs", () => {
    expect(primaryNavItems.map((item) => item.label)).toEqual([
      "Home",
      "Map",
      "Favorites",
      "Settings",
    ]);
  });
});
