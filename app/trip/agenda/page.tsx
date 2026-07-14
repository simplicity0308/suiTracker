import { createClient } from "@/lib/supabase/server";
import { AddDayForm } from "@/components/agenda/AddDayForm";
import { AgendaBoard } from "@/components/agenda/AgendaBoard";
import type { Day, Stop } from "@/lib/types";

export default async function AgendaPage() {
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

  return (
    <main className="mx-auto max-w-3xl space-y-8 p-6">
      <div>
        <h1 className="text-lg font-semibold">{trip.name}</h1>
        {trip.start_date && trip.end_date && (
          <p className="text-sm text-zinc-500">
            {trip.start_date} – {trip.end_date}
          </p>
        )}
      </div>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Add a day
        </h2>
        <AddDayForm tripId={trip.id} nextSortOrder={dayList.length} />
      </section>

      <p className="text-xs text-zinc-500">
        To add a stop, search for it on the Map tab and assign it to a day
        there. Drag stops (and days) to reorder.
      </p>

      <AgendaBoard days={dayList} stops={stopList} />
    </main>
  );
}
