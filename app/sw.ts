/// <reference lib="esnext" />
/// <reference lib="webworker" />
import { defaultCache } from "@serwist/turbopack/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { NetworkFirst, NetworkOnly, Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // Google Maps Platform ToS forbids caching map tiles/JS for offline use —
    // this must stay ahead of defaultCache so it always wins the match.
    {
      matcher({ request }) {
        const hostname = new URL(request.url).hostname;
        return (
          hostname.endsWith("googleapis.com") || hostname.endsWith("gstatic.com")
        );
      },
      handler: new NetworkOnly(),
    },
    // Page navigations always try the network first. Next.js renames JS/CSS
    // chunks on every build, so a stale cached HTML shell can reference
    // files that no longer exist on the server after a redeploy — this is
    // what broke the site after the previous push. Falling back to cache
    // only when the network genuinely fails keeps offline viewing intact
    // without ever serving a stale, broken shell while online.
    {
      matcher({ request }) {
        return request.destination === "document";
      },
      handler: new NetworkFirst({
        cacheName: "pages",
        networkTimeoutSeconds: 4,
      }),
    },
    ...defaultCache,
  ],
});

serwist.addEventListeners();
