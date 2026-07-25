import type { ReactNode } from "react";

import { GlassButton } from "@/components/ui/GlassButton";

type LegalPageLayoutProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function LegalPageLayout({
  title,
  description,
  children,
}: LegalPageLayoutProps) {
  return (
    <div className="mx-auto flex w-full max-w-[430px] flex-col gap-6 px-4 py-8 sm:py-10">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-karl-gold">
          Where&apos;s Karl?
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white">{title}</h1>
        <p className="text-base text-white/70">{description}</p>
      </header>

      <div className="space-y-4">{children}</div>

      <div className="border-t border-white/10 pt-4">
        <GlassButton href="/">Back to Home</GlassButton>
      </div>
    </div>
  );
}

function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-karl-gold/90">
        {title}
      </h2>
      <div className="space-y-2 text-sm leading-relaxed text-white/70">{children}</div>
    </section>
  );
}

function LegalCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-karl-navy-glass/80 px-5 py-4 backdrop-blur-sm">
      {children}
    </div>
  );
}

LegalPageLayout.Section = LegalSection;
LegalPageLayout.Card = LegalCard;
