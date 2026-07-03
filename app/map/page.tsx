import { Suspense } from "react";

import { MapView } from "@/components/map/MapView";

function MapLoadingFallback() {
  return (
    <div className="mx-auto flex w-full max-w-[430px] flex-col gap-4 px-4 py-8">
      <p className="text-sm text-white/55">Loading map…</p>
    </div>
  );
}

export default function MapPage() {
  return (
    <Suspense fallback={<MapLoadingFallback />}>
      <MapView />
    </Suspense>
  );
}
