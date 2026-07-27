import { describe, expect, it } from "vitest";

import {
  INTELLIGENCE_STALE_TIME_MS,
  MAP_LOCATION_ALIAS_QUERY_PARAM,
  MAP_LOCATION_QUERY_PARAM,
  MAP_REGION_QUERY_PARAM,
  PRODUCTION_API_BASE_URL,
  WEATHER_STALE_TIME_MS,
} from "./index";

describe("@whereskarl/config", () => {
  it("exposes the exact production API base URL", () => {
    expect(PRODUCTION_API_BASE_URL).toBe("https://api.whereskarl.live");
    expect(PRODUCTION_API_BASE_URL).not.toContain("localhost");
  });

  it("exposes stale-time defaults in milliseconds", () => {
    expect(WEATHER_STALE_TIME_MS).toBe(600_000);
    expect(WEATHER_STALE_TIME_MS).toBe(10 * 60 * 1000);
    expect(INTELLIGENCE_STALE_TIME_MS).toBe(0);
  });

  it("exposes exact map query param names", () => {
    expect(MAP_LOCATION_QUERY_PARAM).toBe("location");
    expect(MAP_LOCATION_ALIAS_QUERY_PARAM).toBe("selected");
    expect(MAP_REGION_QUERY_PARAM).toBe("region");
  });

  it("formats map query fragments with the shared param names", () => {
    expect(`/map?${MAP_LOCATION_QUERY_PARAM}=tiburon`).toBe(
      "/map?location=tiburon",
    );
    expect(`/map?${MAP_LOCATION_ALIAS_QUERY_PARAM}=tiburon`).toBe(
      "/map?selected=tiburon",
    );
    expect(`/map?${MAP_REGION_QUERY_PARAM}=san-francisco`).toBe(
      "/map?region=san-francisco",
    );
  });
});
