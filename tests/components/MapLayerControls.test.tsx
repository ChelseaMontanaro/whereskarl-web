// @vitest-environment happy-dom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MapLayerControls } from "@/components/map/MapLayerControls";

describe("MapLayerControls", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders and toggles the fog layer without crashing", () => {
    const onFogLayerChange = vi.fn();

    render(
      <MapLayerControls
        mapStyle="standard"
        fogLayerEnabled
        onMapStyleChange={vi.fn()}
        onFogLayerChange={onFogLayerChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Map Layers" }));
    fireEvent.click(screen.getByRole("checkbox"));

    expect(onFogLayerChange).toHaveBeenCalledWith(false);
    expect(screen.getByText("Fog Layer")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Satellite" })).toBeInTheDocument();
  });

  it("changes the base map style safely", () => {
    const onMapStyleChange = vi.fn();

    render(
      <MapLayerControls
        mapStyle="standard"
        fogLayerEnabled
        onMapStyleChange={onMapStyleChange}
        onFogLayerChange={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Map Layers" }));
    fireEvent.click(screen.getByRole("button", { name: "Hybrid" }));

    expect(onMapStyleChange).toHaveBeenCalledWith("hybrid");
  });

  it("shows the desktop layers panel expanded by default", () => {
    render(
      <MapLayerControls
        layout="desktop"
        mapStyle="standard"
        fogLayerEnabled
        onMapStyleChange={vi.fn()}
        onFogLayerChange={vi.fn()}
      />,
    );

    expect(screen.getByText("Map Layers")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Satellite" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Collapse layers panel" })).toBeInTheDocument();
  });

  it("collapses and restores the desktop layers panel", () => {
    render(
      <MapLayerControls
        layout="desktop"
        mapStyle="standard"
        fogLayerEnabled
        onMapStyleChange={vi.fn()}
        onFogLayerChange={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Collapse layers panel" }));

    expect(screen.queryByRole("radio", { name: "Satellite" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Layers" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Layers" }));

    expect(screen.getByRole("radio", { name: "Satellite" })).toBeInTheDocument();
  });
});
