// @vitest-environment happy-dom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const usePhonePortraitMock = vi.fn(() => false);

vi.mock("@/lib/hooks/usePhonePortrait", () => ({
  usePhonePortrait: () => usePhonePortraitMock(),
}));

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

describe("MapLayerControls immersive", () => {
  afterEach(() => {
    cleanup();
    usePhonePortraitMock.mockReturnValue(false);
  });

  it("starts collapsed on phone portrait with a compact layers button", () => {
    usePhonePortraitMock.mockReturnValue(true);

    render(
      <MapLayerControls
        layout="immersive"
        mapStyle="standard"
        fogLayerEnabled
        onMapStyleChange={vi.fn()}
        onFogLayerChange={vi.fn()}
      />,
    );

    expect(screen.queryByRole("radio", { name: "Satellite" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open map layers" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Zoom in" })).toHaveClass("h-8", "w-8");
  });

  it("notifies when the immersive layers panel opens on phone portrait", () => {
    usePhonePortraitMock.mockReturnValue(true);
    const onImmersivePanelOpenChange = vi.fn();

    render(
      <MapLayerControls
        layout="immersive"
        mapStyle="standard"
        fogLayerEnabled
        onMapStyleChange={vi.fn()}
        onFogLayerChange={vi.fn()}
        onImmersivePanelOpenChange={onImmersivePanelOpenChange}
      />,
    );

    expect(onImmersivePanelOpenChange).toHaveBeenCalledWith(false);

    fireEvent.click(screen.getByRole("button", { name: "Open map layers" }));

    expect(onImmersivePanelOpenChange).toHaveBeenLastCalledWith(true);
    expect(screen.getByRole("button", { name: "Close map layers" })).toBeInTheDocument();
  });

  it("keeps the immersive layers panel within the tablet viewport", () => {
    usePhonePortraitMock.mockReturnValue(false);

    render(
      <MapLayerControls
        layout="immersive"
        mapStyle="standard"
        fogLayerEnabled
        onMapStyleChange={vi.fn()}
        onFogLayerChange={vi.fn()}
      />,
    );

    const controls = screen.getByLabelText("Map zoom controls").parentElement;
    expect(controls?.className).toContain("calc(100vw-2rem)");
    expect(controls?.className).toContain("sm:right-5");
    expect(controls?.className).toContain("items-stretch");
  });
});
