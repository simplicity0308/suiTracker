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
});

export async function createStop(input: z.infer<typeof createStopSchema>) {
  const parsed = createStopSchema.parse(input);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let lastOrderQuery = supabase
    .from("stops")
    .select("sort_order")
    .eq("trip_id", parsed.tripId)
    .order("sort_order", { ascending: false })
    .limit(1);
  lastOrderQuery =
    parsed.dayId === null
      ? lastOrderQuery.is("day_id", null)
      : lastOrderQuery.eq("day_id", parsed.dayId);
  const { data: lastStop } = await lastOrderQuery;
  const nextSortOrder =
    lastStop && lastStop.length > 0 ? lastStop[0].sort_order + 1 : 0;

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
    sort_order: nextSortOrder,
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

const reorderStopsSchema = z.array(
  z.object({
    id: z.string().uuid(),
    dayId: z.string().uuid().nullable(),
    sortOrder: z.number().int(),
  })
);

export async function reorderStops(
  input: z.infer<typeof reorderStopsSchema>
) {
  const updates = reorderStopsSchema.parse(input);
  const supabase = await createClient();

  const results = await Promise.all(
    updates.map((u) =>
      supabase
        .from("stops")
        .update({ day_id: u.dayId, sort_order: u.sortOrder })
        .eq("id", u.id)
    )
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) throw failed.error;

  revalidatePath("/trip/agenda");
  revalidatePath("/trip/map");
}
