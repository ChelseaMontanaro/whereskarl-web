import { describe, expect, it } from "vitest";

import { formatConfidenceLabel } from "./confidence";

describe("formatConfidenceLabel", () => {
  it("returns trimmed confidence labels", () => {
    expect(formatConfidenceLabel("  High  ")).toBe("High");
  });

  it("suppresses empty and Unavailable labels", () => {
    expect(formatConfidenceLabel(null)).toBeNull();
    expect(formatConfidenceLabel(undefined)).toBeNull();
    expect(formatConfidenceLabel("")).toBeNull();
    expect(formatConfidenceLabel("   ")).toBeNull();
    expect(formatConfidenceLabel("Unavailable")).toBeNull();
    expect(formatConfidenceLabel("unavailable")).toBeNull();
    expect(formatConfidenceLabel(" UNAVAILABLE ")).toBeNull();
  });
});
