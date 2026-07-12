// @vitest-environment happy-dom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const usePhonePortraitMock = vi.fn(() => false);

vi.mock("@/lib/hooks/usePhonePortrait", () => ({
  usePhonePortrait: () => usePhonePortraitMock(),
}));

import {
  MapLayerControls,
  MapPhonePortraitLayersControl,
} from "@/components/map/MapLayerControls";

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

    const fogSwitch = screen.getByRole("switch", { name: "Fog Layer" });
    expect(fogSwitch).toHaveAttribute("aria-checked", "true");

    fireEvent.click(fogSwitch);

    expect(onFogLayerChange).toHaveBeenCalledWith(false);
    expect(screen.getByText("Fog Layer")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Satellite" })).toBeInTheDocument();
  });

  it("supports keyboard activation for the fog layer switch", () => {
    const onFogLayerChange = vi.fn();

    render(
      <MapLayerControls
        layout="desktop"
        mapStyle="standard"
        fogLayerEnabled={false}
        onMapStyleChange={vi.fn()}
        onFogLayerChange={onFogLayerChange}
      />,
    );

    const fogSwitch = screen.getByRole("switch", { name: "Fog Layer" });
    expect(fogSwitch).toHaveAttribute("aria-checked", "false");

    fireEvent.keyDown(fogSwitch, { key: "Enter" });
    fireEvent.click(fogSwitch);

    expect(onFogLayerChange).toHaveBeenCalledWith(true);
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

describe("MapLayerControls immersive (tablet)", () => {
  afterEach(() => {
    cleanup();
    usePhonePortraitMock.mockReturnValue(false);
  });

  it("keeps the immersive layers panel within the tablet viewport", () => {
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
    expect(controls?.className).toContain("calc(100%-0.75rem)");
    expect(controls?.className).toContain("max-w-full");
    expect(controls?.className).toContain("right-3");
    expect(controls?.className).not.toContain("100vw");
    expect(controls?.className).toContain("items-stretch");
  });

  it("renders zoom controls and an expanded layers panel by default on tablet", () => {
    render(
      <MapLayerControls
        layout="immersive"
        mapStyle="standard"
        fogLayerEnabled
        onMapStyleChange={vi.fn()}
        onFogLayerChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Zoom in" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Zoom out" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Satellite" })).toBeInTheDocument();
  });
});

describe("MapPhonePortraitLayersControl", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders a single collapsed Fog Layer trigger and wires open state", () => {
    const onOpenChange = vi.fn();

    render(
      <MapPhonePortraitLayersControl
        mapStyle="standard"
        fogLayerEnabled
        onMapStyleChange={vi.fn()}
        onFogLayerChange={vi.fn()}
        onOpenChange={onOpenChange}
      />,
    );

    const trigger = screen.getByRole("button", { name: "Open map layers" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveAttribute("aria-controls", "map-layer-panel-phone");
    // Exactly one Fog Layer trigger exists.
    expect(screen.getAllByRole("button", { name: "Open map layers" })).toHaveLength(1);
    expect(screen.queryByRole("radio", { name: "Satellite" })).not.toBeInTheDocument();
    expect(onOpenChange).toHaveBeenLastCalledWith(false);

    fireEvent.click(trigger);

    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("radio", { name: "Satellite" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Close map layers" }),
    ).toBeInTheDocument();
  });

  it("keeps the trigger wired to map style and fog layer state", () => {
    const onMapStyleChange = vi.fn();
    const onFogLayerChange = vi.fn();

    render(
      <MapPhonePortraitLayersControl
        mapStyle="standard"
        fogLayerEnabled
        onMapStyleChange={onMapStyleChange}
        onFogLayerChange={onFogLayerChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open map layers" }));

    fireEvent.click(screen.getByRole("radio", { name: "Satellite" }));
    expect(onMapStyleChange).toHaveBeenCalledWith("satellite");

    fireEvent.click(screen.getByRole("switch", { name: "Fog Layer" }));
    expect(onFogLayerChange).toHaveBeenCalledWith(false);
  });

  it("closes the panel from the backdrop and collapse control", () => {
    const onOpenChange = vi.fn();

    render(
      <MapPhonePortraitLayersControl
        mapStyle="standard"
        fogLayerEnabled
        onMapStyleChange={vi.fn()}
        onFogLayerChange={vi.fn()}
        onOpenChange={onOpenChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open map layers" }));
    expect(onOpenChange).toHaveBeenLastCalledWith(true);

    fireEvent.click(screen.getByRole("button", { name: "Close map layers" }));
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(screen.queryByRole("radio", { name: "Satellite" })).not.toBeInTheDocument();
  });
});
