"use client";

import { useState } from "react";
import { AddDayForm } from "@/components/agenda/AddDayForm";
import { AgendaBoard } from "@/components/agenda/AgendaBoard";
import { TripDatesForm } from "@/components/agenda/TripDatesForm";
import { useTripData } from "@/hooks/useTripData";

export default function AgendaPage() {
  const { data, isPending, isError, error } = useTripData();
  const [showSettings, setShowSettings] = useState(false);

  if (isPending) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <p className="text-sm text-zinc-500">Loading your itinerary…</p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <p className="text-sm text-red-600">
          {isError && error instanceof Error
            ? error.message
            : "No trip found for your account yet. Make sure the trip has been seeded and your user added to trip_members."}
        </p>
      </main>
    );
  }

  const {
    trip,
    days: dayList,
    stops: stopList,
    todos: todoList,
    profiles: profileList,
  } = data;

  return (
    <main className="mx-auto max-w-3xl space-y-8 p-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">{trip.name}</h1>
          <button
            type="button"
            onClick={() => setShowSettings((v) => !v)}
            aria-label="Trip settings"
            aria-expanded={showSettings}
            className="rounded-md p-1.5 text-lg text-zinc-400 hover:bg-zinc-200/50 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            ⚙
          </button>
        </div>

        {showSettings && (
          <div className="space-y-6 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <div className="space-y-3">
              <TripDatesForm trip={trip} />
              <p className="text-xs text-zinc-500">
                Saving a date range fills in any missing days automatically —
                existing days (and their stops) are never touched or
                renumbered.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Add a day
              </h2>
              <AddDayForm tripId={trip.id} nextSortOrder={dayList.length} />
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-zinc-500">
        To add a stop, search for it on the Map tab and assign it to a day
        there. Drag stops (and days) to reorder.
      </p>

      <AgendaBoard
        days={dayList}
        stops={stopList}
        todos={todoList}
        profiles={profileList}
      />
    </main>
  );
}
