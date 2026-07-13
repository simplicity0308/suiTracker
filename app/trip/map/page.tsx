import { createClient } from "@/lib/supabase/server";
import { MapView } from "@/components/map/MapView";
import { StopForm } from "@/components/agenda/StopForm";
import type { Day, Stop } from "@/lib/types";

export default async function MapPage() {
  const supabase = await createClient();

  const { data: trip, error: tripError } = await supabase
    .from("trips")
    .select("*")
    .limit(1)
    .single();

  if (tripError || !trip) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <p className="text-sm text-red-600">
          No trip found for your account yet. Make sure the trip has been
          seeded and your user added to trip_members.
        </p>
      </main>
    );
  }

  const [{ data: days }, { data: stops }] = await Promise.all([
    supabase
      .from("days")
      .select("*")
      .eq("trip_id", trip.id)
      .order("sort_order"),
    supabase
      .from("stops")
      .select("*")
      .eq("trip_id", trip.id)
      .order("sort_order"),
  ]);

  const dayList = (days ?? []) as Day[];
  const stopList = (stops ?? []) as Stop[];

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

  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <div className="order-2 w-full space-y-4 border-t border-zinc-200 p-4 dark:border-zinc-800 md:order-1 md:w-96 md:overflow-y-auto md:border-t-0 md:border-r">
        <h1 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Add a stop
        </h1>
        <StopForm tripId={trip.id} days={dayList} />
      </div>
      <div className="order-1 flex-1 md:order-2">
        <MapView stops={stopList} days={dayList} />
      </div>
    </div>
  );
}
