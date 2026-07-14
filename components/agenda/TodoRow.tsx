"use client";

import { formatTime } from "@/lib/utils";
import type { Todo } from "@/lib/types";

export function TodoRow({
  todo,
  isNextUp,
  onToggle,
  onDelete,
  showDate = true,
}: {
  todo: Todo;
  isNextUp: boolean;
  onToggle: () => void;
  onDelete: () => void;
  showDate?: boolean;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const overdue = !todo.done && !!todo.due_date && todo.due_date < today;

  return (
    <div
      className={`flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm dark:bg-zinc-950 ${
        isNextUp
          ? "border-l-4 border-blue-500 dark:border-l-blue-400"
          : "border-zinc-200 dark:border-zinc-800"
      }`}
    >
      <input
        type="checkbox"
        checked={todo.done}
        onChange={onToggle}
        className="h-4 w-4"
      />
      <span
        className={`flex flex-1 items-center gap-1.5 ${
          todo.done ? "text-zinc-400 line-through" : ""
        }`}
      >
        {todo.title}
        {isNextUp && (
          <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
            Next up
          </span>
        )}
      </span>
      {todo.due_date && (
        <span
          className={`text-xs ${
            overdue ? "font-medium text-red-600" : "text-zinc-500"
          }`}
        >
          {showDate && todo.due_date}
          {showDate && todo.due_time && " · "}
          {todo.due_time && formatTime(todo.due_time)}
        </span>
      )}
      <button
        type="button"
        onClick={onDelete}
        className="text-xs text-red-600 hover:underline"
      >
        Remove
      </button>
    </div>
  );
}
