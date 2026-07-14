"use client";

import { formatTime, getCreatorLabel } from "@/lib/utils";
import type { Profile, Todo } from "@/lib/types";

export function TodoRow({
  todo,
  isNextUp,
  onToggle,
  onDelete,
  showDate = true,
  profiles = [],
}: {
  todo: Todo;
  isNextUp: boolean;
  onToggle: () => void;
  onDelete: () => void;
  showDate?: boolean;
  profiles?: Profile[];
}) {
  const today = new Date().toISOString().slice(0, 10);
  const overdue = !todo.done && !!todo.due_date && todo.due_date < today;
  const creatorLabel = getCreatorLabel(todo.created_by, profiles);

  return (
    <div
      className={`flex items-start gap-2 rounded-md border bg-white px-3 py-2 text-sm dark:bg-zinc-950 ${
        isNextUp
          ? "border-l-4 border-blue-500 dark:border-l-blue-400"
          : "border-zinc-200 dark:border-zinc-800"
      }`}
    >
      <input
        type="checkbox"
        checked={todo.done}
        onChange={onToggle}
        className="mt-0.5 h-4 w-4"
      />
      <div className="flex-1">
        <p
          className={`flex items-center gap-1.5 ${
            todo.done ? "text-zinc-400 line-through" : ""
          }`}
        >
          {todo.title}
          {isNextUp && (
            <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
              Next up
            </span>
          )}
          {creatorLabel && (
            <span className="rounded-full bg-zinc-200 px-1.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
              {creatorLabel}
            </span>
          )}
        </p>
        {(todo.due_date || todo.due_time) && (
          <p
            className={`text-xs ${
              overdue ? "font-medium text-red-600" : "text-zinc-500"
            }`}
          >
            {showDate && todo.due_date}
            {showDate && todo.due_time && " · "}
            {todo.due_time && formatTime(todo.due_time)}
          </p>
        )}
        {todo.note && (
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">{todo.note}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => {
          if (confirm(`Remove "${todo.title}"?`)) onDelete();
        }}
        className="text-xs text-red-600 hover:underline"
      >
        Remove
      </button>
    </div>
  );
}
