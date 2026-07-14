"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useQueryClient } from "@tanstack/react-query";
import { reorderDays } from "@/lib/actions/days";
import { reorderStops } from "@/lib/actions/stops";
import { TRIP_DATA_KEY } from "@/hooks/useTripData";
import { getNextUpcomingItem } from "@/lib/utils";
import type { Day, Stop, Todo } from "@/lib/types";
import { DayColumn } from "./DayColumn";

const UNSCHEDULED = "container:unscheduled";
const containerKey = (dayId: string | null) =>
  dayId === null ? UNSCHEDULED : `container:${dayId}`;

export function AgendaBoard({
  days: propDays,
  stops: propStops,
  todos,
}: {
  days: Day[];
  stops: Stop[];
  todos: Todo[];
}) {
  const [days, setDays] = useState(propDays);
  const [stops, setStops] = useState(propStops);
  const [activeId, setActiveId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Resync when the underlying query refetches (e.g. a sibling component's
  // mutation invalidated the shared trip-data cache) — local state only
  // exists for optimistic feedback during drags, not as the source of truth.
  useEffect(() => {
    setDays(propDays);
  }, [propDays]);

  useEffect(() => {
    setStops(propStops);
  }, [propStops]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const nextItem = useMemo(
    () => getNextUpcomingItem(days, stops, todos),
    [days, stops, todos]
  );
  const nextStopId = nextItem?.kind === "stop" ? nextItem.id : null;
  const nextTodoId = nextItem?.kind === "todo" ? nextItem.id : null;

  function stopsByDay(dayId: string | null) {
    return stops
      .filter((s) => s.day_id === dayId)
      .sort((a, b) => a.sort_order - b.sort_order);
  }

  function todosForDay(dayDate: string | null) {
    if (!dayDate) return [];
    return todos.filter((t) => t.due_date === dayDate);
  }

  function findContainerOf(id: string): string | null {
    if (id === UNSCHEDULED || id.startsWith("container:")) return id;
    const stop = stops.find((s) => s.id === id);
    if (stop) return containerKey(stop.day_id);
    return null;
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    const isDayDrag = days.some((d) => d.id === activeId);
    if (isDayDrag) {
      const oldIndex = days.findIndex((d) => d.id === activeId);
      const newIndex = days.findIndex((d) => d.id === overId);
      if (oldIndex === -1 || newIndex === -1) return;
      const reordered = arrayMove(days, oldIndex, newIndex);
      setDays(reordered);
      reorderDays(reordered.map((d) => d.id)).then(() =>
        queryClient.invalidateQueries({ queryKey: TRIP_DATA_KEY })
      );
      return;
    }

    const sourceContainer = findContainerOf(activeId);
    const destContainer = findContainerOf(overId);
    if (!sourceContainer || !destContainer) return;

    const destDayId =
      destContainer === UNSCHEDULED
        ? null
        : destContainer.replace("container:", "");

    const moving = stops.find((s) => s.id === activeId);
    if (!moving) return;

    const sourceList = stops
      .filter(
        (s) => containerKey(s.day_id) === sourceContainer && s.id !== activeId
      )
      .sort((a, b) => a.sort_order - b.sort_order);
    const destList =
      sourceContainer === destContainer
        ? sourceList
        : stops
            .filter((s) => containerKey(s.day_id) === destContainer)
            .sort((a, b) => a.sort_order - b.sort_order);

    const overIsContainer =
      overId === UNSCHEDULED || overId.startsWith("container:");
    const insertIndex = overIsContainer
      ? destList.length
      : Math.max(0, destList.findIndex((s) => s.id === overId));

    destList.splice(insertIndex, 0, { ...moving, day_id: destDayId });

    const reindexed: Stop[] = destList.map((s, i) => ({ ...s, sort_order: i }));
    if (sourceContainer !== destContainer) {
      reindexed.push(...sourceList.map((s, i) => ({ ...s, sort_order: i })));
    }

    const reindexedIds = new Set(reindexed.map((s) => s.id));
    const nextStops = [
      ...stops.filter((s) => !reindexedIds.has(s.id)),
      ...reindexed,
    ];

    setStops(nextStops);
    reorderStops(
      reindexed.map((s) => ({
        id: s.id,
        dayId: s.day_id,
        sortOrder: s.sort_order,
      }))
    ).then(() => queryClient.invalidateQueries({ queryKey: TRIP_DATA_KEY }));
  }

  const activeStop = activeId ? stops.find((s) => s.id === activeId) : null;
  const activeDay = activeId ? days.find((d) => d.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={days.map((d) => d.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-6">
          {days.map((day) => (
            <DayColumn
              key={day.id}
              day={day}
              stops={stopsByDay(day.id)}
              todos={todosForDay(day.day_date)}
              nextStopId={nextStopId}
              nextTodoId={nextTodoId}
            />
          ))}
        </div>
      </SortableContext>

      <div className="mt-6">
        <DayColumn day={null} stops={stopsByDay(null)} nextStopId={nextStopId} />
      </div>

      <DragOverlay>
        {activeStop ? (
          <div className="rounded-md border border-zinc-300 bg-white p-3 text-sm shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
            <p className="font-medium">{activeStop.name}</p>
          </div>
        ) : activeDay ? (
          <div className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
            {activeDay.label}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
