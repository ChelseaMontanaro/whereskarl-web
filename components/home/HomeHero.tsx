"use client";

import { FindClearSkiesCta } from "@/components/home/FindClearSkiesCta";

type HomeHeroProps = {
  headline: string;
  subheadline: string;
  confidenceText: string | null;
  isLoading: boolean;
  clearSkiesLocationId: string | null;
  isFindingClearSkies: boolean;
};

function HeroPositionBadge({ isLoading }: { isLoading: boolean }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.115em] text-white/78 backdrop-blur-sm">
      {isLoading ? "Reading Karl intelligence" : "Karl's current position"}
    </span>
  );
}

export function HomeHero({
  headline,
  subheadline,
  confidenceText,
  isLoading,
  clearSkiesLocationId,
  isFindingClearSkies,
}: HomeHeroProps) {
  return (
    <section
      aria-label="Karl conditions hero"
      className="relative min-h-[min(620px,78vh)] w-full overflow-hidden lg:min-h-0 lg:overflow-visible"
    >
      <div className="relative z-10 mx-auto flex min-h-[min(620px,78vh)] w-full max-w-[430px] flex-col sm:max-w-xl md:max-w-2xl lg:min-h-0 lg:max-w-6xl lg:px-8 xl:max-w-7xl">
        <div className="flex flex-col items-center px-5 pt-6 text-center sm:pt-8 lg:hidden">
          <h2 className="font-serif text-[2rem] font-semibold leading-none tracking-[0.01em] text-white/[0.96] [text-shadow:0_7px_16px_rgba(0,0,0,0.52)] sm:text-[2.15rem]">
            Where&apos;s Karl?
          </h2>
          <p className="mt-1.5 font-serif text-xs font-bold uppercase tracking-[0.3em] text-karl-gold">
            Track Karl across the Bay
          </p>
        </div>

        <div className="mt-auto px-5 pb-14 lg:mt-0 lg:min-h-[18rem] lg:px-0 lg:pb-8 lg:pt-[10.5rem] lg:text-left xl:min-h-[19rem] xl:pt-44">
          <HeroPositionBadge isLoading={isLoading} />
          <h1
            className={`mt-4 max-w-[18ch] font-serif text-[1.75rem] font-semibold leading-[1.12] text-white/[0.98] [text-shadow:0_5px_14px_rgba(0,0,0,0.56)] sm:text-[1.85rem] lg:max-w-[20ch] lg:text-[2.05rem] lg:leading-[1.1] xl:max-w-[21ch] xl:text-[2.2rem] ${
              isLoading ? "opacity-70" : ""
            }`}
          >
            {headline}
          </h1>
          <p className="mt-3.5 max-w-[34ch] text-[0.9375rem] font-medium leading-snug text-white/[0.8] [text-shadow:0_4px_10px_rgba(0,0,0,0.46)] lg:max-w-[40ch] lg:text-[0.98rem] lg:leading-relaxed xl:max-w-[42ch]">
            {subheadline}
          </p>
          {confidenceText ? (
            <p className="mt-3 max-w-[34ch] text-[0.6875rem] font-medium text-white/48 [text-shadow:0_3px_8px_rgba(0,0,0,0.36)] lg:max-w-[40ch] lg:text-xs">
              {confidenceText}
            </p>
          ) : null}
          <FindClearSkiesCta
            locationId={clearSkiesLocationId}
            isLoading={isFindingClearSkies}
            className="mt-5 lg:hidden"
          />
        </div>
      </div>
    </section>
  );
}
