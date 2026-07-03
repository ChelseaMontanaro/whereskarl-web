import { vi } from "vitest";

const { mockFlyTo, mockFitBounds, MockMap, MockMarker } = vi.hoisted(() => {
  const flyTo = vi.fn();
  const fitBounds = vi.fn();

  class Map {
    addControl = vi.fn();
    on = vi.fn((_event: string, callback: () => void) => {
      callback();
    });
    once = vi.fn((_event: string, callback: () => void) => {
      callback();
    });
    loaded = vi.fn(() => true);
    flyTo = flyTo;
    fitBounds = fitBounds;
    remove = vi.fn();
  }

  class Marker {
    element: HTMLElement;
    setLngLat = vi.fn().mockReturnThis();
    addTo = vi.fn(function addTo(this: Marker) {
      document.body.appendChild(this.element);
      return this;
    });
    remove = vi.fn(function remove(this: Marker) {
      this.element.remove();
    });

    constructor({ element }: { element: HTMLElement }) {
      this.element = element;
    }
  }

  return { mockFlyTo: flyTo, mockFitBounds: fitBounds, MockMap: Map, MockMarker: Marker };
});

vi.mock("maplibre-gl", () => ({
  default: {
    Map: MockMap,
    NavigationControl: vi.fn(),
    Marker: MockMarker,
  },
}));

export { mockFitBounds, mockFlyTo };
