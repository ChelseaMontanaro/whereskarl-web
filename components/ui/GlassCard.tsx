import type { ReactNode } from "react";

import {
  desktopGlassCardClass,
  metricGlassCardClass,
} from "@/components/home/desktopGlass";

type GlassCardProps = {
  children: ReactNode;
  className?: string;
  variant?: "default" | "desktop" | "metric";
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
        : "rounded-2xl border border-white/10 bg-karl-navy-glass/80 backdrop-blur-sm";

  return <div className={`${surfaceClass} ${className}`}>{children}</div>;
}
