"use client";

import { GlassButton } from "@/components/ui/GlassButton";

type AppErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AppError({ error, reset }: AppErrorProps) {
  return (
    <div className="mx-auto flex w-full max-w-[430px] flex-col gap-4 px-4 py-10">
      <p className="text-sm font-medium uppercase tracking-[0.18em] text-karl-gold">
        Where&apos;s Karl?
      </p>
      <h1 className="text-2xl font-semibold text-white">Something went wrong</h1>
      <p className="text-sm leading-relaxed text-white/70">
        The page hit an unexpected error. You can try again or return to Home while
        conditions reload.
      </p>
      {process.env.NODE_ENV !== "production" && error.message ? (
        <p className="rounded-xl border border-white/10 bg-karl-navy-glass/80 px-4 py-3 text-xs text-white/55">
          {error.message}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <GlassButton type="button" onClick={reset}>
          Try again
        </GlassButton>
        <GlassButton href="/">Back to Home</GlassButton>
      </div>
    </div>
  );
}
