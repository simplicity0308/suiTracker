import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SuiTracker",
    short_name: "SuiTracker",
    description: "Our private day-by-day itinerary for Japan, September 2026",
    start_url: "/trip",
    display: "standalone",
    background_color: "#182349",
    theme_color: "#182349",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
