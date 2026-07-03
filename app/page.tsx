import { HealthStatus } from "@/components/HealthStatus";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center px-4 py-16 sm:py-24">
      <main className="flex w-full max-w-[430px] flex-col gap-8">
        <header className="space-y-3 text-center sm:text-left">
          <h1 className="text-4xl font-semibold tracking-tight text-white">
            Where&apos;s Karl?
          </h1>
          <p className="text-lg text-white/75">Track Karl across the Bay</p>
        </header>

        <HealthStatus />

        <p className="text-center text-sm text-white/45 sm:text-left">
          Web foundation scaffold. Weather dashboard, map, and favorites arrive in
          later Phase 14 steps.
        </p>
      </main>
    </div>
  );
}
