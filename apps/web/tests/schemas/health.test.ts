import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { healthResponseSchema } from "@/lib/schemas/health";

describe("healthResponseSchema", () => {
  it("validates the backend health fixture", () => {
    const fixturePath = join(process.cwd(), "tests/fixtures/health.json");
    const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));

    const result = healthResponseSchema.safeParse(fixture);

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.status).toBe("ok");
      expect(result.data.service).toBe("wheres-karl-api");
      expect(result.data.timestamp).toBe("2026-06-30T12:00:00.000Z");
    }
  });

  it("rejects malformed health payloads", () => {
    const result = healthResponseSchema.safeParse({
      status: "degraded",
      service: "wheres-karl-api",
      timestamp: "not-a-date",
    });

    expect(result.success).toBe(false);
  });
});
