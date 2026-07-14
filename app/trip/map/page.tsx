"use client";

import { MapView } from "@/components/map/MapView";
import { StopForm } from "@/components/agenda/StopForm";
import { useTripData } from "@/hooks/useTripData";

export default function MapPage() {
  const { data, isPending, isError, error } = useTripData();

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

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <p className="text-sm text-red-600">
          Google Maps isn&apos;t configured yet — set
          NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local.
        </p>
      </main>
    );
  }

  const { trip, days: dayList, stops: stopList, profiles: profileList } = data;

  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <div className="order-2 w-full space-y-4 border-t border-zinc-200 p-4 dark:border-zinc-800 md:order-1 md:w-96 md:overflow-y-auto md:border-t-0 md:border-r">
        <h1 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Add a stop
        </h1>
        <StopForm tripId={trip.id} days={dayList} />
      </div>
      <div className="order-1 flex-1 md:order-2">
        <MapView stops={stopList} days={dayList} profiles={profileList} />
      </div>
    </div>
  );
}
