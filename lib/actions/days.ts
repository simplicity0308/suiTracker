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

function parseISODate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function datesInRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const cursor = parseISODate(startDate);
  const end = parseISODate(endDate);
  while (cursor <= end) {
    dates.push(formatISODate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

const setTripDatesSchema = z.object({
  tripId: z.string().uuid(),
  startDate: z.string(),
  endDate: z.string(),
});

export async function setTripDatesAndGenerateDays(
  input: z.infer<typeof setTripDatesSchema>
) {
  const { tripId, startDate, endDate } = setTripDatesSchema.parse(input);
  const supabase = await createClient();

  const dates = datesInRange(startDate, endDate);
  if (dates.length > 60) {
    throw new Error("That date range is over 60 days — double-check it.");
  }

  const { error: tripError } = await supabase
    .from("trips")
    .update({ start_date: startDate, end_date: endDate })
    .eq("id", tripId);
  if (tripError) throw tripError;

  const { data: existingDays, error: fetchError } = await supabase
    .from("days")
    .select("id, day_date, sort_order")
    .eq("trip_id", tripId);
  if (fetchError) throw fetchError;

  const existingDates = new Set(
    (existingDays ?? []).map((d) => d.day_date).filter((d): d is string => !!d)
  );

  const toInsert = dates
    .map((date, i) => ({ date, label: `Day ${i + 1}` }))
    .filter(({ date }) => !existingDates.has(date))
    .map(({ date, label }) => ({
      trip_id: tripId,
      day_date: date,
      label,
      sort_order: 0,
    }));

  if (toInsert.length > 0) {
    const { error: insertError } = await supabase.from("days").insert(toInsert);
    if (insertError) throw insertError;
  }

  const { data: allDays, error: allDaysError } = await supabase
    .from("days")
    .select("id, day_date, sort_order")
    .eq("trip_id", tripId);
  if (allDaysError) throw allDaysError;

  const sorted = [...(allDays ?? [])].sort((a, b) => {
    if (a.day_date && b.day_date) return a.day_date.localeCompare(b.day_date);
    if (a.day_date && !b.day_date) return -1;
    if (!a.day_date && b.day_date) return 1;
    return a.sort_order - b.sort_order;
  });

  const results = await Promise.all(
    sorted.map((d, i) =>
      supabase.from("days").update({ sort_order: i }).eq("id", d.id)
    )
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) throw failed.error;
}
