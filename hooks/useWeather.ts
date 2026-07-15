"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Day, HourlyForecastPoint, Stop, StopWeather, WeatherPoint } from "@/lib/types";

type OpenMeteoLocation = {
  hourly?: {
    time: string[];
    temperature_2m: number[];
    precipitation_probability: number[];
    weathercode: number[];
  };
  daily?: {
    time: string[];
    weathercode: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max?: number[];
  };
};

type Coord = { lat: number; lng: number };

/**
 * Stops without a day, or whose day has no date, have nothing to look up a
 * forecast for — they're excluded here rather than downstream so every
 * consumer of this hook's result only ever sees stops that could plausibly
 * have weather.
 */
function relevantStops(stops: Stop[], days: Day[]) {
  const dateByDayId = new Map(days.map((d) => [d.id, d.day_date]));
  return stops
    .filter((s) => s.day_id && dateByDayId.get(s.day_id))
    .map((s) => ({
      stopId: s.id,
      lat: s.lat,
      lng: s.lng,
      date: dateByDayId.get(s.day_id as string) as string,
      startTime: s.start_time,
    }));
}

export function useWeather(stops: Stop[], days: Day[]) {
  const relevant = useMemo(() => relevantStops(stops, days), [stops, days]);

  // Multiple stops can share a location (e.g. the same hotel) — dedupe so
  // the batched request doesn't ask Open-Meteo for the same coordinate twice.
  const uniqueCoords = useMemo(() => {
    const seen = new Map<string, Coord>();
    for (const r of relevant) {
      const key = `${r.lat},${r.lng}`;
      if (!seen.has(key)) seen.set(key, { lat: r.lat, lng: r.lng });
    }
    return [...seen.values()];
  }, [relevant]);

  // Only changes when a coordinate, date, or time actually changes — not on
  // unrelated edits like a note — so this needs no manual invalidation.
  const fingerprint = useMemo(
    () =>
      relevant
        .map((r) => `${r.stopId}:${r.lat}:${r.lng}:${r.date}:${r.startTime ?? ""}`)
        .sort()
        .join("|"),
    [relevant]
  );

  return useQuery({
    queryKey: ["weather", fingerprint],
    queryFn: async () => {
      const url = new URL("https://api.open-meteo.com/v1/forecast");
      url.searchParams.set("latitude", uniqueCoords.map((c) => c.lat).join(","));
      url.searchParams.set("longitude", uniqueCoords.map((c) => c.lng).join(","));
      url.searchParams.set(
        "hourly",
        "temperature_2m,precipitation_probability,weathercode"
      );
      url.searchParams.set(
        "daily",
        "weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max"
      );
      url.searchParams.set("timezone", "Asia/Tokyo");
      url.searchParams.set("forecast_days", "16");

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Weather fetch failed");
      const json = await res.json();
      // Open-Meteo returns a single object for one location, an array for
      // multiple — normalize so downstream code only deals with arrays.
      const results: OpenMeteoLocation[] = Array.isArray(json) ? json : [json];

      // Match by request order, not by echoed lat/lng — Open-Meteo snaps
      // requested coordinates to the nearest forecast grid point and may
      // not echo back exactly what was requested.
      const forecastByCoord = new Map<string, OpenMeteoLocation>();
      uniqueCoords.forEach((c, i) => {
        forecastByCoord.set(`${c.lat},${c.lng}`, results[i]);
      });

      // For "today," don't bother showing hours that have already passed —
      // only matters for today's date, since no hour on a future day is
      // "past" yet. The forecast itself is fetched in Asia/Tokyo time (the
      // whole trip happens there), so "now"/"today" must be evaluated in
      // Tokyo time too, not the viewer's own device timezone — otherwise
      // this filter is wrong for anyone checking the app from outside Japan.
      const tokyoParts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Tokyo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        hourCycle: "h23",
      }).formatToParts(new Date());
      const tokyoPart = (type: string) =>
        tokyoParts.find((p) => p.type === type)?.value ?? "";
      const todayStr = `${tokyoPart("year")}-${tokyoPart("month")}-${tokyoPart("day")}`;
      const currentHour = Number(tokyoPart("hour"));

      const out: Record<string, StopWeather> = {};
      for (const r of relevant) {
        const forecast = forecastByCoord.get(`${r.lat},${r.lng}`);
        if (!forecast) continue;

        let current: WeatherPoint | null = null;

        if (r.startTime) {
          const hour = r.startTime.split(":")[0].padStart(2, "0");
          const idx = forecast.hourly?.time?.indexOf(`${r.date}T${hour}:00`) ?? -1;
          if (idx !== -1 && forecast.hourly) {
            current = {
              weatherCode: forecast.hourly.weathercode[idx],
              temperatureC: forecast.hourly.temperature_2m[idx],
              precipChance: forecast.hourly.precipitation_probability[idx] ?? null,
              source: "hourly",
            };
          }
        }

        // No start_time, or its hour fell just outside the hourly window —
        // fall back to that day's daily summary.
        const dayIdx = forecast.daily?.time?.indexOf(r.date) ?? -1;
        if (!current && dayIdx !== -1 && forecast.daily) {
          current = {
            weatherCode: forecast.daily.weathercode[dayIdx],
            temperatureC: forecast.daily.temperature_2m_max[dayIdx],
            precipChance: forecast.daily.precipitation_probability_max?.[dayIdx] ?? null,
            source: "daily",
          };
        }

        // Date is outside the ~16-day forecast horizon — no entry, no
        // error, the stop just shows no badge.
        if (!current) continue;

        // Every hour of this stop's own day, for the popover's hour-by-hour
        // view — captured into a local const so TS keeps `hourlyData` narrowed
        // to defined inside the forEach closure below.
        const hourly: HourlyForecastPoint[] = [];
        const hourlyData = forecast.hourly;
        if (hourlyData) {
          hourlyData.time.forEach((t, i) => {
            if (!t.startsWith(r.date)) return;
            if (r.date === todayStr && Number(t.slice(11, 13)) < currentHour) return;
            hourly.push({
              time: t.slice(11),
              weatherCode: hourlyData.weathercode[i],
              temperatureC: hourlyData.temperature_2m[i],
              precipChance: hourlyData.precipitation_probability[i] ?? null,
            });
          });
        }

        out[r.stopId] = { date: r.date, current, hourly };
      }

      return out;
    },
    enabled: relevant.length > 0,
    staleTime: 30 * 60 * 1000,
  });
}
