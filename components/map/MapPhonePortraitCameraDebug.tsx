"use client";

import { useCallback, useEffect, useState } from "react";

type CameraSnapshot = {
  latitude: number;
  longitude: number;
  zoom: number;
  bearing: number;
  pitch: number;
};

type MapPhonePortraitCameraDebugProps = {
  map: import("maplibre-gl").Map | null;
};

function readCamera(map: import("maplibre-gl").Map): CameraSnapshot {
  const center = map.getCenter();

  return {
    latitude: center.lat,
    longitude: center.lng,
    zoom: map.getZoom(),
    bearing: map.getBearing(),
    pitch: map.getPitch(),
  };
}

function formatCameraText(camera: CameraSnapshot): string {
  return [
    "Center:",
    `Latitude: ${camera.latitude}`,
    `Longitude: ${camera.longitude}`,
    `Zoom: ${camera.zoom}`,
    `Bearing: ${camera.bearing}`,
    `Pitch: ${camera.pitch}`,
  ].join("\n");
}

function formatValue(value: number, digits = 6): string {
  return Number.isFinite(value) ? value.toFixed(digits) : "—";
}

export function MapPhonePortraitCameraDebug({
  map,
}: MapPhonePortraitCameraDebugProps) {
  const [camera, setCamera] = useState<CameraSnapshot | null>(null);
  const [hidden, setHidden] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!map || hidden) {
      return;
    }

    const update = () => {
      setCamera(readCamera(map));
    };

    update();
    map.on("move", update);
    map.on("zoom", update);
    map.on("rotate", update);
    map.on("pitch", update);

    return () => {
      map.off("move", update);
      map.off("zoom", update);
      map.off("rotate", update);
      map.off("pitch", update);
    };
  }, [hidden, map]);

  const handleCopy = useCallback(async () => {
    if (!camera) {
      return;
    }

    const text = formatCameraText(camera);

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [camera]);

  if (hidden) {
    return null;
  }

  return (
    <div
      aria-label="Phone portrait camera debug"
      className="pointer-events-auto absolute inset-x-3 bottom-[calc(7.75rem+env(safe-area-inset-bottom))] z-[35] rounded-2xl border border-karl-gold/35 bg-[rgb(3_11_20/0.92)] p-3 text-xs text-white shadow-[0_8px_24px_rgb(0_0_0/0.35)] backdrop-blur-sm"
    >
      <p className="mb-2 font-semibold uppercase tracking-[0.14em] text-karl-gold">
        Camera Debug (temp)
      </p>

      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono text-[0.6875rem] leading-5 text-white/88">
        <dt className="text-white/55">Latitude</dt>
        <dd>{camera ? formatValue(camera.latitude) : "—"}</dd>
        <dt className="text-white/55">Longitude</dt>
        <dd>{camera ? formatValue(camera.longitude) : "—"}</dd>
        <dt className="text-white/55">Zoom</dt>
        <dd>{camera ? formatValue(camera.zoom, 4) : "—"}</dd>
        <dt className="text-white/55">Bearing</dt>
        <dd>{camera ? formatValue(camera.bearing, 2) : "—"}</dd>
        <dt className="text-white/55">Pitch</dt>
        <dd>{camera ? formatValue(camera.pitch, 2) : "—"}</dd>
      </dl>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={handleCopy}
          disabled={!camera}
          className="rounded-full border border-karl-gold/40 bg-karl-gold/14 px-3 py-1.5 text-[0.6875rem] font-semibold text-karl-gold transition-opacity hover:opacity-90 disabled:opacity-40 motion-reduce:transition-none"
        >
          {copied ? "Copied" : "Copy Camera"}
        </button>
        <button
          type="button"
          onClick={() => setHidden(true)}
          className="rounded-full border border-white/16 px-3 py-1.5 text-[0.6875rem] font-semibold text-white/75 transition-opacity hover:opacity-90 motion-reduce:transition-none"
        >
          Hide Debug
        </button>
      </div>
    </div>
  );
}
