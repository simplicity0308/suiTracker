"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CATEGORIES, CATEGORY_COLORS } from "@/lib/constants";
import { formatTimeRange, getCreatorLabel, googleMapsUrl } from "@/lib/utils";
import type { Profile, Stop } from "@/lib/types";
import { DeleteStopButton } from "./DeleteStopButton";

export function StopCard({
  stop,
  isNextUp = false,
  profiles = [],
}: {
  stop: Stop;
  isNextUp?: boolean;
  profiles?: Profile[];
}) {
  const categoryLabel =
    CATEGORIES.find((c) => c.value === stop.category)?.label ?? stop.category;
  const timeRange = formatTimeRange(stop);
  const creatorLabel = getCreatorLabel(stop.created_by, profiles);

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
      className={`flex items-start gap-2 rounded-md border bg-white p-3 text-sm dark:bg-zinc-950 ${
        isNextUp
          ? "border-l-4 border-blue-500 dark:border-l-blue-400"
          : "border-zinc-200 dark:border-zinc-800"
      }`}
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
        <p className="flex items-center gap-1.5 font-medium">
          {stop.name}
          {isNextUp && (
            <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
              Next up
            </span>
          )}
        </p>
        {timeRange && (
          <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            {timeRange}
          </p>
        )}
        <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-zinc-500">
          <span
            className="rounded-full px-1.5 py-0.5 text-xs font-medium text-white"
            style={{ backgroundColor: CATEGORY_COLORS[stop.category] }}
          >
            {categoryLabel}
          </span>
          {creatorLabel && (
            <span className="rounded-full bg-zinc-200 px-1.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
              {creatorLabel}
            </span>
          )}
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
      <DeleteStopButton id={stop.id} name={stop.name} />
    </div>
  );
}
