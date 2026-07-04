import type { ReactNode } from "react";

import {
  desktopGlassCardClass,
  insightGlassCardClass,
  metricGlassCardClass,
  mobileInsightGlassHighlightClass,
} from "@/components/home/desktopGlass";

type GlassCardProps = {
  children: ReactNode;
  className?: string;
  variant?: "default" | "desktop" | "metric" | "insight";
};

export function GlassCard({
  children,
  className = "",
  variant = "default",
}: GlassCardProps) {
  const surfaceClass =
    variant === "desktop"
      ? desktopGlassCardClass
      : variant === "metric"
        ? metricGlassCardClass
        : variant === "insight"
          ? insightGlassCardClass
        : "rounded-2xl border border-white/10 bg-karl-navy-glass/80 backdrop-blur-sm";

  return (
    <div className={`${surfaceClass} ${className}`}>
      {variant === "insight" ? (
        <div aria-hidden="true" className={mobileInsightGlassHighlightClass} />
      ) : null}
      {children}
    </div>
  );
}
