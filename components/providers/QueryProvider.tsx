"use client";

import { useState } from "react";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            gcTime: 1000 * 60 * 60 * 24 * 14,
            retry: 1,
          },
        },
      })
  );
  const [persister] = useState(() =>
    createSyncStoragePersister({
      key: "japan-trip-cache",
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
    })
  );

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 1000 * 60 * 60 * 24 * 14,
        // Bump this whenever a persisted query's shape changes (like the
        // weather hook's WeatherPoint -> StopWeather restructure) so old
        // localStorage cache entries in the incompatible shape are
        // discarded instead of crashing components that read the new shape.
        buster: "2026-07-16-weather-shape-2",
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
