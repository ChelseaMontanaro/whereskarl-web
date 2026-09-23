import Link from "next/link";

import { MarketingShell } from "@/components/site/MarketingShell";
import { createPageMetadata } from "@/lib/site/metadata";

export const metadata = createPageMetadata({
  title: "Privacy Policy",
  path: "/privacy",
  description:
    "How information is handled when you use Where's Karl, including location, favorites, local storage, and third-party services.",
});

const LAST_UPDATED = "September 22, 2026";
const SUPPORT_EMAIL = "support@whereskarl.live";

export default function PrivacyPage() {
  return (
    <MarketingShell>
      <article>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a5a12]">
          Where&apos;s Karl
        </p>
        <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-[#16325c] sm:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-[#3e5168]">Last updated: {LAST_UPDATED}</p>

        <div className="mt-12 space-y-10 text-base leading-relaxed text-[#24384f]">
          <section className="space-y-3">
            <h2 className="font-serif text-2xl font-semibold text-[#16325c]">
              Introduction
            </h2>
            <p>
              Where&apos;s Karl helps you explore fog, sunshine, weather, and related
              conditions across the San Francisco Bay Area. We designed Where&apos;s Karl
              to be useful without requiring you to create an account or provide
              unnecessary personal information.
            </p>
            <p>
              This Privacy Policy explains how information is handled when you use
              Where&apos;s Karl.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl font-semibold text-[#16325c]">
              Information We Collect
            </h2>
            <p>
              Where&apos;s Karl does not currently require an account or sign-in, and you
              do not need to provide your name or email address to use the app.
            </p>
            <p>
              Where&apos;s Karl does not currently include advertising, paid subscriptions,
              or third-party analytics or crash-reporting services.
            </p>
            <p>
              The app requests weather and environmental information for Bay Area
              locations in order to provide features such as fog conditions, clear-sky
              information, temperature, air quality, and other location-based conditions.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl font-semibold text-[#16325c]">
              Location
            </h2>
            <p>
              Where&apos;s Karl provides information about places you choose to view.
              Selecting a neighborhood, park, beach, or other location does not mean
              that Where&apos;s Karl is tracking the physical location of your device.
            </p>
            <p>
              Where&apos;s Karl does not continuously track your location or request your
              location in the background.
            </p>
            <p>
              Some versions or features of Where&apos;s Karl may include the ability to
              use your device or browser location to help you navigate the map or find
              relevant places. If location access is used, it is subject to the
              permissions and controls provided by your device or browser.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl font-semibold text-[#16325c]">
              Favorites and Local Storage
            </h2>
            <p>
              Where&apos;s Karl may store information locally on your device or browser to
              provide features such as Favorites and to retain recently loaded weather
              or condition information.
            </p>
            <p>
              This locally stored information does not create a Where&apos;s Karl account
              or user profile.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl font-semibold text-[#16325c]">
              Third-Party Services
            </h2>
            <p>
              Where&apos;s Karl relies on third-party services and infrastructure to
              operate the app and website, including services that provide maps, weather
              or environmental information, hosting, and content delivery.
            </p>
            <p>
              These providers may process limited technical information, such as an IP
              address or request information, as part of providing their services and
              may have their own privacy practices.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl font-semibold text-[#16325c]">
              Data Sharing
            </h2>
            <p>Where&apos;s Karl does not sell your personal information.</p>
            <p>
              Information may be processed by service providers when necessary to
              operate and deliver Where&apos;s Karl, such as providing maps, weather
              information, hosting, or other technical infrastructure.
            </p>
            <p>Where&apos;s Karl does not currently use your information for advertising.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl font-semibold text-[#16325c]">
              Changes to This Policy
            </h2>
            <p>
              Where&apos;s Karl may evolve over time, and our privacy practices may change
              as new features or services are introduced. If we make changes that affect
              the information described in this policy, we will update this page and the
              &quot;Last updated&quot; date above.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl font-semibold text-[#16325c]">Contact</h2>
            <p>
              If you have questions about this Privacy Policy, please visit our{" "}
              <Link
                href="/support"
                className="font-medium text-[#1d4f91] underline decoration-[#1d4f91]/40 underline-offset-4 hover:decoration-[#1d4f91] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1d4f91]"
              >
                Support
              </Link>{" "}
              page or contact us at:
            </p>
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
