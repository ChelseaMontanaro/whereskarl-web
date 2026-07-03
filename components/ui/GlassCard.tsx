import type { ReactNode } from "react";

type GlassCardProps = {
  children: ReactNode;
  className?: string;
};

export function GlassCard({ children, className = "" }: GlassCardProps) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-karl-navy-glass/80 backdrop-blur-sm ${className}`}
    >
      {children}
    </div>
  );
}
