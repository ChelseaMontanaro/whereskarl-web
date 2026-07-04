import { describe, expect, it } from "vitest";

import {
  formatNextHourTimeCopy,
  formatPacific12HourClockTime,
} from "@/lib/home/timeFormat";
import { nextHourOutlookSummary } from "@/lib/home/weatherDisplay";

describe("formatPacific12HourClockTime", () => {
  it("formats 24-hour clock times as US Pacific 12-hour copy", () => {
    expect(formatPacific12HourClockTime("18:20")).toBe("6:20 PM");
    expect(formatPacific12HourClockTime("6:05")).toBe("6:05 AM");
    expect(formatPacific12HourClockTime("00:15")).toBe("12:15 AM");
    expect(formatPacific12HourClockTime("12:00")).toBe("12:00 PM");
  });
});

describe("formatNextHourTimeCopy", () => {
  it("rewrites embedded 24-hour times inside longer copy", () => {
    expect(
      formatNextHourTimeCopy("Fog should lift near the coast by 18:20."),
    ).toBe("Fog should lift near the coast by 6:20 PM.");
  });
});

describe("nextHourOutlookSummary", () => {
  it("formats burn-off and prediction reason times for display", () => {
    expect(
      nextHourOutlookSummary({
        trend: "clearing",
        burnOffEstimateLocal: "18:20",
        predictionConfidenceLabel: "Medium",
      }),
    ).toBe("Clearing up · Burn-off around 6:20 PM");

    expect(
      nextHourOutlookSummary({
        trend: "holding",
        predictionReason: "Marine layer may linger until 19:45.",
        predictionConfidenceLabel: "Medium",
      }),
    ).toBe("Holding steady · Marine layer may linger until 7:45 PM.");
  });
});
