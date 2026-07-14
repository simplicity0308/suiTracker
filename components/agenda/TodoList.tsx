"use client";

import { useMemo, useState, useTransition, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createTodo, deleteTodo, toggleTodo } from "@/lib/actions/todos";
import { TRIP_DATA_KEY } from "@/hooks/useTripData";
import { getNextUpcomingItem } from "@/lib/utils";
import type { Day, Stop, Todo } from "@/lib/types";
import { TimePicker } from "./TimePicker";
import { TodoRow } from "./TodoRow";

function sortTodos(todos: Todo[]) {
  return [...todos].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    if (!a.due_date && !b.due_date) return a.sort_order - b.sort_order;
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    if (a.due_date !== b.due_date) return a.due_date.localeCompare(b.due_date);
    if (!a.due_time && !b.due_time) return a.sort_order - b.sort_order;
    if (!a.due_time) return 1;
    if (!b.due_time) return -1;
    return a.due_time.localeCompare(b.due_time);
  });
}

export function TodoList({
  tripId,
  todos,
  days = [],
  stops = [],
}: {
  tripId: string;
  todos: Todo[];
  days?: Day[];
  stops?: Stop[];
}) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [pending, startTransition] = useTransition();
  const queryClient = useQueryClient();

  const nextItem = useMemo(
    () => getNextUpcomingItem(days, stops, todos),
    [days, stops, todos]
  );
  const nextTodoId = nextItem?.kind === "todo" ? nextItem.id : null;

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: TRIP_DATA_KEY });
  }

  function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    startTransition(async () => {
      await createTodo({
        tripId,
        title: title.trim(),
        dueDate: dueDate || undefined,
        dueTime: dueTime || undefined,
        sortOrder: todos.length,
      });
      setTitle("");
      setDueDate("");
      setDueTime("");
      invalidate();
    });
  }

  function handleToggle(todo: Todo) {
    startTransition(async () => {
      await toggleTodo(todo.id, !todo.done);
      invalidate();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteTodo(id);
      invalidate();
    });
  }

  const sorted = sortTodos(todos);

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
        To-dos
      </h2>

      {sorted.length === 0 && (
        <p className="text-xs text-zinc-400">No to-dos yet.</p>
      )}

      <div className="space-y-2">
        {sorted.map((todo) => (
          <TodoRow
            key={todo.id}
            todo={todo}
            isNextUp={todo.id === nextTodoId}
            onToggle={() => handleToggle(todo)}
            onDelete={() => handleDelete(todo.id)}
          />
        ))}
      </div>

      <form
        onSubmit={handleAdd}
        className="flex flex-wrap items-end gap-2 rounded-lg border border-dashed border-zinc-300 p-3 dark:border-zinc-700"
      >
        <div className="min-w-[160px] flex-1">
          <label className="block text-xs text-zinc-500">Task</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Buy travel insurance"
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-500">
            Due date (optional)
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="mt-1 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-500">
            Time (optional)
          </label>
          <div className="mt-1">
            <TimePicker value={dueTime} onChange={setDueTime} />
          </div>
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium disabled:opacity-50 dark:border-zinc-700"
        >
          {pending ? "Adding…" : "Add task"}
        </button>
      </form>
    </section>
  );
}
