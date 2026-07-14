import type { Day, Stop, Todo } from "./types";

export function googleMapsUrl(stop: Pick<Stop, "lat" | "lng" | "place_id">) {
  const params = new URLSearchParams({
    api: "1",
    query: `${stop.lat},${stop.lng}`,
  });
  if (stop.place_id) params.set("query_place_id", stop.place_id);
  return `https://www.google.com/maps/search/?${params.toString()}`;
}

function formatClock(hours: number, minutes: number) {
  return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatTimeRange(
  stop: Pick<Stop, "start_time" | "duration_minutes">
) {
  if (!stop.start_time) return null;
  const [hours, minutes] = stop.start_time.split(":").map(Number);
  const start = formatClock(hours, minutes);
  if (!stop.duration_minutes) return start;

  const endMinutes = hours * 60 + minutes + stop.duration_minutes;
  const end = formatClock(
    Math.floor(endMinutes / 60) % 24,
    endMinutes % 60
  );
  return `${start} – ${end}`;
}

export function formatTime(timeStr: string) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return formatClock(hours, minutes);
}

export function isToday(dateStr: string | null) {
  if (!dateStr) return false;
  return dateStr === new Date().toLocaleDateString("en-CA");
}

export function formatDayDate(dateStr: string | null) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}

export type UpcomingItem =
  | { kind: "stop"; id: string }
  | { kind: "todo"; id: string };

/**
 * The single soonest thing (stop or to-do) still ahead of now, across the
 * whole trip. Ties (identical date+time) are broken by whichever was
 * created first.
 */
export function getNextUpcomingItem(
  days: Day[],
  stops: Stop[],
  todos: Todo[]
): UpcomingItem | null {
  const dayDateById = new Map(days.map((d) => [d.id, d.day_date]));
  const now = new Date();

  const candidates: { kind: "stop" | "todo"; id: string; at: Date; createdAt: string }[] = [];

  for (const stop of stops) {
    if (!stop.day_id || !stop.start_time) continue;
    const dayDate = dayDateById.get(stop.day_id);
    if (!dayDate) continue;
    const at = new Date(`${dayDate}T${stop.start_time}`);
    if (at < now) continue;
    candidates.push({ kind: "stop", id: stop.id, at, createdAt: stop.created_at });
  }

  for (const todo of todos) {
    if (todo.done || !todo.due_date || !todo.due_time) continue;
    const at = new Date(`${todo.due_date}T${todo.due_time}`);
    if (at < now) continue;
    candidates.push({ kind: "todo", id: todo.id, at, createdAt: todo.created_at });
  }

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => {
    const diff = a.at.getTime() - b.at.getTime();
    if (diff !== 0) return diff;
    return a.createdAt.localeCompare(b.createdAt);
  });

  const [winner] = candidates;
  return { kind: winner.kind, id: winner.id };
}
