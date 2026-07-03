import Link from "next/link";

import { FogCoverageIcon } from "@/components/home/ConditionIcons";
import {
  CardLabel,
  InsightCardChevron,
  InsightIconFrame,
} from "@/components/home/InsightCardParts";
import {
  desktopClickableCardHoverClass,
  desktopClickableCardLinkClass,
  desktopInsightIconSizeClass,
} from "@/components/home/desktopGlass";
import { GlassCard } from "@/components/ui/GlassCard";
import { buildMapHref } from "@/lib/map/routing";
import type { KarlReadPresentation } from "@/lib/home/weatherDisplay";
import type { KarlIntelligenceResponse } from "@/lib/schemas/intelligence";

type IntelligenceNarrativeCardProps = {
  intelligence: KarlIntelligenceResponse | null;
  karlReadPresentation?: KarlReadPresentation | null;
  isLoading: boolean;
  layout?: "both" | "mobile" | "desktop";
};

function MobileIntelligenceNarrativeCard({
  intelligence,
  karlReadPresentation,
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
  const headline =
    karlReadPresentation?.headline ?? intelligence.narrative.headline;
  const summary =
    karlReadPresentation?.summary ?? intelligence.narrative.summary;

  return (
    <GlassCard className="border-white/8 bg-karl-navy-glass/55 px-4 py-4 backdrop-blur-md">
      <CardLabel>Karl&apos;s Read</CardLabel>
      <h2 className="mt-3 text-lg font-semibold leading-snug text-white">
        {headline}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-white/70">
        {summary}
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
  karlReadPresentation,
  isLoading,
}: Omit<IntelligenceNarrativeCardProps, "layout">) {
  if (isLoading) {
    return (
      <GlassCard variant="desktop" className="flex items-center gap-4 px-5 py-5">
        <InsightIconFrame>
          <FogCoverageIcon className={desktopInsightIconSizeClass} />
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
  const headline =
    karlReadPresentation?.headline ?? intelligence.narrative.headline;
  const summary =
    karlReadPresentation?.summary ?? intelligence.narrative.summary;
  const focusLocationId = intelligence.heroImagery?.focusLocationId ?? null;
  const mapHref = focusLocationId ? buildMapHref(focusLocationId) : null;
  const mapLabel = intelligence.heroImagery?.sceneName?.trim()
    ? `View Karl's read on map: ${intelligence.heroImagery.sceneName}`
    : focusLocationId
      ? `View Karl's read on map: ${focusLocationId.replaceAll("-", " ")}`
      : null;

  const cardBody = (
    <>
      <InsightIconFrame>
        <FogCoverageIcon className={desktopInsightIconSizeClass} />
      </InsightIconFrame>
      <div className="min-w-0 flex-1">
        <CardLabel>Karl&apos;s Read</CardLabel>
        <h2 className="mt-1.5 text-lg font-semibold leading-snug text-white lg:text-xl">
          {headline}
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-white/72">
          {summary}
        </p>
        {confidenceLabel ? (
          <p className="mt-2 text-xs font-medium text-white/48">
            {confidenceLabel} confidence
          </p>
        ) : null}
      </div>
      {mapHref ? <InsightCardChevron /> : null}
    </>
  );

  if (mapHref && mapLabel) {
    return (
      <Link href={mapHref} aria-label={mapLabel} className={desktopClickableCardLinkClass}>
        <GlassCard
          variant="desktop"
          className={`flex items-center gap-4 px-5 py-5 ${desktopClickableCardHoverClass}`}
        >
          {cardBody}
        </GlassCard>
      </Link>
    );
  }

  return (
    <GlassCard variant="desktop" className="flex items-center gap-4 px-5 py-5">
      {cardBody}
    </GlassCard>
  );
}

export function IntelligenceNarrativeCard({
  intelligence,
  karlReadPresentation,
  isLoading,
  layout = "both",
}: IntelligenceNarrativeCardProps) {
  if (layout === "mobile") {
    return (
      <MobileIntelligenceNarrativeCard
        intelligence={intelligence}
        karlReadPresentation={karlReadPresentation}
        isLoading={isLoading}
      />
    );
  }

  if (layout === "desktop") {
    return (
      <DesktopIntelligenceNarrativeCard
        intelligence={intelligence}
        karlReadPresentation={karlReadPresentation}
        isLoading={isLoading}
      />
    );
  }

  return (
    <>
      <div className="lg:hidden">
        <MobileIntelligenceNarrativeCard
          intelligence={intelligence}
          karlReadPresentation={karlReadPresentation}
          isLoading={isLoading}
        />
      </div>
      <div className="hidden lg:block">
        <DesktopIntelligenceNarrativeCard
          intelligence={intelligence}
          karlReadPresentation={karlReadPresentation}
          isLoading={isLoading}
        />
      </div>
    </>
  );
}
