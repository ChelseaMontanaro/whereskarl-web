import { LegalPageLayout } from "@/components/layout/LegalPageLayout";
import { createPageMetadata } from "@/lib/site/metadata";

export const metadata = createPageMetadata({
  title: "Privacy",
  path: "/privacy",
  description:
    "Privacy policy for whereskarl.live. Where's Karl does not require accounts, does not sell personal data, and uses weather data to show Bay Area fog and sunshine conditions.",
});

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      title="Privacy"
      description="How Where's Karl handles information on whereskarl.live."
    >
      <LegalPageLayout.Card>
        <div className="space-y-5">
          <LegalPageLayout.Section title="Overview">
            <p>
              Where&apos;s Karl helps you follow Karl the Fog and find clearer skies across
              the San Francisco Bay Area. This page describes what the web app does today.
            </p>
          </LegalPageLayout.Section>

          <LegalPageLayout.Section title="No accounts">
            <p>
              The web app does not offer account creation or sign-in. You can use Home,
              Map, and related pages without creating a Where&apos;s Karl profile on the
              web.
            </p>
          </LegalPageLayout.Section>

          <LegalPageLayout.Section title="Weather and location data">
            <p>
              Where&apos;s Karl uses Bay Area weather and location data from our shared
              backend to show fog, sunshine, and microclimate conditions. That data powers
              Home, the map, Karl intelligence, and best-sunshine guidance for San
              Francisco, North Bay, East Bay, and South Bay.
            </p>
          </LegalPageLayout.Section>

          <LegalPageLayout.Section title="Browser-local storage">
            <p>
              Some preferences or favorites may be stored locally in your browser where
              that feature is available. This information stays on your device and is not
              used to create a web account.
            </p>
          </LegalPageLayout.Section>

          <LegalPageLayout.Section title="What we do not do">
            <p>
              Where&apos;s Karl does not sell personal data. The web app also does not
              currently use third-party analytics, advertising trackers, or web push
              notifications.
            </p>
          </LegalPageLayout.Section>

          <LegalPageLayout.Section title="Updates">
            <p>
              If these practices change, this page will be updated to reflect the current
              web product.
            </p>
          </LegalPageLayout.Section>
        </div>
      </LegalPageLayout.Card>
    </LegalPageLayout>
  );
}
