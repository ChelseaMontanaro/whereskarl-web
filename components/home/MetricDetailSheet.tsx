"use client";

import { useEffect, useId, useRef } from "react";

import {
  METRIC_DETAILS,
  type MetricDetailKey,
} from "@/lib/home/metricDetails";

type MetricDetailSheetProps = {
  metricKey: MetricDetailKey | null;
  onClose: () => void;
};

export function MetricDetailSheet({ metricKey, onClose }: MetricDetailSheetProps) {
  const titleId = useId();
  const bodyId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!metricKey) {
      return;
    }

    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [metricKey, onClose]);

  if (!metricKey) {
    return null;
  }

  const detail = METRIC_DETAILS[metricKey];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center lg:items-center lg:p-6">
      <button
        type="button"
        aria-label="Close metric details"
        className="absolute inset-0 bg-black/55 backdrop-blur-[1px] motion-reduce:transition-none"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        className="relative z-10 w-full max-w-lg rounded-t-3xl border border-white/10 bg-black/72 px-5 pb-6 pt-4 shadow-[0_-8px_40px_rgba(0,0,0,0.45)] backdrop-blur-md lg:rounded-2xl lg:px-6 lg:pb-6 lg:pt-5 lg:shadow-[0_8px_40px_rgba(0,0,0,0.45)]"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/18 lg:hidden" />
        <div className="flex items-start justify-between gap-4">
          <h2
            id={titleId}
            className="min-w-0 flex-1 text-lg font-semibold leading-snug text-white lg:text-xl"
          >
            {detail.title}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/6 text-white/72 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-karl-gold motion-reduce:transition-none"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
            >
              <path d="M7 7l10 10M17 7 7 17" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <p id={bodyId} className="mt-3 text-sm leading-relaxed text-white/72 lg:text-[0.9375rem]">
          {detail.body}
        </p>
      </div>
    </div>
  );
}
