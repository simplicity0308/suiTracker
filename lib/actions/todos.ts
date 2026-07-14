"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const createTodoSchema = z.object({
  tripId: z.string().uuid(),
  title: z.string().min(1),
  dueDate: z.string().optional(),
  dueTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
    .optional(),
  sortOrder: z.number().int(),
});

export async function createTodo(input: z.infer<typeof createTodoSchema>) {
  const { tripId, title, dueDate, dueTime, sortOrder } =
    createTodoSchema.parse(input);
  const supabase = await createClient();
  const { error } = await supabase.from("todos").insert({
    trip_id: tripId,
    title,
    due_date: dueDate || null,
    due_time: dueTime || null,
    sort_order: sortOrder,
  });
  if (error) throw error;
}

export async function toggleTodo(id: string, done: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("todos").update({ done }).eq("id", id);
  if (error) throw error;
}

export async function deleteTodo(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("todos").delete().eq("id", id);
  if (error) throw error;
}
