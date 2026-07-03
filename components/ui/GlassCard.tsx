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
      ? "rounded-2xl border border-white/10 bg-black/34 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.14)]"
      : "rounded-2xl border border-white/10 bg-karl-navy-glass/80 backdrop-blur-sm";

  return <div className={`${surfaceClass} ${className}`}>{children}</div>;
}
