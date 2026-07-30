import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  ApiError,
  apiFetch,
  buildApiPath,
  buildApiUrl,
  createApiClient,
  getBestSunshine,
  getCurrent,
  getHealth,
  getKarlIntelligence,
  getLocations,
  resolveBaseUrl,
} from "./index";

const BASE_URL = "http://localhost:3000";
const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), "fixtures");

function readFixture(filename: string): unknown {
  return JSON.parse(readFileSync(join(fixturesDir, filename), "utf8"));
}

function jsonResponse(body: unknown, init?: { ok?: boolean; status?: number }) {
  const ok = init?.ok ?? true;
  const status = init?.status ?? (ok ? 200 : 500);
  return {
    ok,
    status,
    json: async () => body,
  };
}

describe("buildApiPath", () => {
  it("builds /best-sunshine without query params", () => {
    expect(buildApiPath("/best-sunshine")).toBe("/best-sunshine");
  });

  it("normalizes paths without a leading slash", () => {
    expect(buildApiPath("health")).toBe("/health");
  });

  it("builds /best-sunshine?lookahead=60", () => {
    expect(buildApiPath("/best-sunshine", { lookahead: 60 })).toBe(
      "/best-sunshine?lookahead=60",
    );
  });

  it("omits undefined, null, and empty-string params", () => {
    expect(
      buildApiPath("/karl-intelligence", {
        locationId: undefined,
        empty: null,
        blank: "",
        keep: "mill-valley",
      }),
    ).toBe("/karl-intelligence?keep=mill-valley");
  });

  it("preserves zero and false query values", () => {
    expect(buildApiPath("/example", { count: 0, enabled: false })).toBe(
      "/example?count=0&enabled=false",
    );
  });

  it("builds /karl-intelligence?locationId=mill-valley", () => {
    expect(
      buildApiPath("/karl-intelligence", { locationId: "mill-valley" }),
    ).toBe("/karl-intelligence?locationId=mill-valley");
  });
});

describe("buildApiUrl and resolveBaseUrl", () => {
  it("prefixes the provided base URL without altering slash behavior", () => {
    expect(buildApiUrl(BASE_URL, "/karl-intelligence")).toBe(
      "http://localhost:3000/karl-intelligence",
    );
  });

  it("does not insert a slash between base URL and path", () => {
    expect(buildApiUrl("http://localhost:3000/", "current")).toBe(
      "http://localhost:3000//current",
    );
  });

  it("resolves baseUrl or getBaseUrl", () => {
    expect(resolveBaseUrl({ baseUrl: BASE_URL })).toBe(BASE_URL);
    expect(resolveBaseUrl({ getBaseUrl: () => BASE_URL })).toBe(BASE_URL);
    expect(() => resolveBaseUrl({})).toThrow(
      /ApiClientConfig requires baseUrl or getBaseUrl/,
    );
  });
});

describe("apiFetch", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("sends Accept: application/json and forwards request options", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ ok: true }));
    const signal = AbortSignal.abort();

    await apiFetch(
      { baseUrl: BASE_URL, fetchImpl },
      "/health",
      { method: "GET", signal, headers: { "X-Test": "1" } },
    );

    expect(fetchImpl).toHaveBeenCalledWith("http://localhost:3000/health", {
      method: "GET",
      signal,
      headers: {
        Accept: "application/json",
        "X-Test": "1",
      },
    });
  });

  it("throws ApiError with status on non-2xx responses", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(jsonResponse({ error: "nope" }, { ok: false, status: 503 }));
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(
      apiFetch({ baseUrl: BASE_URL, fetchImpl }, "/health"),
    ).rejects.toMatchObject({
      name: "ApiError",
      message: "API request failed with status 503",
      status: 503,
    });

    expect(errorSpy).toHaveBeenCalledWith(
      "[Where's Karl API] http://localhost:3000/health failed with status 503",
    );
  });

  it("logs and rethrows network rejections", async () => {
    const networkError = new Error("network down");
    const fetchImpl = vi.fn().mockRejectedValue(networkError);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(
      apiFetch({ baseUrl: BASE_URL, fetchImpl }, "/current"),
    ).rejects.toBe(networkError);

    expect(errorSpy).toHaveBeenCalledWith(
      "[Where's Karl API] http://localhost:3000/current request failed",
      networkError,
    );
  });

  it("does not wrap ApiError in the catch logger path", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(jsonResponse({}, { ok: false, status: 404 }));
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(
      apiFetch({ baseUrl: BASE_URL, fetchImpl }, "/missing"),
    ).rejects.toBeInstanceOf(ApiError);

    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy.mock.calls[0]?.[0]).toContain("failed with status 404");
  });
});

describe("endpoint functions", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("getHealth requests /health and parses with schema.parse", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(jsonResponse(readFixture("health.json")));
    const result = await getHealth({ baseUrl: BASE_URL, fetchImpl });
    expect(fetchImpl).toHaveBeenCalledWith(
      "http://localhost:3000/health",
      expect.objectContaining({
        headers: expect.objectContaining({ Accept: "application/json" }),
      }),
    );
    expect(result.status).toBe("ok");
  });

  it("getCurrent requests /current", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(jsonResponse(readFixture("current.json")));
    await getCurrent({ baseUrl: BASE_URL, fetchImpl });
    expect(fetchImpl).toHaveBeenCalledWith(
      "http://localhost:3000/current",
      expect.any(Object),
    );
  });

  it("getLocations requests /locations", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(jsonResponse(readFixture("locations.json")));
    await getLocations({ baseUrl: BASE_URL, fetchImpl });
    expect(fetchImpl).toHaveBeenCalledWith(
      "http://localhost:3000/locations",
      expect.any(Object),
    );
  });

  it("getBestSunshine requests /best-sunshine without lookahead by default", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(jsonResponse(readFixture("best-sunshine.json")));
    await getBestSunshine({ baseUrl: BASE_URL, fetchImpl });
    expect(fetchImpl).toHaveBeenCalledWith(
      "http://localhost:3000/best-sunshine",
      expect.any(Object),
    );
  });

  it("getBestSunshine requests /best-sunshine?lookahead=60 only for lookahead 60", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(jsonResponse(readFixture("best-sunshine-lookahead.json")));
    await getBestSunshine({ baseUrl: BASE_URL, fetchImpl }, { lookahead: 60 });
    expect(fetchImpl).toHaveBeenCalledWith(
      "http://localhost:3000/best-sunshine?lookahead=60",
      expect.any(Object),
    );
  });

  it("getKarlIntelligence requests /karl-intelligence", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(jsonResponse(readFixture("karl-intelligence.json")));
    await getKarlIntelligence({ baseUrl: BASE_URL, fetchImpl });
    expect(fetchImpl).toHaveBeenCalledWith(
      "http://localhost:3000/karl-intelligence",
      expect.any(Object),
    );
  });

  it("getKarlIntelligence requests /karl-intelligence?locationId=mill-valley", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(
        jsonResponse(readFixture("karl-intelligence-mill-valley.json")),
      );
    await getKarlIntelligence(
      { baseUrl: BASE_URL, fetchImpl },
      { locationId: "mill-valley" },
    );
    expect(fetchImpl).toHaveBeenCalledWith(
      "http://localhost:3000/karl-intelligence?locationId=mill-valley",
      expect.any(Object),
    );
  });

  it("rejects invalid schema payloads", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ status: "nope" }));
    await expect(getHealth({ baseUrl: BASE_URL, fetchImpl })).rejects.toThrow();
  });

  it("createApiClient binds getBaseUrl and delegates to endpoint exports", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(jsonResponse(readFixture("health.json")));
    const client = createApiClient({
      getBaseUrl: () => BASE_URL,
      fetchImpl,
    });

    expect(client.buildApiUrl("/health")).toBe("http://localhost:3000/health");
    await client.getHealth();
    expect(fetchImpl).toHaveBeenCalledWith(
      "http://localhost:3000/health",
      expect.any(Object),
    );
  });
});
