/**
 * Visual App Store badge only. There is no approved listing URL yet, so this
 * is not a link and does not navigate anywhere.
 */
export function AppStoreBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex cursor-default items-center gap-2 rounded-lg bg-[#111111] px-3 py-1.5 text-white ${className}`}
      title="App Store listing coming soon"
      aria-label="Download on the App Store. Listing coming soon."
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        className="h-4 w-4 shrink-0"
        fill="currentColor"
      >
        <path d="M11.18 8.45c.02 1.9 1.67 2.53 1.69 2.54-.01.04-.26.9-.87 1.78-.52.76-1.07 1.52-1.92 1.54-.84.02-1.11-.5-2.07-.5-.96 0-1.26.48-2.05.52-.82.03-1.45-.82-1.98-1.58-1.08-1.56-1.9-4.4-.79-6.32.55-.95 1.53-1.56 2.6-1.57.81-.02 1.58.55 2.07.55.49 0 1.4-.68 2.36-.58.4.02 1.53.16 2.26 1.22-.06.04-1.35.79-1.3 2.4ZM9.9 3.72c.43-.52.72-1.24.64-1.97-.62.03-1.37.41-1.81.93-.4.46-.75 1.2-.66 1.9.69.05 1.4-.35 1.83-.86Z" />
      </svg>
      <span className="text-left leading-none">
        <span className="block text-[0.5625rem] font-medium tracking-wide">
          Download on the
        </span>
        <span className="mt-0.5 block text-[0.8125rem] font-semibold tracking-tight">
          App Store
        </span>
      </span>
    </span>
  );
}

/**
 * Compact header pill from the approved marketing mockup. Same pre-launch
 * non-link behavior as the official badge. Not used for the hero or scenic CTAs.
 */
export function HeaderAppStoreCta() {
  return (
    <span
      className="ml-auto inline-flex shrink-0 cursor-default items-center gap-1.5 rounded-full bg-[#0c1c30] px-2.5 py-1 text-[0.6875rem] font-semibold leading-none text-white sm:gap-2 sm:px-3.5 sm:py-1.5 sm:text-[0.8125rem] lg:ml-0"
      title="App Store listing coming soon"
      aria-label="Download on the App Store. Listing coming soon."
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4"
        fill="currentColor"
      >
        <path d="M11.18 8.45c.02 1.9 1.67 2.53 1.69 2.54-.01.04-.26.9-.87 1.78-.52.76-1.07 1.52-1.92 1.54-.84.02-1.11-.5-2.07-.5-.96 0-1.26.48-2.05.52-.82.03-1.45-.82-1.98-1.58-1.08-1.56-1.9-4.4-.79-6.32.55-.95 1.53-1.56 2.6-1.57.81-.02 1.58.55 2.07.55.49 0 1.4-.68 2.36-.58.4.02 1.53.16 2.26 1.22-.06.04-1.35.79-1.3 2.4ZM9.9 3.72c.43-.52.72-1.24.64-1.97-.62.03-1.37.41-1.81.93-.4.46-.75 1.2-.66 1.9.69.05 1.4-.35 1.83-.86Z" />
      </svg>
      <span className="whitespace-nowrap">Download on the App Store</span>
    </span>
  );
}
