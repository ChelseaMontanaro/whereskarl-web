import { Suspense } from "react";

import { MapView } from "@/components/map/MapView";
import { createPageMetadata } from "@/lib/site/metadata";

export const metadata = createPageMetadata({
  title: "Map",
  path: "/map",
  description:
    "Explore Bay Area fog and sunshine on the Where's Karl map. Filter San Francisco, North Bay, East Bay, and South Bay, then focus clear-sky locations across the Bay.",
});

function MapLoadingFallback() {
  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-karl-navy">
        <p className="text-sm text-white/55">Loading map…</p>
      </div>
    </>
  );
}

export default function MapPage() {
  return (
    <div className="h-screen overflow-hidden" data-karl-phone-map-root>
      <Suspense fallback={<MapLoadingFallback />}>
        <MapView />
      </Suspense>
    </div>
  );
}
