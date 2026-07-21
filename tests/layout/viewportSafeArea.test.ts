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
    expect(source).toContain('pathname === "/" || pathname === "/map"');
    expect(source).not.toContain("pb-[34px]");
    expect(source).not.toContain("paddingBottom: 34");
  });

  it("avoids min-h-screen on full-bleed map hosts so 100vh cannot overflow the fixed viewport", () => {
    const source = readFileSync(
      join(process.cwd(), "components/map/BayAreaMap.tsx"),
      "utf8",
    );

    expect(source).toContain('isFullBleed ? "h-full min-h-full"');
    expect(source).not.toContain('isFullBleed ? "h-full min-h-screen"');
  });
});
