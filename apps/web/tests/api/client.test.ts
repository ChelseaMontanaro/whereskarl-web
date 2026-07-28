import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  buildApiPath,
  createApiClient,
  getBestSunshine,
  getKarlIntelligence,
} from "@whereskarl/api-client";

describe("buildApiPath (web consumer)", () => {
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

describe("weather and intelligence API clients (web consumer)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("getBestSunshine requests /best-sunshine", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => readFixture("best-sunshine.json"),
    });

    await getBestSunshine({
      baseUrl: "http://localhost:3000",
      fetchImpl: fetchMock,
    });

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

    await getBestSunshine(
      { baseUrl: "http://localhost:3000", fetchImpl: fetchMock },
      { lookahead: 60 },
    );

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

    await getKarlIntelligence({
      baseUrl: "http://localhost:3000",
      fetchImpl: fetchMock,
    });

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

    await getKarlIntelligence(
      { baseUrl: "http://localhost:3000", fetchImpl: fetchMock },
      { locationId: "mill-valley" },
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/karl-intelligence?locationId=mill-valley",
      expect.any(Object),
    );
  });

  it("createApiClient prefixes the configured API base URL", () => {
    const api = createApiClient({
      getBaseUrl: () => "http://localhost:3000",
    });
    expect(api.buildApiUrl("/karl-intelligence")).toBe(
      "http://localhost:3000/karl-intelligence",
    );
  });
});

function readFixture(filename: string): unknown {
  return JSON.parse(
    readFileSync(join(process.cwd(), "tests/fixtures", filename), "utf8"),
  );
}
