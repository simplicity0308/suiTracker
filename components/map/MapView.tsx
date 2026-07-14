"use client";

import { useState } from "react";
import { Map as GoogleMap, InfoWindow } from "@vis.gl/react-google-maps";
import type { Day, Profile, Stop } from "@/lib/types";
import { CATEGORIES, getDayColor } from "@/lib/constants";
import { formatTimeRange, getCreatorLabel, googleMapsUrl } from "@/lib/utils";
import { PinMarker } from "./PinMarker";

const DEFAULT_CENTER = { lat: 35.6762, lng: 139.6503 }; // Tokyo
const UNSCHEDULED_COLOR = "#9ca3af";

export function MapView({
  stops,
  days,
  profiles = [],
}: {
  stops: Stop[];
  days: Day[];
  profiles?: Profile[];
}) {
  const [selected, setSelected] = useState<Stop | null>(null);
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID;

  const dayIndexById = new Map(days.map((d, i) => [d.id, i]));
  const dayById = new Map(days.map((d) => [d.id, d]));
  const center = stops[0]
    ? { lat: stops[0].lat, lng: stops[0].lng }
    : DEFAULT_CENTER;

  return (
    <div className="flex h-[calc(100dvh-49px)] w-full flex-col">
      {days.length > 0 && (
        <div className="flex flex-wrap gap-3 border-b border-zinc-200 px-4 py-2 text-xs dark:border-zinc-800">
          {days.map((day, i) => (
            <span key={day.id} className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: getDayColor(i, days.length) }}
              />
              {day.label}
            </span>
          ))}
          <span className="flex items-center gap-1.5 text-zinc-500">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: UNSCHEDULED_COLOR }}
            />
            Unscheduled
          </span>
        </div>
      )}
      <div className="flex-1">
        <GoogleMap
          mapId={mapId}
          defaultCenter={center}
          defaultZoom={12}
          gestureHandling="greedy"
          disableDefaultUI={false}
        >
          {stops.map((stop) => {
            const dayIndex = stop.day_id
              ? dayIndexById.get(stop.day_id)
              : undefined;
            const color =
              dayIndex !== undefined
                ? getDayColor(dayIndex, days.length)
                : UNSCHEDULED_COLOR;

            return (
              <PinMarker
                key={stop.id}
                stop={stop}
                color={color}
                label={
                  dayIndex !== undefined
                    ? String(stop.sort_order + 1)
                    : undefined
                }
                onClick={() => setSelected(stop)}
              />
            );
          })}

          {selected && (
            <InfoWindow
              position={{ lat: selected.lat, lng: selected.lng }}
              onCloseClick={() => setSelected(null)}
            >
              <div className="max-w-[200px] text-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  {selected.day_id
                    ? dayById.get(selected.day_id)?.label ?? "Unscheduled"
                    : "Unscheduled"}
                </p>
                <p className="font-medium">{selected.name}</p>
                {formatTimeRange(selected) && (
                  <p className="text-xs font-medium text-zinc-600">
                    {formatTimeRange(selected)}
                  </p>
                )}
                <p className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-500">
                  <span>
                    {CATEGORIES.find((c) => c.value === selected.category)
                      ?.label ?? selected.category}
                  </span>
                  {getCreatorLabel(selected.created_by, profiles) && (
                    <span className="rounded-full bg-zinc-200 px-1.5 py-0.5 text-xs font-medium text-zinc-700">
                      {getCreatorLabel(selected.created_by, profiles)}
                    </span>
                  )}
                </p>
                {selected.note && (
                  <p className="mt-1 text-zinc-600">{selected.note}</p>
                )}
                <a
                  href={googleMapsUrl(selected)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-blue-600 hover:underline"
                >
                  Open in Maps
                </a>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>
    </div>
  );
}
