import { LandingPage } from "@/components/site/LandingPage";
import { createPageMetadata } from "@/lib/site/metadata";

export const metadata = createPageMetadata({
  path: "/",
  description:
    "Bay Area conditions can change in just a few miles. Where's Karl helps you see where the fog is, where skies are clearing, and where to go next.",
});

export default function HomePage() {
  return <LandingPage />;
}
