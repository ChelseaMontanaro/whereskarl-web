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
});
