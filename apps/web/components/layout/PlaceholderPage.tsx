import type { ReactNode } from "react";

type PlaceholderPageProps = {
  title: string;
  description: string;
  children?: ReactNode;
};

export function PlaceholderPage({
  title,
  description,
  children,
}: PlaceholderPageProps) {
  return (
    <div className="mx-auto flex w-full max-w-[430px] flex-col gap-6 px-4 py-8 sm:py-10">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-karl-gold">
          Where&apos;s Karl?
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white">{title}</h1>
        <p className="text-base text-white/70">{description}</p>
      </header>
      {children}
    </div>
  );
}
