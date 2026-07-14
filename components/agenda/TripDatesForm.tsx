"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { setTripDatesAndGenerateDays } from "@/lib/actions/days";
import { TRIP_DATA_KEY } from "@/hooks/useTripData";
import type { Trip } from "@/lib/types";

export function TripDatesForm({ trip }: { trip: Trip }) {
  const [startDate, setStartDate] = useState(trip.start_date ?? "");
  const [endDate, setEndDate] = useState(trip.end_date ?? "");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const queryClient = useQueryClient();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!startDate || !endDate) return;

    startTransition(async () => {
      try {
        await setTripDatesAndGenerateDays({
          tripId: trip.id,
          startDate,
          endDate,
        });
        queryClient.invalidateQueries({ queryKey: TRIP_DATA_KEY });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2">
      <div>
        <label className="block text-xs text-zinc-500">Trip start</label>
        <input
          type="date"
          required
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="mt-1 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>
      <div>
        <label className="block text-xs text-zinc-500">Trip end</label>
        <input
          type="date"
          required
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="mt-1 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
      >
        {pending ? "Saving…" : "Save dates & generate days"}
      </button>
      {error && <p className="w-full text-sm text-red-600">{error}</p>}
    </form>
  );
}
