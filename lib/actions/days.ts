"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const createDaySchema = z.object({
  tripId: z.string().uuid(),
  label: z.string().min(1),
  dayDate: z.string().optional(),
  sortOrder: z.number().int(),
});

export async function createDay(input: z.infer<typeof createDaySchema>) {
  const { tripId, label, dayDate, sortOrder } = createDaySchema.parse(input);
  const supabase = await createClient();
  const { error } = await supabase.from("days").insert({
    trip_id: tripId,
    label,
    day_date: dayDate || null,
    sort_order: sortOrder,
  });
  if (error) throw error;
}

export async function renameDay(dayId: string, label: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("days")
    .update({ label })
    .eq("id", dayId);
  if (error) throw error;
}

export async function deleteDay(dayId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("days").delete().eq("id", dayId);
  if (error) throw error;
}

export async function reorderDays(orderedIds: string[]) {
  const ids = z.array(z.string().uuid()).parse(orderedIds);
  const supabase = await createClient();

  const results = await Promise.all(
    ids.map((id, index) =>
      supabase.from("days").update({ sort_order: index }).eq("id", id)
    )
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) throw failed.error;
}
