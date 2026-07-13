"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const categoryEnum = z.enum([
  "food",
  "sight",
  "hotel",
  "transport",
  "shopping",
  "other",
]);

const createStopSchema = z.object({
  tripId: z.string().uuid(),
  dayId: z.string().uuid().nullable(),
  name: z.string().min(1),
  address: z.string().optional(),
  lat: z.number(),
  lng: z.number(),
  placeId: z.string().optional(),
  category: categoryEnum,
  note: z.string().optional(),
  sortOrder: z.number().int(),
});

export async function createStop(input: z.infer<typeof createStopSchema>) {
  const parsed = createStopSchema.parse(input);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("stops").insert({
    trip_id: parsed.tripId,
    day_id: parsed.dayId,
    name: parsed.name,
    address: parsed.address || null,
    lat: parsed.lat,
    lng: parsed.lng,
    place_id: parsed.placeId || null,
    category: parsed.category,
    note: parsed.note || null,
    sort_order: parsed.sortOrder,
    created_by: user?.id ?? null,
  });
  if (error) throw error;
  revalidatePath("/trip/agenda");
  revalidatePath("/trip/map");
}

const updateStopSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).optional(),
  category: categoryEnum.optional(),
  note: z.string().nullable().optional(),
  dayId: z.string().uuid().nullable().optional(),
  sortOrder: z.number().int().optional(),
});

export async function updateStop(input: z.infer<typeof updateStopSchema>) {
  const { id, ...rest } = updateStopSchema.parse(input);
  const supabase = await createClient();

  const patch: Record<string, unknown> = {};
  if (rest.name !== undefined) patch.name = rest.name;
  if (rest.category !== undefined) patch.category = rest.category;
  if (rest.note !== undefined) patch.note = rest.note;
  if (rest.dayId !== undefined) patch.day_id = rest.dayId;
  if (rest.sortOrder !== undefined) patch.sort_order = rest.sortOrder;

  const { error } = await supabase.from("stops").update(patch).eq("id", id);
  if (error) throw error;
  revalidatePath("/trip/agenda");
  revalidatePath("/trip/map");
}

export async function deleteStop(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("stops").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/trip/agenda");
  revalidatePath("/trip/map");
}
