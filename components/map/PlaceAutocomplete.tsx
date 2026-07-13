"use client";

import { useEffect, useRef, useState } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";

export type PlaceResult = {
  name: string;
  address: string;
  lat: number;
  lng: number;
  placeId: string;
};

export function PlaceAutocomplete({
  onPlaceSelect,
}: {
  onPlaceSelect: (place: PlaceResult) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const placesLib = useMapsLibrary("places");
  const [autocomplete, setAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!placesLib || !inputRef.current) return;

    const ac = new placesLib.Autocomplete(inputRef.current, {
      fields: ["place_id", "geometry", "name", "formatted_address"],
    });
    setAutocomplete(ac);

    return () => {
      google.maps.event.clearInstanceListeners(ac);
    };
  }, [placesLib]);

  useEffect(() => {
    if (!autocomplete) return;

    const listener = autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.geometry?.location || !place.place_id) return;

      onPlaceSelect({
        name: place.name ?? "",
        address: place.formatted_address ?? "",
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        placeId: place.place_id,
      });
    });

    return () => listener.remove();
  }, [autocomplete, onPlaceSelect]);

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder="Search for a place…"
      className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
    />
  );
}
