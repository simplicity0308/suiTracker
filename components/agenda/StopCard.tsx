"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CATEGORIES, CATEGORY_COLORS } from "@/lib/constants";
import { googleMapsUrl } from "@/lib/utils";
import type { Stop } from "@/lib/types";
import { DeleteStopButton } from "./DeleteStopButton";

export function StopCard({ stop }: { stop: Stop }) {
  const categoryLabel =
    CATEGORIES.find((c) => c.value === stop.category)?.label ?? stop.category;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stop.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-2 rounded-md border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="mt-0.5 cursor-grab touch-none text-zinc-400 active:cursor-grabbing"
        aria-label="Drag to reorder stop"
      >
        ⠿
      </button>
      <div className="flex-1">
        <p className="font-medium">{stop.name}</p>
        <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-zinc-500">
          <span
            className="rounded-full px-1.5 py-0.5 text-[10px] font-medium text-white"
            style={{ backgroundColor: CATEGORY_COLORS[stop.category] }}
          >
            {categoryLabel}
          </span>
          {stop.address && <span>{stop.address}</span>}
        </p>
        {stop.note && (
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">{stop.note}</p>
        )}
        <a
          href={googleMapsUrl(stop)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-block text-xs text-blue-600 hover:underline dark:text-blue-400"
        >
          Open in Maps
        </a>
      </div>
      <DeleteStopButton id={stop.id} />
    </div>
  );
}
