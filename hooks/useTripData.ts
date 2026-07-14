"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Day, Profile, Stop, Todo, Trip } from "@/lib/types";

export const TRIP_DATA_KEY = ["trip-data"];

export function useTripData() {
  return useQuery({
    queryKey: TRIP_DATA_KEY,
    queryFn: async () => {
      const supabase = createClient();

      const { data: trip, error: tripError } = await supabase
        .from("trips")
        .select("*")
        .limit(1)
        .single();
      if (tripError || !trip) {
        throw tripError ?? new Error("No trip found for your account yet.");
      }

      const [{ data: days }, { data: stops }, { data: todos }, { data: profiles }] =
        await Promise.all([
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
          supabase
            .from("todos")
            .select("*")
            .eq("trip_id", trip.id)
            .order("sort_order"),
          supabase.from("profiles").select("*"),
        ]);

      return {
        trip: trip as Trip,
        days: (days ?? []) as Day[],
        stops: (stops ?? []) as Stop[],
        todos: (todos ?? []) as Todo[],
        profiles: (profiles ?? []) as Profile[],
      };
    },
    staleTime: 60_000,
  });
}
