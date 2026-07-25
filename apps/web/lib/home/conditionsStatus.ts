export type ConditionsPresentation =
  | "loading"
  | "live"
  | "estimated"
  | "cached"
  | "unavailable";

export function resolveConditionsPresentation(input: {
  isLoading: boolean;
  hasLoadedWeather: boolean;
  loadedFromLastKnown: boolean;
  currentSource?: "live" | "mock";
}): ConditionsPresentation {
  if (input.isLoading && !input.hasLoadedWeather) {
    return "loading";
  }

  if (!input.hasLoadedWeather) {
    return input.isLoading ? "loading" : "unavailable";
  }

  if (input.loadedFromLastKnown) {
    return "cached";
  }

  if (input.currentSource === "live") {
    return "live";
  }

  if (input.currentSource === "mock") {
    return "estimated";
  }

  return "unavailable";
}

export function conditionsStatusLabel(
  presentation: ConditionsPresentation,
): string {
  switch (presentation) {
    case "loading":
      return "Checking conditions";
    case "live":
      return "Live conditions";
    case "estimated":
      return "Estimated conditions";
    case "cached":
      return "Saved conditions";
    case "unavailable":
      return "Conditions unavailable";
  }
}

export function conditionsStatusAccessibilityLabel(
  presentation: ConditionsPresentation,
): string {
  switch (presentation) {
    case "loading":
      return "Checking conditions";
    case "live":
      return "Showing live Bay Area conditions";
    case "estimated":
      return "Showing estimated Bay Area conditions";
    case "cached":
      return "Showing recently saved Bay Area conditions";
    case "unavailable":
      return "Bay Area conditions are currently unavailable";
  }
}
