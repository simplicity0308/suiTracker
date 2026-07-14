"use client";

import { useState, useTransition, type FormEvent } from "react";
import { createStop } from "@/lib/actions/stops";
import { CATEGORIES } from "@/lib/constants";
import { PlaceAutocomplete, type PlaceResult } from "@/components/map/PlaceAutocomplete";
import type { Category, Day } from "@/lib/types";

export function StopForm({
  tripId,
  days,
  defaultDayId = null,
}: {
  tripId: string;
  days: Day[];
  defaultDayId?: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const [place, setPlace] = useState<PlaceResult | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("other");
  const [note, setNote] = useState("");
  const [dayId, setDayId] = useState<string>(defaultDayId ?? "");
  const [error, setError] = useState("");

  function handlePlaceSelect(selected: PlaceResult) {
    setPlace(selected);
    setName(selected.name);
    setError("");
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!place) {
      setError("Search for and select a place first.");
      return;
    }

    startTransition(async () => {
      try {
        await createStop({
          tripId,
          dayId: dayId || null,
          name: name || place.name,
          address: place.address,
          lat: place.lat,
          lng: place.lng,
          placeId: place.placeId,
          category,
          note: note || undefined,
        });
        setPlace(null);
        setName("");
        setNote("");
        setCategory("other");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
    >
      <PlaceAutocomplete onPlaceSelect={handlePlaceSelect} />

      {place && (
        <div className="rounded-md bg-zinc-50 px-3 py-2 text-xs text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
          {place.address || `${place.lat.toFixed(4)}, ${place.lng.toFixed(4)}`}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <input
          required
          placeholder="Display name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="col-span-2 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          value={dayId}
          onChange={(e) => setDayId(e.target.value)}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="">Unscheduled</option>
          {days.map((d) => (
            <option key={d.id} value={d.id}>
              {d.label}
            </option>
          ))}
        </select>
        <textarea
          placeholder="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          className="col-span-2 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={pending || !place}
        className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
      >
        {pending ? "Adding…" : "Add stop"}
      </button>
    </form>
  );
}
