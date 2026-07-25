import { GlassCard } from "@/components/ui/GlassCard";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

export default function FavoritesPage() {
  return (
    <PlaceholderPage
      title="Favorites"
      description="Saved Bay Area locations with live Karl conditions will live here."
    >
      <GlassCard className="px-5 py-4">
        <p className="text-sm text-white/70">
          Favorites will use web-local storage keys and live data from the backend
          locations endpoint.
        </p>
      </GlassCard>
    </PlaceholderPage>
  );
}
