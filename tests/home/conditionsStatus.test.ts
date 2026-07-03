import { describe, expect, it } from "vitest";

import {
  conditionsStatusLabel,
  resolveConditionsPresentation,
} from "@/lib/home/conditionsStatus";

describe("resolveConditionsPresentation", () => {
  it("returns loading before weather has loaded", () => {
    expect(
      resolveConditionsPresentation({
        isLoading: true,
        hasLoadedWeather: false,
        loadedFromLastKnown: false,
      }),
    ).toBe("loading");
  });

  it("returns live for backend live source", () => {
    expect(
      resolveConditionsPresentation({
        isLoading: false,
        hasLoadedWeather: true,
        loadedFromLastKnown: false,
        currentSource: "live",
      }),
    ).toBe("live");
  });

  it("returns estimated for mock source", () => {
    expect(
      resolveConditionsPresentation({
        isLoading: false,
        hasLoadedWeather: true,
        loadedFromLastKnown: false,
        currentSource: "mock",
      }),
    ).toBe("estimated");
  });

  it("returns saved when restored from last-known data", () => {
    expect(
      resolveConditionsPresentation({
        isLoading: false,
        hasLoadedWeather: true,
        loadedFromLastKnown: true,
        currentSource: "live",
      }),
    ).toBe("cached");
  });
});

describe("conditionsStatusLabel", () => {
  it("maps presentations to iOS-aligned labels", () => {
    expect(conditionsStatusLabel("live")).toBe("Live conditions");
    expect(conditionsStatusLabel("estimated")).toBe("Estimated conditions");
    expect(conditionsStatusLabel("cached")).toBe("Saved conditions");
    expect(conditionsStatusLabel("unavailable")).toBe("Conditions unavailable");
  });
});
