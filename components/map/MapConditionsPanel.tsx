import { desktopGlassCardClass } from "@/components/home/desktopGlass";

type MapConditionsPanelProps = {
  statusSentence: string;
  isLoading?: boolean;
};

export function MapConditionsPanel({
  statusSentence,
  isLoading = false,
}: MapConditionsPanelProps) {
  return (
    <div
      className={`${desktopGlassCardClass} max-w-xs px-4 py-3.5`}
      aria-label="Bay Area map conditions summary"
    >
      <p className="text-[0.625rem] font-bold uppercase tracking-[0.18em] text-karl-gold/90">
        Karl around the Bay
      </p>
      <h1 className="mt-1.5 text-lg font-semibold tracking-tight text-white">
        Bay Area conditions
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-white/72">
        {isLoading ? "Checking live conditions…" : statusSentence}
      </p>
    </div>
  );
}
