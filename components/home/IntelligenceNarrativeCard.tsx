import { KarlStatusIcon } from "@/components/home/ConditionIcons";
import {
  CardLabel,
  InsightCardChevron,
  InsightIconFrame,
} from "@/components/home/InsightCardParts";
import { GlassCard } from "@/components/ui/GlassCard";
import type { KarlIntelligenceResponse } from "@/lib/schemas/intelligence";

type IntelligenceNarrativeCardProps = {
  intelligence: KarlIntelligenceResponse | null;
  isLoading: boolean;
  layout?: "both" | "mobile" | "desktop";
};

function MobileIntelligenceNarrativeCard({
  intelligence,
  isLoading,
}: Omit<IntelligenceNarrativeCardProps, "layout">) {
  if (isLoading) {
    return (
      <GlassCard className="border-white/8 bg-karl-navy-glass/55 px-4 py-4 backdrop-blur-md">
        <CardLabel>Karl&apos;s Read</CardLabel>
        <p className="mt-3 text-lg font-semibold text-white/50">
          Reading Karl intelligence…
        </p>
      </GlassCard>
    );
  }

  if (!intelligence) {
    return null;
  }

  const confidenceLabel =
    intelligence.narrative.confidenceLabel.toLowerCase() === "unavailable"
      ? null
      : intelligence.narrative.confidenceLabel;

  return (
    <GlassCard className="border-white/8 bg-karl-navy-glass/55 px-4 py-4 backdrop-blur-md">
      <CardLabel>Karl&apos;s Read</CardLabel>
      <h2 className="mt-3 text-lg font-semibold leading-snug text-white">
        {intelligence.narrative.headline}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-white/70">
        {intelligence.narrative.summary}
      </p>
      {confidenceLabel ? (
        <p className="mt-3 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-white/40">
          {confidenceLabel} confidence
        </p>
      ) : null}
    </GlassCard>
  );
}

function DesktopIntelligenceNarrativeCard({
  intelligence,
  isLoading,
}: Omit<IntelligenceNarrativeCardProps, "layout">) {
  if (isLoading) {
    return (
      <GlassCard variant="desktop" className="flex items-center gap-4 px-5 py-4">
        <InsightIconFrame>
          <KarlStatusIcon className="h-8 w-8 lg:h-9 lg:w-9" />
        </InsightIconFrame>
        <div className="min-w-0 flex-1">
          <CardLabel>Karl&apos;s Read</CardLabel>
          <p className="mt-2 text-lg font-semibold text-white/50">
            Reading Karl intelligence…
          </p>
        </div>
      </GlassCard>
    );
  }

  if (!intelligence) {
    return null;
  }

  const confidenceLabel =
    intelligence.narrative.confidenceLabel.toLowerCase() === "unavailable"
      ? null
      : intelligence.narrative.confidenceLabel;

  return (
    <GlassCard variant="desktop" className="flex items-center gap-4 px-5 py-4">
      <InsightIconFrame>
        <KarlStatusIcon className="h-8 w-8 lg:h-9 lg:w-9" />
      </InsightIconFrame>
      <div className="min-w-0 flex-1">
        <CardLabel>Karl&apos;s Read</CardLabel>
        <h2 className="mt-1.5 text-xl font-semibold leading-snug text-white">
          {intelligence.narrative.headline}
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-white/72">
          {intelligence.narrative.summary}
        </p>
        {confidenceLabel ? (
          <p className="mt-2 text-xs font-medium text-white/48">
            {confidenceLabel} confidence
          </p>
        ) : null}
      </div>
      <InsightCardChevron />
    </GlassCard>
  );
}

export function IntelligenceNarrativeCard({
  intelligence,
  isLoading,
  layout = "both",
}: IntelligenceNarrativeCardProps) {
  if (layout === "mobile") {
    return (
      <MobileIntelligenceNarrativeCard
        intelligence={intelligence}
        isLoading={isLoading}
      />
    );
  }

  if (layout === "desktop") {
    return (
      <DesktopIntelligenceNarrativeCard
        intelligence={intelligence}
        isLoading={isLoading}
      />
    );
  }

  return (
    <>
      <div className="lg:hidden">
        <MobileIntelligenceNarrativeCard
          intelligence={intelligence}
          isLoading={isLoading}
        />
      </div>
      <div className="hidden lg:block">
        <DesktopIntelligenceNarrativeCard
          intelligence={intelligence}
          isLoading={isLoading}
        />
      </div>
    </>
  );
}
