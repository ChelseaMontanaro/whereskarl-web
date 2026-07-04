import { CardLabel } from "@/components/home/InsightCardParts";
import { GlassCard } from "@/components/ui/GlassCard";

type NextHourOutlookCardProps = {
  summary: string | null;
  confidenceLabel: string | null;
  isLoading: boolean;
  layout?: "mobile" | "desktop";
};

export function NextHourOutlookCard({
  summary,
  confidenceLabel,
  isLoading,
  layout = "mobile",
}: NextHourOutlookCardProps) {
  const variant = layout === "desktop" ? "desktop" : "insight";
  const cardClassName =
    layout === "desktop" ? "px-5 py-5" : "px-4 py-4";

  if (isLoading) {
    return (
      <GlassCard variant={variant} className={cardClassName}>
        <CardLabel>Next Hour</CardLabel>
        <p
          className={`mt-3 text-sm text-white/55 ${
            layout === "desktop" ? "lg:text-base" : ""
          }`}
        >
          Checking the next-hour outlook…
        </p>
      </GlassCard>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <GlassCard variant={variant} className={cardClassName}>
      <CardLabel>Next Hour</CardLabel>
      <p
        className={`mt-3 text-sm leading-relaxed text-white/75 ${
          layout === "desktop" ? "lg:text-base lg:leading-relaxed" : ""
        }`}
      >
        {summary}
      </p>
      {confidenceLabel ? (
        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/40">
          {confidenceLabel} confidence
        </p>
      ) : null}
    </GlassCard>
  );
}
