export type MapMarkerLocation = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  sunshineScore: number;
};

export function mapMarkerAriaLabel(
  location: MapMarkerLocation,
  isSelected: boolean,
): string {
  if (isSelected) {
    return `${location.name}, selected, sunshine score ${location.sunshineScore}`;
  }

  return `${location.name}, sunshine score ${location.sunshineScore}`;
}

export function createMapMarkerElement(input: {
  location: MapMarkerLocation;
  isSelected: boolean;
  onSelect: (locationId: string) => void;
}): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.className = input.isSelected
    ? "karl-map-marker is-selected"
    : "karl-map-marker";
  button.dataset.locationId = input.location.id;
  button.dataset.testid = `map-marker-${input.location.id}`;
  button.setAttribute(
    "aria-label",
    mapMarkerAriaLabel(input.location, input.isSelected),
  );
  button.setAttribute("aria-pressed", input.isSelected ? "true" : "false");
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    input.onSelect(input.location.id);
  });

  return button;
}
