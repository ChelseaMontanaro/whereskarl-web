import type { Map } from "maplibre-gl";

import { BAY_AREA_LOCATION_ZOOM } from "@/lib/map/config";
import { getPhonePortraitCameraPreset } from "@/lib/map/phonePortraitMapPresentation";

export function fitPhonePortraitRegionViewport(
  map: Map,
  regionId: string | null | undefined,
  options?: { duration?: number },
): void {
  const preset = getPhonePortraitCameraPreset(regionId);
  const camera = {
    center: [preset.longitude, preset.latitude] as [number, number],
    zoom: preset.zoom,
  };
  const duration = options?.duration ?? 0;

  if (duration > 0) {
    map.easeTo({ ...camera, duration, essential: true });
  } else {
    map.jumpTo(camera);
  }
}

/** @deprecated Use fitPhonePortraitRegionViewport with "san-francisco". */
export function fitPhonePortraitMapViewport(
  map: Map,
  options?: { duration?: number },
): void {
  fitPhonePortraitRegionViewport(map, "san-francisco", options);
}

export function locatePhonePortraitMap(map: Map): void {
  if (!navigator.geolocation) {
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      map.flyTo({
        center: [position.coords.longitude, position.coords.latitude],
        zoom: BAY_AREA_LOCATION_ZOOM,
        duration: 450,
        essential: true,
      });
    },
    () => undefined,
    { enableHighAccuracy: true, timeout: 10000 },
  );
}
