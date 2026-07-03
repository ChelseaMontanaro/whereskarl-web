import { LegalPageLayout } from "@/components/layout/LegalPageLayout";
import { PRODUCT_REGION_NAMES } from "@/lib/site/config";
import { createPageMetadata } from "@/lib/site/metadata";

export const metadata = createPageMetadata({
  title: "Support",
  path: "/support",
  description:
    "Support for Where's Karl on whereskarl.live. Learn how Bay Area fog tracking, Find Clear Skies, and map selection work across San Francisco, North Bay, East Bay, and South Bay.",
});

export default function SupportPage() {
  return (
    <LegalPageLayout
      title="Support"
      description="Help using Where's Karl on the web."
    >
      <LegalPageLayout.Card>
        <div className="space-y-5">
          <LegalPageLayout.Section title="What Where's Karl does">
            <p>
              Where&apos;s Karl tracks Karl the Fog across the San Francisco Bay Area and
              highlights where sunshine is strongest right now. Home summarizes current
              conditions, Karl intelligence, and best-sunshine guidance from the shared
              backend.
            </p>
          </LegalPageLayout.Section>

          <LegalPageLayout.Section title="Bay Area coverage">
            <p>
              The web app follows the same four product regions as iOS:{" "}
              {PRODUCT_REGION_NAMES.join(", ")}. Weather and map filtering stay aligned to
              those regions only.
            </p>
          </LegalPageLayout.Section>

          <LegalPageLayout.Section title="Find Clear Skies">
            <p>
              On Home, Find Clear Skies sends you to the map focused on a recommended
              clearer-sky location when one is available. If no recommendation is ready,
              it opens the Bay Area map instead.
            </p>
          </LegalPageLayout.Section>

          <LegalPageLayout.Section title="Map selection">
            <p>
              On the Map page, region chips frame San Francisco, North Bay, East Bay, or
              South Bay and filter the location list. Selecting a location focuses the map
              marker, opens the selected location panel, and updates the shareable map
              URL.
            </p>
          </LegalPageLayout.Section>

          <LegalPageLayout.Section title="Contact">
            <p>
              A public support contact for whereskarl.live will be added here before
              launch. This placeholder is intentionally left for later configuration.
            </p>
          </LegalPageLayout.Section>
        </div>
      </LegalPageLayout.Card>
    </LegalPageLayout>
  );
}
