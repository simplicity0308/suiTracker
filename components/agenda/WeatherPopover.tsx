"use client";

import { useEffect } from "react";
import { weatherIcon } from "@/lib/constants";
import { formatDayDate, formatTime } from "@/lib/utils";
import type { StopWeather } from "@/lib/types";

export function WeatherPopover({
  stopName,
  weather,
  startTime,
  onClose,
}: {
  stopName: string;
  weather: StopWeather;
  startTime?: string | null;
  onClose: () => void;
}) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const current = weatherIcon(weather.current.weatherCode);
  const highlightTime = startTime
    ? `${startTime.split(":")[0].padStart(2, "0")}:00`
    : null;

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
              Hourly forecast{weather.date && ` · ${formatDayDate(weather.date)}`}
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

        <div className="mt-3 flex items-center gap-3 rounded-md bg-sky-50 p-3 dark:bg-sky-950/40">
          <span className="text-3xl">{current.icon}</span>
          <div>
            <p className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
              {Math.round(weather.current.temperatureC)}°C
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {current.label}
              {weather.current.precipChance != null &&
                weather.current.precipChance > 0 &&
                ` · ${weather.current.precipChance}% chance of rain`}
            </p>
          </div>
        </div>

        {weather.hourly.length > 0 && (
          <div className="mt-3">
            <p className="mb-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Hour by hour
            </p>
            <div className="scroll-x-subtle flex gap-2 overflow-x-auto pb-1">
              {weather.hourly.map((h) => {
                const icon = weatherIcon(h.weatherCode);
                const isHighlighted = h.time === highlightTime;
                return (
                  <div
                    key={h.time}
                    className={`flex w-14 shrink-0 flex-col items-center gap-1 rounded-md p-2 text-center ${
                      isHighlighted
                        ? "bg-sky-100 dark:bg-sky-900"
                        : "bg-zinc-50 dark:bg-zinc-800/60"
                    }`}
                  >
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {formatTime(h.time)}
                    </span>
                    <span className="text-lg" title={icon.label}>
                      {icon.icon}
                    </span>
                    <span className="text-xs font-medium text-zinc-700 dark:text-zinc-200">
                      {Math.round(h.temperatureC)}°
                    </span>
                    {h.precipChance != null && h.precipChance > 0 && (
                      <span className="text-[10px] text-sky-600 dark:text-sky-400">
                        {h.precipChance}%
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
