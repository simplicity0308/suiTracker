"use client";

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Day, Stop } from "@/lib/types";
import { renameDay, deleteDay } from "@/lib/actions/days";
import { StopCard } from "./StopCard";

export function DayColumn({ day, stops }: { day: Day | null; stops: Stop[] }) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(day?.label ?? "");

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

  function handleRenameSubmit() {
    setEditing(false);
    if (day && label.trim() && label.trim() !== day.label) {
      renameDay(day.id, label.trim());
    } else if (day) {
      setLabel(day.label);
    }
  }

  function handleDelete() {
    if (!day) return;
    if (confirm(`Delete "${day.label}"? Its stops will move to Unscheduled.`)) {
      deleteDay(day.id);
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
          </h2>
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
        {stops.length === 0 && (
          <p className="text-xs text-zinc-400">No stops yet.</p>
        )}
        <SortableContext
          items={stops.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          {stops.map((stop) => (
            <StopCard key={stop.id} stop={stop} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
