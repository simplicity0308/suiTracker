import { CATEGORIES } from "@/lib/constants";
import type { Stop } from "@/lib/types";
import { DeleteStopButton } from "./DeleteStopButton";

export function StopCard({ stop }: { stop: Stop }) {
  const categoryLabel =
    CATEGORIES.find((c) => c.value === stop.category)?.label ?? stop.category;
  return (
    <div className="flex items-start justify-between gap-3 rounded-md border border-zinc-200 p-3 text-sm dark:border-zinc-800">
      <div>
        <p className="font-medium">{stop.name}</p>
        <p className="text-xs text-zinc-500">
          {categoryLabel}
          {stop.address ? ` · ${stop.address}` : ""}
        </p>
        {stop.note && (
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">{stop.note}</p>
        )}
      </div>
      <DeleteStopButton id={stop.id} />
    </div>
  );
}
