"use client";

import { useState, useTransition, type FormEvent } from "react";
import { createStop } from "@/lib/actions/stops";
import { CATEGORIES } from "@/lib/constants";
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
  const [name, setName] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [category, setCategory] = useState<Category>("other");
  const [note, setNote] = useState("");
  const [dayId, setDayId] = useState<string>(defaultDayId ?? "");
  const [error, setError] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const parsedLat = Number(lat);
    const parsedLng = Number(lng);
    if (Number.isNaN(parsedLat) || Number.isNaN(parsedLng)) {
      setError("Latitude and longitude must be numbers.");
      return;
    }

    startTransition(async () => {
      try {
        await createStop({
          tripId,
          dayId: dayId || null,
          name,
          lat: parsedLat,
          lng: parsedLng,
          category,
          note: note || undefined,
          sortOrder: 0,
        });
        setName("");
        setLat("");
        setLng("");
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
      <div className="grid grid-cols-2 gap-3">
        <input
          required
          placeholder="Place name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="col-span-2 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
        <input
          required
          placeholder="Latitude"
          value={lat}
          onChange={(e) => setLat(e.target.value)}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
        <input
          required
          placeholder="Longitude"
          value={lng}
          onChange={(e) => setLng(e.target.value)}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
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
        disabled={pending}
        className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
      >
        {pending ? "Adding…" : "Add stop"}
      </button>
    </form>
  );
}
