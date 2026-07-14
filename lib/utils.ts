import type { Stop } from "./types";

export function googleMapsUrl(stop: Pick<Stop, "lat" | "lng" | "place_id">) {
  const params = new URLSearchParams({
    api: "1",
    query: `${stop.lat},${stop.lng}`,
  });
  if (stop.place_id) params.set("query_place_id", stop.place_id);
  return `https://www.google.com/maps/search/?${params.toString()}`;
}
