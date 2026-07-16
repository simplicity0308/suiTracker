"use client";

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useQueryClient } from "@tanstack/react-query";
import type { Day, Profile, Stop, StopWeather, Todo } from "@/lib/types";
import { renameDay, deleteDay } from "@/lib/actions/days";
import { deleteTodo, toggleTodo } from "@/lib/actions/todos";
import { TRIP_DATA_KEY } from "@/hooks/useTripData";
import { formatDayDate, isToday } from "@/lib/utils";
import { StopCard } from "./StopCard";
import { TodoRow } from "./TodoRow";

type Entry =
  | { kind: "stop"; id: string; time: string | null; order: number; stop: Stop }
  | { kind: "todo"; id: string; time: string | null; order: number; todo: Todo };

function buildEntries(stops: Stop[], todos: Todo[]): Entry[] {
  const entries: Entry[] = [
    ...stops.map((s) => ({
      kind: "stop" as const,
      id: s.id,
      time: s.start_time,
      order: s.sort_order,
      stop: s,
    })),
    ...todos.map((t) => ({
      kind: "todo" as const,
      id: t.id,
      time: t.due_time,
      order: 1000 + t.sort_order,
      todo: t,
    })),
  ];

  entries.sort((a, b) => {
    if (a.time && b.time) return a.time.localeCompare(b.time);
    if (a.time && !b.time) return -1;
    if (!a.time && b.time) return 1;
    return a.order - b.order;
  });

  return entries;
}

export function DayColumn({
  day,
  stops,
  todos = [],
  nextStopId,
  nextTodoId,
  profiles = [],
  weatherByStopId,
}: {
  day: Day | null;
  stops: Stop[];
  todos?: Todo[];
  nextStopId?: string | null;
  nextTodoId?: string | null;
  profiles?: Profile[];
  weatherByStopId?: Record<string, StopWeather>;
}) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(day?.label ?? "");
  const queryClient = useQueryClient();

  const containerId = day ? `container:${day.id}` : "container:unscheduled";
  const { setNodeRef: setDroppableRef } = useDroppable({ id: containerId });

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: day?.id ?? "unscheduled-noop", disabled: day === null });

  const style = day
    ? {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: TRIP_DATA_KEY });
  }

  function handleRenameSubmit() {
    setEditing(false);
    if (day && label.trim() && label.trim() !== day.label) {
      renameDay(day.id, label.trim()).then(invalidate);
    } else if (day) {
      setLabel(day.label);
    }
  }

  function handleDelete() {
    if (!day) return;
    if (confirm(`Delete "${day.label}"? Its stops will move to Unscheduled.`)) {
      deleteDay(day.id).then(invalidate);
    }
  }

  const entries = buildEntries(stops, todos);

  const previousStopByStopId = new Map<string, Stop>();
  {
    let lastStop: Stop | null = null;
    for (const entry of entries) {
      if (entry.kind === "stop") {
        if (lastStop) previousStopByStopId.set(entry.id, lastStop);
        lastStop = entry.stop;
      }
    }
  }

  return (
    <div ref={day ? setSortableRef : undefined} style={style} className="space-y-2">
      <div className="flex items-center gap-2">
        {day && (
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="cursor-grab touch-none text-zinc-400 active:cursor-grabbing"
            aria-label="Drag to reorder day"
          >
            ⠿
          </button>
        )}
        {editing && day ? (
          <input
            autoFocus
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRenameSubmit();
              if (e.key === "Escape") {
                setLabel(day.label);
                setEditing(false);
              }
            }}
            className="rounded-md border border-zinc-300 px-2 py-1 text-sm font-semibold dark:border-zinc-700 dark:bg-zinc-900"
          />
        ) : (
          <h2
            onClick={() => day && setEditing(true)}
            className={`text-sm font-semibold text-zinc-700 dark:text-zinc-300 ${
              day ? "cursor-pointer hover:underline" : ""
            }`}
          >
            {day ? day.label : "Unscheduled"}
            {day?.day_date && (
              <span className="ml-1.5 font-normal text-zinc-400">
                — {formatDayDate(day.day_date)}
              </span>
            )}
          </h2>
        )}
        {day && isToday(day.day_date) && (
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
            Today
          </span>
        )}
        {day && (
          <button
            type="button"
            onClick={handleDelete}
            className="ml-auto text-xs text-red-600 hover:underline"
          >
            Delete day
          </button>
        )}
      </div>

      <div ref={setDroppableRef} className="min-h-[40px] space-y-2 rounded-md">
        {entries.length === 0 && (
          <p className="text-xs text-zinc-400">Nothing yet.</p>
        )}
        <SortableContext
          items={stops.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          {entries.map((entry) =>
            entry.kind === "stop" ? (
              <StopCard
                key={entry.id}
                stop={entry.stop}
                isNextUp={entry.id === nextStopId}
                profiles={profiles}
                weather={weatherByStopId?.[entry.id]}
                previousStop={previousStopByStopId.get(entry.id) ?? null}
              />
            ) : (
              <TodoRow
                key={entry.id}
                todo={entry.todo}
                isNextUp={entry.id === nextTodoId}
                showDate={false}
                onToggle={() =>
                  toggleTodo(entry.todo.id, !entry.todo.done).then(invalidate)
                }
                onDelete={() => deleteTodo(entry.todo.id).then(invalidate)}
                profiles={profiles}
              />
            )
          )}
        </SortableContext>
      </div>
    </div>
  );
}
