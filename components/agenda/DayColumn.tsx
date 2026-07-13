import type { Day, Stop } from "@/lib/types";
import { StopCard } from "./StopCard";

export function DayColumn({
  day,
  stops,
}: {
  day: Day | null;
  stops: Stop[];
}) {
  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        {day ? day.label : "Unscheduled"}
      </h2>
      {stops.length === 0 && (
        <p className="text-xs text-zinc-400">No stops yet.</p>
      )}
      <div className="space-y-2">
        {stops.map((stop) => (
          <StopCard key={stop.id} stop={stop} />
        ))}
      </div>
    </div>
  );
}
