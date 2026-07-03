import type { ReactNode } from "react";

type GlassCardProps = {
  children: ReactNode;
  className?: string;
  variant?: "default" | "desktop";
};

export function GlassCard({
  children,
  className = "",
  variant = "default",
}: GlassCardProps) {
  const surfaceClass =
    variant === "desktop"
      ? "rounded-2xl border border-white/10 bg-black/58 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ring-1 ring-karl-gold/10"
      : "rounded-2xl border border-white/10 bg-karl-navy-glass/80 backdrop-blur-sm";

  return <div className={`${surfaceClass} ${className}`}>{children}</div>;
}
