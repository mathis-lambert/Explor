function inferThemeFromPreferences(preferences) {
  if (!preferences || preferences.length === 0) {
    return "Grand Highlights";
  }

  return preferences.slice(0, 2).join(" & ");
}

function buildStopName(zoneName, index) {
  if (index === 0) {
    return `Start: ${zoneName} Entry`;
  }

  return `${zoneName} Gallery ${index + 1}`;
}

export function buildRouteFromPreferences({ zones = [], preferences = [] }) {
  const selectedZones = zones.slice(0, 3);
  const routeName = `${inferThemeFromPreferences(preferences)} Route`;

  const timelineStops = selectedZones.flatMap((zone, zoneIndex) => {
    const stopCount = zoneIndex === 0 ? 2 : 3;

    return Array.from({ length: stopCount }).map((_, stopIndex) => ({
      name: buildStopName(zone.name, stopIndex),
      detail: stopIndex === 0 ? "Orientation stop" : `~${12 + stopIndex * 4} min`,
    }));
  });

  const stops = [
    { name: "Start: Great Hall Entrance", detail: "Meeting point" },
    ...timelineStops,
    { name: "End: Museum Store", detail: "Final stop" },
  ];

  return {
    id: `route-${Date.now()}`,
    name: routeName,
    duration: `${Math.max(90, stops.length * 14)} min`,
    stops: stops.length,
    zones: selectedZones.map((zone) => zone.name),
    description:
      preferences.length > 0
        ? `Curated around your interests: ${preferences.slice(0, 3).join(", ")}.`
        : "A balanced route through the museum's most iconic departments.",
    timeline: stops,
    generatedFromPreferences: preferences.length > 0,
  };
}

export function buildPresetRoute(route, zoneNames = []) {
  const safeZones = zoneNames.length > 0 ? zoneNames : ["Great Hall", "European Paintings", "Modern Art"];

  const timeline = [
    { name: "Start: Great Hall Entrance", detail: "Meeting point" },
    ...safeZones.map((zoneName, index) => ({
      name: `${zoneName} Stop ${index + 1}`,
      detail: `~${14 + index * 3} min`,
    })),
    { name: "End: Museum Store", detail: "Final stop" },
  ];

  return {
    id: route.id,
    name: route.name,
    duration: route.duration,
    stops: route.stops,
    zones: safeZones,
    description: route.description,
    timeline,
    generatedFromPreferences: false,
  };
}
