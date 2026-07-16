"use client";

import { useEffect } from "react";
import { googleMapsDirectionsUrl, googleMapsUrl } from "@/lib/utils";
import type { Stop } from "@/lib/types";

export function MapsOptionsPopover({
  stopName,
  destination,
  previousStop,
  onClose,
}: {
  stopName: string;
  destination: Pick<Stop, "lat" | "lng" | "place_id">;
  previousStop?: Pick<Stop, "lat" | "lng" | "name"> | null;
  onClose: () => void;
}) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const options = [
    {
      key: "open",
      icon: "📍",
      label: "Open location",
      href: googleMapsUrl(destination),
    },
    {
      key: "from-me",
      icon: "🧭",
      label: "Directions from my location",
      href: googleMapsDirectionsUrl(destination),
    },
    ...(previousStop
      ? [
          {
            key: "from-previous",
            icon: "↪️",
            label: `Directions from ${previousStop.name}`,
            href: googleMapsDirectionsUrl(destination, previousStop),
          },
        ]
      : []),
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full min-w-0 max-w-sm rounded-lg bg-white p-4 shadow-xl dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
              {stopName}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Get directions
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="mt-3 flex flex-col gap-2">
          {options.map((opt) => (
            <a
              key={opt.key}
              href={opt.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="flex items-center gap-3 rounded-md bg-zinc-50 p-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-sky-50 dark:bg-zinc-800/60 dark:text-zinc-200 dark:hover:bg-sky-950/40"
            >
              <span className="text-lg">{opt.icon}</span>
              {opt.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
