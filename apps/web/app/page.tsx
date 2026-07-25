import { HomeView } from "@/components/home/HomeView";
import { createPageMetadata } from "@/lib/site/metadata";

export const metadata = createPageMetadata({
  path: "/",
  description:
    "Track Karl the Fog across the San Francisco Bay Area with live fog, sunshine, and microclimate conditions for San Francisco, North Bay, East Bay, and South Bay.",
});

export default function HomePage() {
  return <HomeView />;
}
