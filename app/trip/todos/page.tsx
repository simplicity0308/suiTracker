"use client";

import { TodoList } from "@/components/agenda/TodoList";
import { useTripData } from "@/hooks/useTripData";

export default function TodosPage() {
  const { data, isPending, isError, error } = useTripData();

  if (isPending) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <p className="text-sm text-zinc-500">Loading…</p>
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

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-6">
      <TodoList
        tripId={data.trip.id}
        todos={data.todos}
        days={data.days}
        stops={data.stops}
      />
    </main>
  );
}
