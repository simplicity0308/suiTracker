"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createDay } from "@/lib/actions/days";
import { TRIP_DATA_KEY } from "@/hooks/useTripData";

export function AddDayForm({
  tripId,
  nextSortOrder,
}: {
  tripId: string;
  nextSortOrder: number;
}) {
  const [label, setLabel] = useState("");
  const [dayDate, setDayDate] = useState("");
  const [pending, startTransition] = useTransition();
  const queryClient = useQueryClient();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await createDay({
        tripId,
        label,
        dayDate: dayDate || undefined,
        sortOrder: nextSortOrder,
      });
      setLabel("");
      setDayDate("");
      queryClient.invalidateQueries({ queryKey: TRIP_DATA_KEY });
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-2 rounded-lg border border-dashed border-zinc-300 p-3 dark:border-zinc-700"
    >
      <div className="min-w-[160px] flex-1">
        <label className="block text-xs text-zinc-500">Day label</label>
        <input
          required
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Day 3: Kyoto"
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>
      <div>
        <label className="block text-xs text-zinc-500">Date (optional)</label>
        <input
          type="date"
          value={dayDate}
          onChange={(e) => setDayDate(e.target.value)}
          className="mt-1 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
      >
        {pending ? "Adding…" : "Add day"}
      </button>
    </form>
  );
}
