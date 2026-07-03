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
