import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { buildApiPath, buildApiUrl } from "@/lib/api/client";
import { getKarlIntelligence } from "@/lib/api/intelligence";
import { getBestSunshine } from "@/lib/api/weather";

describe("buildApiPath", () => {
  it("builds /best-sunshine without query params", () => {
    expect(buildApiPath("/best-sunshine")).toBe("/best-sunshine");
  });

  it("builds /best-sunshine?lookahead=60", () => {
    expect(buildApiPath("/best-sunshine", { lookahead: 60 })).toBe(
      "/best-sunshine?lookahead=60",
    );
  });

  it("builds /karl-intelligence without query params", () => {
    expect(buildApiPath("/karl-intelligence")).toBe("/karl-intelligence");
  });

  it("builds /karl-intelligence?locationId=mill-valley", () => {
    expect(
      buildApiPath("/karl-intelligence", { locationId: "mill-valley" }),
    ).toBe("/karl-intelligence?locationId=mill-valley");
  });
});

describe("buildApiUrl", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:3000");
  });

  it("prefixes the configured API base URL", () => {
    expect(buildApiUrl("/karl-intelligence")).toBe(
      "http://localhost:3000/karl-intelligence",
    );
  });
});

describe("weather and intelligence API clients", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:3000");
    vi.restoreAllMocks();
  });

  it("getBestSunshine requests /best-sunshine", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => readFixture("best-sunshine.json"),
    });
    vi.stubGlobal("fetch", fetchMock);

    await getBestSunshine();

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/best-sunshine",
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: "application/json",
        }),
      }),
    );
  });

  it("getBestSunshine requests /best-sunshine?lookahead=60", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => readFixture("best-sunshine-lookahead.json"),
    });
    vi.stubGlobal("fetch", fetchMock);

    await getBestSunshine({ lookahead: 60 });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/best-sunshine?lookahead=60",
      expect.any(Object),
    );
  });

  it("getKarlIntelligence requests /karl-intelligence", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => readFixture("karl-intelligence.json"),
    });
    vi.stubGlobal("fetch", fetchMock);

    await getKarlIntelligence();

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/karl-intelligence",
      expect.any(Object),
    );
  });

  it("getKarlIntelligence requests /karl-intelligence?locationId=mill-valley", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => readFixture("karl-intelligence-mill-valley.json"),
    });
    vi.stubGlobal("fetch", fetchMock);

    await getKarlIntelligence({ locationId: "mill-valley" });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/karl-intelligence?locationId=mill-valley",
      expect.any(Object),
    );
  });
});

function readFixture(filename: string): unknown {
  return JSON.parse(
    readFileSync(join(process.cwd(), "tests/fixtures", filename), "utf8"),
  );
}
