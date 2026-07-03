import { GlassCard } from "@/components/ui/GlassCard";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

export default function SettingsPage() {
  return (
    <PlaceholderPage
      title="Settings"
      description="Lightweight web preferences and favorites management will live here."
    >
      <GlassCard className="px-5 py-4">
        <p className="text-sm text-white/70">
          Push notifications stay iOS-only. Web settings will focus on forecast preference
          and saved locations.
        </p>
      </GlassCard>
    </PlaceholderPage>
  );
}
