import { KarlLogo } from "@/components/brand/KarlLogo";
import { AppStoreBadge } from "@/components/site/AppStoreBadge";
import { MarketingFooter } from "@/components/site/MarketingFooter";
import { MarketingHeader } from "@/components/site/MarketingHeader";
import { PhoneFrame } from "@/components/site/PhoneFrame";
import {
  MARKETING_HERO_PHOTO,
  MARKETING_SCENIC_PHOTO,
  MARKETING_SCREENSHOTS,
} from "@/lib/site/marketingAssets";

const BENEFITS = [
  {
    title: "Track Karl",
    body: "See where the fog is across the Bay Area.",
    icon: "cloud",
  },
  {
    title: "Find Clear Skies",
    body: "Quickly find where conditions are looking better.",
    icon: "sun",
  },
  {
    title: "Explore the Bay",
    body: "Compare conditions across dozens of Bay Area locations.",
    icon: "map",
  },
  {
    title: "Save Favorites",
    body: "Keep the places you care about close at hand.",
    icon: "heart",
  },
] as const;

function PinIcon() {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#d7e2ee] bg-white text-[#1d4e89]">
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z" />
        <circle cx="12" cy="11" r="2" />
      </svg>
    </span>
  );
}

function HeartIcon() {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#d7e2ee] bg-white text-[#1d4e89]">
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19s-6.2-3.8-6.2-8.2A3.5 3.5 0 0 1 12 8.2a3.5 3.5 0 0 1 6.2 2.6C18.2 15.2 12 19 12 19Z" />
      </svg>
    </span>
  );
}

function BenefitIcon({ name }: { name: (typeof BENEFITS)[number]["icon"] }) {
  const common = {
    viewBox: "0 0 32 32",
    className: "h-8 w-8",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "cloud") {
    return (
      <svg {...common}>
        <path d="M10 22h12.2a4.2 4.2 0 0 0 .3-8.4 6.2 6.2 0 0 0-11.8-1.6A3.8 3.8 0 0 0 10 22Z" />
      </svg>
    );
  }

  if (name === "sun") {
    return (
      <svg {...common}>
        <circle cx="16" cy="16" r="4.2" />
        <path d="M16 6.5v2.2M16 23.3v2.2M6.5 16h2.2M23.3 16h2.2M9.2 9.2l1.6 1.6M21.2 21.2l1.6 1.6M22.8 9.2l-1.6 1.6M10.8 21.2l-1.6 1.6" />
      </svg>
    );
  }

  if (name === "map") {
    return (
      <svg {...common}>
        <path d="M7 9.5 12.5 7l7 2.5L25 7v15.5L19.5 25l-7-2.5L7 25V9.5Z" />
        <path d="M12.5 7v15.5M19.5 9.5V25" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M16 25s-7.2-4.4-7.2-10.1A4.1 4.1 0 0 1 16 12a4.1 4.1 0 0 1 7.2 2.9C23.2 20.6 16 25 16 25Z" />
    </svg>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-[#16325c]">
      <section className="relative overflow-hidden bg-[#d7e4f2]">
        <img
          src={MARKETING_HERO_PHOTO}
          alt="Daytime Baker Beach and the Golden Gate Bridge"
          className="absolute inset-0 h-full w-full object-cover object-[54%_42%]"
        />
        <div className="relative z-20">
          <MarketingHeader tone="overlay" />
        </div>
        <div className="relative z-10 mx-auto grid w-full max-w-6xl items-start gap-8 px-5 pb-6 pt-1 sm:px-8 lg:grid-cols-[minmax(0,34rem)_auto] lg:gap-8 lg:px-10 lg:pb-3 lg:pt-2">
          <div className="max-w-xl pt-2 lg:max-w-[34rem] lg:pt-4">
            <h1 className="font-serif text-[2.6rem] font-semibold leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-[3.25rem]">
              Find the sun.
              <span className="mt-1 block text-balance text-white lg:whitespace-nowrap">
                Know where Karl is.
              </span>
            </h1>
            <p className="mt-3 max-w-[15.5rem] text-base leading-snug text-white sm:max-w-md sm:text-[1.05rem]">
              Bay Area conditions can change in just a few miles. Where&apos;s Karl helps
              you see where the fog is, where skies are clearing, and where to go next.
            </p>
            <div className="mt-4">
              <AppStoreBadge className="px-4 py-2" />
            </div>
          </div>
          <div className="mx-auto w-[min(100%,210px)] lg:mr-4 lg:mt-1 lg:w-[196px] lg:rotate-[5deg]">
            <PhoneFrame
              src={MARKETING_SCREENSHOTS.heroMap}
              alt="Where's Karl map overview"
            />
          </div>
        </div>
      </section>

      <section aria-label="What Where's Karl does" className="bg-white">
        <ul className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-7 sm:grid-cols-2 sm:px-8 lg:grid-cols-4 lg:gap-5 lg:py-5">
          {BENEFITS.map((benefit) => (
            <li key={benefit.title} className="text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center text-[#1d4e89]">
                <BenefitIcon name={benefit.icon} />
              </div>
              <h2 className="font-serif text-xl font-semibold text-[#16325c]">
                {benefit.title}
              </h2>
              <p className="mx-auto mt-2 max-w-[16rem] text-sm leading-relaxed text-[#3e5168]">
                {benefit.body}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section id="about" className="scroll-mt-24 bg-[#f7f9fc]">
        <div className="mx-auto w-full max-w-3xl px-5 pt-7 text-center sm:px-8 lg:pt-7">
          <h2 className="font-serif text-3xl font-semibold tracking-tight text-[#16325c] sm:text-4xl lg:text-[2.15rem]">
            A few miles can make all the difference.
          </h2>
          <p className="mt-2 text-base leading-snug text-[#3e5168]">
            Foggy in one neighborhood. Sunny a few miles away. Where&apos;s Karl brings
            Bay Area microclimates together in one place so you can see what conditions
            look like before you go.
          </p>
        </div>

        <div className="mx-auto grid w-full max-w-6xl items-start gap-6 px-5 py-6 sm:px-8 lg:grid-cols-[minmax(11rem,14.5rem)_auto_minmax(11rem,14.5rem)] lg:gap-4 lg:pb-5 lg:pt-4">
          <div className="flex items-start justify-center gap-3 text-center lg:mt-8 lg:justify-start lg:text-left">
            <span className="mt-0.5 hidden lg:flex">
              <PinIcon />
            </span>
            <div>
              <h3 className="font-serif text-xl font-semibold leading-tight text-[#16325c]">
                See conditions across the Bay.
              </h3>
              <p className="mt-2 text-sm leading-snug text-[#3e5168]">
                Explore an interactive map with current conditions, fog coverage, air
                quality, and more — so you can quickly see where to go.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-5 md:flex-row md:items-end md:justify-center">
            <div className="w-[168px] md:mb-2 md:w-[148px] lg:mb-1 lg:w-[148px]">
              <PhoneFrame
                src={MARKETING_SCREENSHOTS.homeOverview}
                alt="Where's Karl home overview"
              />
            </div>
            <div className="relative z-10 w-[210px] md:-mx-4 md:w-[188px] lg:-mx-4 lg:w-[192px]">
              <PhoneFrame
                src={MARKETING_SCREENSHOTS.millValley}
                alt="Where's Karl Mill Valley location details"
              />
            </div>
            <div className="w-[168px] md:mb-2 md:w-[148px] lg:mb-1 lg:w-[148px]">
              <PhoneFrame
                src={MARKETING_SCREENSHOTS.favorites}
                alt="Where's Karl Favorites"
              />
            </div>
          </div>

          <div className="flex items-start justify-center gap-3 text-center lg:mt-8 lg:justify-end lg:text-right">
            <div>
              <h3 className="font-serif text-xl font-semibold leading-tight text-[#16325c]">
                Save your favorite spots.
              </h3>
              <p className="mt-2 text-sm leading-snug text-[#3e5168]">
                Keep the places you care about close at hand, and always know what
                conditions to expect before you go.
              </p>
            </div>
            <span className="mt-0.5 hidden lg:flex">
              <HeartIcon />
            </span>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#16325c]">
        <img
          src={MARKETING_SCENIC_PHOTO}
          alt="Daytime Crissy Field and the Golden Gate"
          className="absolute inset-0 h-full w-full object-cover object-[center_70%]"
        />
        <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-8 lg:py-8">
          <div className="max-w-lg text-white">
            <h2 className="font-serif text-4xl font-semibold leading-[1.12] tracking-tight sm:text-5xl lg:text-[2.15rem] lg:leading-[1.02]">
              Different skies.
              <span className="mt-1 block">A brighter day.</span>
            </h2>
            <p className="mt-4 max-w-md text-base leading-normal [text-shadow:0_0_2px_rgba(0,0,0,1),0_1px_2px_rgba(0,0,0,0.95),0_2px_8px_rgba(0,0,0,0.85)] lg:mt-3 lg:leading-snug">
              From foggy mornings to sunny afternoons,
              <br className="hidden sm:block" />
              the Bay Area always keeps things interesting.
              <br className="hidden sm:block" />
              Where&apos;s Karl helps you find the best of it.
            </p>
          </div>
          <div className="w-full max-w-[25rem] justify-self-start rounded-2xl bg-white/95 px-3.5 py-3 text-[#16325c] shadow-[0_12px_32px_rgba(8,18,32,0.22)] lg:justify-self-end">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#16325c]">
                <KarlLogo className="h-7 w-7" size={64} />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-serif text-base font-semibold leading-tight">
                  Where&apos;s Karl for iPhone
                </h3>
                <p className="mt-0.5 text-xs leading-snug text-[#3e5168]">See the Bay Area more clearly.</p>
              </div>
              <AppStoreBadge />
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter lockup="landing" />
    </div>
  );
}
