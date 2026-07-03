import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

export default function SupportPage() {
  return (
    <PlaceholderPage
      title="Support"
      description="Help, FAQ, and contact options for Where's Karl? will live here."
    >
      <GlassCard className="space-y-4 px-5 py-4">
        <p className="text-sm text-white/70">
          Placeholder for contact email, App Store link, and common Karl questions.
        </p>
        <GlassButton href="/">Back to Home</GlassButton>
      </GlassCard>
    </PlaceholderPage>
  );
}
