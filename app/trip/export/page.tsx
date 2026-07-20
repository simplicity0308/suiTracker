import { createClient } from "@/lib/supabase/server";
import { CATEGORIES, CATEGORY_COLORS } from "@/lib/constants";
import {
  formatTimeRange,
  formatTime,
  formatDayDate,
  getCreatorLabel,
  googleMapsUrl,
  googleMapsDirectionsUrl,
} from "@/lib/utils";
import type { Day, Profile, Stop, Todo, Trip } from "@/lib/types";
import { PrintButton } from "@/components/layout/PrintButton";

type Entry =
  | { kind: "stop"; id: string; time: string | null; order: number; stop: Stop }
  | { kind: "todo"; id: string; time: string | null; order: number; todo: Todo };

// Mirrors DayColumn.tsx's buildEntries/previousStop logic so the export
// shows the exact same order and "directions from previous stop" links as
// the live Agenda page, rather than inventing a second sort order.
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

function previousStopMap(entries: Entry[]): Map<string, Stop> {
  const map = new Map<string, Stop>();
  let lastStop: Stop | null = null;
  for (const entry of entries) {
    if (entry.kind === "stop") {
      if (lastStop) map.set(entry.id, lastStop);
      lastStop = entry.stop;
    }
  }
  return map;
}

// Same ordering as TodoList.tsx's sortTodos, reused for the "All to-dos"
// master list at the bottom of the export.
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

function StopBlock({
  stop,
  profiles,
  previousStop,
}: {
  stop: Stop;
  profiles: Profile[];
  previousStop: Stop | null;
}) {
  const categoryLabel = CATEGORIES.find((c) => c.value === stop.category)?.label ?? stop.category;
  const categoryColor = CATEGORY_COLORS[stop.category];
  const timeRange = formatTimeRange(stop);
  const creator = getCreatorLabel(stop.created_by, profiles);

  return (
    <div className="item">
      <div className="item-header">
        <span className="item-name">{stop.name}</span>
        <span className="category-chip" style={{ backgroundColor: categoryColor }}>
          {categoryLabel}
        </span>
        {creator && <span className="creator-chip">{creator}</span>}
      </div>
      {timeRange && <p className="item-time">{timeRange}</p>}
      {stop.address && <p className="item-detail">{stop.address}</p>}
      {stop.note && <p className="item-note">{stop.note}</p>}
      <p className="item-links">
        <a href={googleMapsUrl(stop)}>Open location</a>
        {previousStop && (
          <>
            {" · "}
            <a href={googleMapsDirectionsUrl(stop, previousStop)}>
              Directions from {previousStop.name}
            </a>
          </>
        )}
      </p>
    </div>
  );
}

function TodoBlock({ todo, profiles }: { todo: Todo; profiles: Profile[] }) {
  const creator = getCreatorLabel(todo.created_by, profiles);

  return (
    <div className={`item todo-item${todo.done ? " done" : ""}`}>
      <div className="item-header">
        <span className="item-name">
          {todo.done ? "☑" : "☐"} {todo.title}
        </span>
        {creator && <span className="creator-chip">{creator}</span>}
      </div>
      {(todo.due_date || todo.due_time) && (
        <p className="item-time">
          {todo.due_date}
          {todo.due_date && todo.due_time && " · "}
          {todo.due_time && formatTime(todo.due_time)}
        </p>
      )}
      {todo.note && <p className="item-note">{todo.note}</p>}
    </div>
  );
}

const STYLES = `
  * { box-sizing: border-box; }
  main.export-page {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    max-width: 640px;
    margin: 0 auto;
    padding: 16px;
    color: #18181b;
    background: #fff;
  }
  .export-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e4e4e7;
  }
  .export-header h1 { margin: 0; font-size: 20px; }
  .exported-at { margin: 4px 0 0; font-size: 12px; color: #71717a; }
  .day-section { margin-bottom: 24px; }
  .day-section h2 {
    font-size: 16px;
    margin: 0 0 10px;
    padding-bottom: 4px;
    border-bottom: 2px solid #18181b;
  }
  .day-date { font-weight: normal; color: #71717a; }
  .empty { font-size: 13px; color: #a1a1aa; }
  .item {
    border: 1px solid #e4e4e7;
    border-radius: 8px;
    padding: 10px 12px;
    margin-bottom: 8px;
    font-size: 14px;
  }
  .item-header {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    font-weight: 600;
  }
  .item-name { flex: 1; min-width: 0; }
  .category-chip {
    font-size: 11px;
    font-weight: 500;
    color: #fff;
    padding: 2px 8px;
    border-radius: 999px;
  }
  .creator-chip {
    font-size: 11px;
    font-weight: 500;
    background: #e4e4e7;
    color: #3f3f46;
    padding: 2px 8px;
    border-radius: 999px;
  }
  .item-time { margin: 4px 0 0; font-size: 12px; color: #52525b; }
  .item-detail { margin: 4px 0 0; font-size: 13px; color: #3f3f46; }
  .item-note { margin: 4px 0 0; font-size: 13px; color: #52525b; font-style: italic; }
  .item-links { margin: 6px 0 0; font-size: 12px; }
  .item-links a { color: #2563eb; text-decoration: none; }
  .todo-item.done .item-name { text-decoration: line-through; color: #a1a1aa; }

  @media print {
    .no-print { display: none !important; }
    main.export-page { max-width: 100%; padding: 0; }
    .item { break-inside: avoid; }
    .day-section { break-inside: avoid-page; }
  }
`;

export default async function ExportPage() {
  const supabase = await createClient();

  const { data: trip, error: tripError } = await supabase
    .from("trips")
    .select("*")
    .limit(1)
    .single();

  if (tripError || !trip) {
    return (
      <main className="export-page">
        <style>{STYLES}</style>
        <p>No trip found for your account yet.</p>
      </main>
    );
  }

  const [{ data: days }, { data: stops }, { data: todos }, { data: profiles }] =
    await Promise.all([
      supabase.from("days").select("*").eq("trip_id", trip.id).order("sort_order"),
      supabase.from("stops").select("*").eq("trip_id", trip.id).order("sort_order"),
      supabase.from("todos").select("*").eq("trip_id", trip.id).order("sort_order"),
      supabase.from("profiles").select("*"),
    ]);

  const tripRow = trip as Trip;
  const allDays = (days ?? []) as Day[];
  const allStops = (stops ?? []) as Stop[];
  const allTodos = (todos ?? []) as Todo[];
  const allProfiles = (profiles ?? []) as Profile[];

  const exportedAt = new Date().toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });

  function stopsByDay(dayId: string | null) {
    return allStops.filter((s) => s.day_id === dayId).sort((a, b) => a.sort_order - b.sort_order);
  }

  function todosForDay(day: Day) {
    return allTodos.filter((t) =>
      t.day_id ? t.day_id === day.id : t.due_date === day.day_date && !!day.day_date
    );
  }

  const unscheduledStops = stopsByDay(null);
  const unscheduledEntries = buildEntries(unscheduledStops, []);
  const unscheduledPrevMap = previousStopMap(unscheduledEntries);

  return (
    <main className="export-page">
      <style>{STYLES}</style>

      <div className="export-header">
        <div>
          <h1>{tripRow.name}</h1>
          <p className="exported-at">Exported {exportedAt}</p>
        </div>
        <PrintButton />
      </div>

      {allDays.map((day) => {
        const dayStops = stopsByDay(day.id);
        const dayTodos = todosForDay(day);
        const entries = buildEntries(dayStops, dayTodos);
        const prevMap = previousStopMap(entries);

        return (
          <section key={day.id} className="day-section">
            <h2>
              {day.label}
              {day.day_date && <span className="day-date"> — {formatDayDate(day.day_date)}</span>}
            </h2>
            {entries.length === 0 && <p className="empty">Nothing scheduled.</p>}
            {entries.map((entry) =>
              entry.kind === "stop" ? (
                <StopBlock
                  key={entry.id}
                  stop={entry.stop}
                  profiles={allProfiles}
                  previousStop={prevMap.get(entry.id) ?? null}
                />
              ) : (
                <TodoBlock key={entry.id} todo={entry.todo} profiles={allProfiles} />
              )
            )}
          </section>
        );
      })}

      {unscheduledStops.length > 0 && (
        <section className="day-section">
          <h2>Unscheduled</h2>
          {unscheduledEntries.map((entry) =>
            entry.kind === "stop" ? (
              <StopBlock
                key={entry.id}
                stop={entry.stop}
                profiles={allProfiles}
                previousStop={unscheduledPrevMap.get(entry.id) ?? null}
              />
            ) : null
          )}
        </section>
      )}

      <section className="day-section">
        <h2>All to-dos</h2>
        {allTodos.length === 0 && <p className="empty">No to-dos yet.</p>}
        {sortTodos(allTodos).map((todo) => (
          <TodoBlock key={todo.id} todo={todo} profiles={allProfiles} />
        ))}
      </section>
    </main>
  );
}
