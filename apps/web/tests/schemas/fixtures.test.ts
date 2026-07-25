import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { healthResponseSchema } from "@/lib/schemas/health";
import { karlIntelligenceResponseSchema } from "@/lib/schemas/intelligence";
import {
  bestSunshineResponseSchema,
  currentResponseSchema,
  locationsResponseSchema,
} from "@/lib/schemas/weather";

const FIXTURES_DIR = join(process.cwd(), "tests/fixtures");

function readFixture<T = unknown>(filename: string): T {
  return JSON.parse(readFileSync(join(FIXTURES_DIR, filename), "utf8")) as T;
}

describe("API response fixtures", () => {
  it("validates health.json", () => {
    const result = healthResponseSchema.safeParse(readFixture("health.json"));
    expect(result.success).toBe(true);
  });

  it("validates current.json", () => {
    const result = currentResponseSchema.safeParse(readFixture("current.json"));
    expect(result.success).toBe(true);
  });

  it("validates locations.json", () => {
    const result = locationsResponseSchema.safeParse(readFixture("locations.json"));
    expect(result.success).toBe(true);
  });

  it("validates best-sunshine.json", () => {
    const result = bestSunshineResponseSchema.safeParse(
      readFixture("best-sunshine.json"),
    );
    expect(result.success).toBe(true);
  });

  it("validates best-sunshine-lookahead.json", () => {
    const result = bestSunshineResponseSchema.safeParse(
      readFixture("best-sunshine-lookahead.json"),
    );
    expect(result.success).toBe(true);
  });

  it("validates karl-intelligence.json", () => {
    const result = karlIntelligenceResponseSchema.safeParse(
      readFixture("karl-intelligence.json"),
    );
    expect(result.success).toBe(true);
  });

  it("validates karl-intelligence-mill-valley.json", () => {
    const result = karlIntelligenceResponseSchema.safeParse(
      readFixture("karl-intelligence-mill-valley.json"),
    );
    expect(result.success).toBe(true);
  });
});
