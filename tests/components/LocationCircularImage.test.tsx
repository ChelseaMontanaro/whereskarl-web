// @vitest-environment happy-dom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  LocationCircularImage,
  objectPositionFromFocalPoint,
} from "@/components/location/LocationCircularImage";

afterEach(() => {
  cleanup();
});

describe("objectPositionFromFocalPoint", () => {
  it("derives CSS object-position from backend focal fractions", () => {
    expect(objectPositionFromFocalPoint({ x: 0.28, y: 0.38 })).toBe("28% 38%");
    expect(objectPositionFromFocalPoint({ x: 0.5, y: 0.52 })).toBe("50% 52%");
  });

  it("defaults to center when focalPoint is absent", () => {
    expect(objectPositionFromFocalPoint(null)).toBe("50% 50%");
    expect(objectPositionFromFocalPoint(undefined)).toBe("50% 50%");
  });
});

describe("LocationCircularImage", () => {
  it("renders the placeholder when imagery is absent", () => {
    render(<LocationCircularImage />);

    const placeholder = screen.getByTestId("location-image-placeholder");
    expect(placeholder).toHaveTextContent("Location Image");
    expect(placeholder).toHaveTextContent("Coming Soon");
    expect(placeholder.querySelector("img")).toBeNull();
    expect(placeholder.className).toContain("rounded-full");
    expect(placeholder.className).toContain("h-16");
    expect(placeholder.className).toContain("w-16");
  });

  it("renders the canonical hero URL when imagery exists", () => {
    const imageUrl =
      "https://cdn.example.com/assets/hero/redwood-city/day.png";

    render(
      <LocationCircularImage
        imageUrl={imageUrl}
        focalPoint={{ x: 0.5, y: 0.52 }}
        alt="Redwood City landmark"
      />,
    );

    const frame = screen.getByTestId("location-circular-image");
    const img = screen.getByTestId("location-circular-image-img");

    expect(img).toHaveAttribute("src", imageUrl);
    expect(img).toHaveAttribute("alt", "Redwood City landmark");
    expect(img.className).toContain("object-cover");
    expect(img).toHaveStyle({ objectPosition: "50% 52%" });
    expect(frame.className).toContain("rounded-full");
    expect(screen.queryByTestId("location-image-placeholder")).toBeNull();
  });

  it("falls back to the placeholder when the image fails to load", () => {
    render(
      <LocationCircularImage
        imageUrl="https://cdn.example.com/assets/hero/missing.png"
        focalPoint={{ x: 0.42, y: 0.52 }}
      />,
    );

    fireEvent.error(screen.getByTestId("location-circular-image-img"));

    const placeholder = screen.getByTestId("location-image-placeholder");
    expect(placeholder).toHaveTextContent("Coming Soon");
    expect(screen.queryByTestId("location-circular-image-img")).toBeNull();
  });

  it("does not embed a frontend image lookup table", () => {
    const source = readFileSync(
      join(
        process.cwd(),
        "components/location/LocationCircularImage.tsx",
      ),
      "utf8",
    );

    expect(source).not.toMatch(/IMAGE_BY_LOCATION|LOCATION_IMAGES|hero\/redwood-city/);
    expect(source).toContain("imageUrl");
    expect(source).toContain("focalPoint");
  });
});
