# SuiTracker

A private, 2-person web app for planning a Japan trip in September 2026 — pin places on Google Maps, organize them into a day-by-day agenda with weather forecasts, and keep a shared to-do list. Built for exactly two users; public signup is disabled.

Live at [trip.benjamin0308.my](https://trip.benjamin0308.my).

## Stack

- **Next.js (App Router)** on Vercel, Turbopack
- **Supabase** (Postgres + Auth) — no custom backend server
- **Google Maps JavaScript API + Places API** for search-and-pin (no Directions/Routes API)
- **Open-Meteo** for per-stop weather forecasts (free, no API key)
- TanStack Query with a `localStorage` persister for offline itinerary viewing
- Serwist service worker for PWA installability

See [`PROJECT.md`](./PROJECT.md) for full project history, architecture decisions, and cross-session context — that's the source of truth, not this file.

## Local development

```bash
npm install
npm run dev
```

Requires a `.env.local` with Supabase and Google Maps credentials — see `PROJECT.md` → "Environment variables."

## Deployment

Auto-deploys to Vercel on push to `main`.
