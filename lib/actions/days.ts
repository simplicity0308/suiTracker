"use server";

import { revalidatePath } from "next/cache";
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
  revalidatePath("/trip/agenda");
}

export async function renameDay(dayId: string, label: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("days")
    .update({ label })
    .eq("id", dayId);
  if (error) throw error;
  revalidatePath("/trip/agenda");
}

export async function deleteDay(dayId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("days").delete().eq("id", dayId);
  if (error) throw error;
  revalidatePath("/trip/agenda");
}
