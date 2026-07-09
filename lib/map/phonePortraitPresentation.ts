import { isNighttime } from "@/lib/home/weatherDisplay";

export type PhonePortraitPresentationOptions = {
  isNighttime?: boolean;
};

/** Shared day/night resolution for phone-portrait web presentation. */
export function resolvePhonePortraitIsNighttime(
  options: PhonePortraitPresentationOptions = {},
  date = new Date(),
): boolean {
  return options.isNighttime ?? isNighttime(date.getHours());
}
