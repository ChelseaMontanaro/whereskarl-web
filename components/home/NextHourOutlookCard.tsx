import { NextHourIcon } from "@/components/home/ConditionIcons";
import {
  CardLabel,
  InsightIconFrame,
} from "@/components/home/InsightCardParts";
import { desktopInsightIconSizeClass } from "@/components/home/desktopGlass";
import { GlassCard } from "@/components/ui/GlassCard";

type NextHourOutlookCardProps = {
  summary: string | null;
  confidenceLabel: string | null;
  isLoading: boolean;
  layout?: "mobile" | "desktop";
};

function NextHourCardBody({
  summary,
  confidenceLabel,
  isLoading,
  layout,
}: NextHourOutlookCardProps) {
  const isDesktop = layout === "desktop";

  if (isLoading) {
    return (
      <>
        <InsightIconFrame tone="gold">
          <NextHourIcon className={desktopInsightIconSizeClass} />
        </InsightIconFrame>
        <div className="min-w-0 flex-1">
          <CardLabel>Next Hour</CardLabel>
          <p
            className={`mt-2 text-sm text-white/55 ${
              isDesktop ? "lg:mt-1.5 lg:text-base" : ""
            }`}
          >
            Checking the next-hour outlook…
          </p>
        </div>
      </>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <>
      <InsightIconFrame tone="gold">
        <NextHourIcon className={desktopInsightIconSizeClass} />
      </InsightIconFrame>
      <div className="min-w-0 flex-1">
        <CardLabel>Next Hour</CardLabel>
        <p
          className={`mt-2 text-sm leading-relaxed text-white/75 ${
            isDesktop ? "lg:mt-1.5 lg:text-base lg:leading-relaxed" : ""
          }`}
        >
          {summary}
        </p>
        {confidenceLabel ? (
          <p
            className={`mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/40 ${
              isDesktop ? "lg:font-medium lg:normal-case lg:tracking-normal" : ""
            }`}
          >
            {confidenceLabel} confidence
          </p>
        ) : null}
      </div>
    </>
  );
}

export function NextHourOutlookCard({
  summary,
  confidenceLabel,
  isLoading,
  layout = "mobile",
}: NextHourOutlookCardProps) {
  const isDesktop = layout === "desktop";
  const variant = isDesktop ? "desktop" : "insight";
  const cardClassName = isDesktop
    ? "flex items-start gap-4 px-5 py-5"
    : "flex items-start gap-3 px-4 py-4";

  if (!isLoading && !summary) {
    return null;
  }

  return (
    <GlassCard variant={variant} className={cardClassName}>
      <NextHourCardBody
        summary={summary}
        confidenceLabel={confidenceLabel}
        isLoading={isLoading}
        layout={layout}
      />
    </GlassCard>
  );
}
