import { GlassCard } from "@/components/ui/GlassCard";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

export default function PrivacyPage() {
  return (
    <PlaceholderPage
      title="Privacy"
      description="Privacy policy for whereskarl.live will live here."
    >
      <GlassCard className="px-5 py-4">
        <p className="text-sm text-white/70">
          Placeholder for localStorage usage, analytics disclosure, and support contact
          details.
        </p>
      </GlassCard>
    </PlaceholderPage>
  );
}
