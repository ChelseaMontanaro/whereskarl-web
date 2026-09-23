import { MarketingShell } from "@/components/site/MarketingShell";
import { createPageMetadata } from "@/lib/site/metadata";

export const metadata = createPageMetadata({
  title: "Support",
  path: "/support",
  description:
    "Help with Where's Karl conditions, the map, Favorites, and common troubleshooting.",
});

const SUPPORT_EMAIL = "support@whereskarl.live";

export default function SupportPage() {
  return (
    <MarketingShell>
      <article>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a5a12]">
          Where&apos;s Karl
        </p>
        <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-[#16325c] sm:text-5xl">
          Support
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[#24384f]">
          Need help with Where&apos;s Karl?
        </p>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#3e5168]">
          Where&apos;s Karl helps you explore fog, clearer skies, and changing conditions
          across the San Francisco Bay Area. Here you&apos;ll find help with conditions,
          the map, Favorites, and common troubleshooting.
        </p>

        <div className="mt-12 space-y-10 text-base leading-relaxed text-[#24384f]">
          <section className="space-y-3">
            <h2 className="font-serif text-2xl font-semibold text-[#16325c]">
              Karl and Fog Conditions
            </h2>
            <p>
              Karl is the fog. Conditions can change over a short distance. One place
              can be foggy while another place nearby is clearer. Where&apos;s Karl shows
              those differences so you can see where skies are heavier and where they
              are more open.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl font-semibold text-[#16325c]">Map</h2>
            <p>
              The map shows places around the Bay Area and the conditions reported for
              them. Open a place to see more detail for that location.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl font-semibold text-[#16325c]">
              Favorites
            </h2>
            <p>
              You can save places you want to check again. Saving a place does not
              create an account.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl font-semibold text-[#16325c]">
              App Behavior
            </h2>
            <p>
              Conditions can change throughout the day. Where&apos;s Karl shows the latest
              available conditions the app has loaded for the places you&apos;re viewing.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl font-semibold text-[#16325c]">
              If Something Doesn&apos;t Look Right
            </h2>
            <p>
              Conditions can change quickly across the Bay Area. If a location appears
              out of date, try reopening it to load the latest available conditions. If
              the map does not load correctly, check your internet connection and try
              again.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl font-semibold text-[#16325c]">
              Contact Us
            </h2>
            <p>Still need help?</p>
            <p>Email us at:</p>
            <p>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="font-medium text-[#1d4f91] underline decoration-[#1d4f91]/40 underline-offset-4 hover:decoration-[#1d4f91] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1d4f91]"
              >
                {SUPPORT_EMAIL}
              </a>
            </p>
          </section>
        </div>
      </article>
    </MarketingShell>
  );
}
