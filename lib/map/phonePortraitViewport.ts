import type { Map } from "maplibre-gl";

import { BAY_AREA_LOCATION_ZOOM } from "@/lib/map/config";
import {
  PHONE_PORTRAIT_MAP_CENTER,
  PHONE_PORTRAIT_MAP_INITIAL_ZOOM,
} from "@/lib/map/phonePortraitMapPresentation";

export function fitPhonePortraitMapViewport(
  map: Map,
  options?: { duration?: number },
): void {
  const camera = {
    center: [
      PHONE_PORTRAIT_MAP_CENTER.longitude,
      PHONE_PORTRAIT_MAP_CENTER.latitude,
    ] as [number, number],
    zoom: PHONE_PORTRAIT_MAP_INITIAL_ZOOM,
  };
  const duration = options?.duration ?? 0;

  if (duration > 0) {
    map.easeTo({ ...camera, duration, essential: true });
  } else {
    map.jumpTo(camera);
  }
}

export function shouldUsePhonePortraitFixedCamera(
  selectedRegionId: string | null,
): boolean {
  return selectedRegionId === "san-francisco" || selectedRegionId === null;
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
