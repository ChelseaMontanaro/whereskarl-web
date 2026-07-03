import { GlassCard } from "@/components/ui/GlassCard";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

export default function MapPage() {
  return (
    <PlaceholderPage
      title="Map"
      description="Bay Area fog overlays, location pins, and regional detail will live here."
    >
      <GlassCard className="px-5 py-4">
        <p className="text-sm text-white/70">
          MapLibre integration and live location weather are planned for a later step.
        </p>
      </GlassCard>
    </PlaceholderPage>
  );
}
