import { vi } from "vitest";

const {
  mockFlyTo,
  mockFitBounds,
  mockSetStyle,
  mockAddSource,
  mockAddLayer,
  mockRemoveLayer,
  mockRemoveSource,
  mockGetLayer,
  mockGetSource,
  MockMap,
  MockMarker,
} = vi.hoisted(() => {
  const flyTo = vi.fn();
  const fitBounds = vi.fn();
  const setStyle = vi.fn();
  const addSource = vi.fn();
  const addLayer = vi.fn();
  const removeLayer = vi.fn();
  const removeSource = vi.fn();
  const getLayer = vi.fn(() => undefined);
  const getSource = vi.fn(() => undefined);

  class Map {
    addControl = vi.fn();
    on = vi.fn((_event: string, callback: () => void) => {
      callback();
    });
    once = vi.fn((_event: string, callback: () => void) => {
      callback();
    });
    loaded = vi.fn(() => true);
    getZoom = vi.fn(() => 10);
    project = vi.fn((_lngLat: [number, number]) => ({ x: 0, y: 0 }));
    flyTo = flyTo;
    fitBounds = fitBounds;
    jumpTo = vi.fn();
    easeTo = vi.fn();
    setPadding = vi.fn();
    setStyle = setStyle;
    addSource = addSource;
    addLayer = addLayer;
    removeLayer = removeLayer;
    removeSource = removeSource;
    getLayer = getLayer;
    getSource = getSource;
    remove = vi.fn();
  }

  class Marker {
    element: HTMLElement;
    setLngLat = vi.fn().mockReturnThis();
    // Mirror the applied offset onto the element so tests can assert the
    // marker's effective placement offset (the real MapLibre API stores it
    // internally and applies it as a CSS translate).
    setOffset = vi.fn(function setOffset(
      this: Marker,
      offset: [number, number],
    ) {
      this.element.dataset.markerOffset = JSON.stringify(offset);
      return this;
    });
    getElement = vi.fn(function getElement(this: Marker) {
      return this.element;
    });
    addTo = vi.fn(function addTo(this: Marker) {
      document.body.appendChild(this.element);
      return this;
    });
    remove = vi.fn(function remove(this: Marker) {
      this.element.remove();
    });

    constructor({
      element,
      offset,
    }: {
      element: HTMLElement;
      offset?: [number, number];
    }) {
      this.element = element;
      if (offset) {
        this.element.dataset.markerOffset = JSON.stringify(offset);
      }
    }
  }

  return {
    mockFlyTo: flyTo,
    mockFitBounds: fitBounds,
    mockSetStyle: setStyle,
    mockAddSource: addSource,
    mockAddLayer: addLayer,
    mockRemoveLayer: removeLayer,
    mockRemoveSource: removeSource,
    mockGetLayer: getLayer,
    mockGetSource: getSource,
    MockMap: Map,
    MockMarker: Marker,
  };
});

vi.mock("maplibre-gl", () => ({
  default: {
    Map: MockMap,
    NavigationControl: vi.fn(),
    Marker: MockMarker,
  },
}));

export {
  mockAddLayer,
  mockAddSource,
  mockFitBounds,
  mockFlyTo,
  mockGetLayer,
  mockGetSource,
  mockRemoveLayer,
  mockRemoveSource,
  mockSetStyle,
};
