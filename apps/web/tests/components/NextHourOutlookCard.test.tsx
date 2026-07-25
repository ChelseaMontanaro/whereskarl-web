// @vitest-environment happy-dom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { NextHourOutlookCard } from "@/components/home/NextHourOutlookCard";
import {
  insightPlainIconAccentClass,
  insightPlainIconLightClass,
} from "@/components/home/desktopGlass";

describe("NextHourOutlookCard", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders a clock icon on desktop and mobile layouts", () => {
    const { container: desktop } = render(
      <NextHourOutlookCard
        summary="Fog should lift near the coast by 6:20 PM."
        confidenceLabel="Medium"
        isLoading={false}
        layout="desktop"
      />,
    );

    const { container: mobile } = render(
      <NextHourOutlookCard
        summary="Fog should lift near the coast by 6:20 PM."
        confidenceLabel="Medium"
        isLoading={false}
        layout="mobile"
      />,
    );

    expect(desktop.querySelector("circle[cx='12'][cy='12']")).toBeTruthy();
    expect(mobile.querySelector("circle[cx='12'][cy='12']")).toBeTruthy();
    expect(screen.getAllByText("Future Outlook").length).toBeGreaterThanOrEqual(2);
  });

  it("does not render a circular icon wrapper for Future Outlook", () => {
    const { container } = render(
      <NextHourOutlookCard
        summary="Fog should lift near the coast by 6:20 PM."
        confidenceLabel="Medium"
        isLoading={false}
        layout="mobile"
      />,
    );

    const iconWrapper = container.querySelector('[data-testid="insight-plain-icon"]');
    expect(iconWrapper).toBeTruthy();
    expect(iconWrapper?.className).not.toContain("rounded-full");
    expect(iconWrapper?.className).not.toContain("border");
  });

  it("uses a white icon on mobile and the gold accent on desktop", () => {
    const { container: mobile } = render(
      <NextHourOutlookCard
        summary="Fog should lift near the coast by 6:20 PM."
        confidenceLabel="Medium"
        isLoading={false}
        layout="mobile"
      />,
    );

    const { container: desktop } = render(
      <NextHourOutlookCard
        summary="Fog should lift near the coast by 6:20 PM."
        confidenceLabel="Medium"
        isLoading={false}
        layout="desktop"
      />,
    );

    const mobileIconWrapper = mobile.querySelector('[data-testid="insight-plain-icon"]');
    const desktopIconWrapper = desktop.querySelector('[data-testid="insight-plain-icon"]');

    expect(mobileIconWrapper?.className).toContain(insightPlainIconLightClass);
    expect(mobileIconWrapper?.className).not.toContain(insightPlainIconAccentClass);
    expect(desktopIconWrapper?.className).toContain(insightPlainIconAccentClass);
  });
});
