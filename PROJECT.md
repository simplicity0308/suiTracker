# Japan Trip Itinerary Tracker — Project Notes

Living context doc for this project. Update as decisions change or phases complete — this is the source of truth across sessions, not the original planning doc (which lives outside the repo).

## What this is

A private, 2-person web app for planning a Japan trip in **September 2026**: pin places on Google Maps, organize them into a day-by-day schedule, add notes. Built by the user + Claude Code, for the user and their partner only.

## Confirmed requirements

- **Users:** Exactly 2 people (user + partner). No public signup, ever.
- **Stack:** Next.js (App Router) on Vercel. Supabase (Postgres + Auth) as the only backend — no custom server.
- **Maps:** Google Maps JavaScript API + Places API only. **No Directions/Routes API** — stops are simple ordered pins, no travel-time routing between them (deliberate, to keep API cost/complexity down).
- **Sync:** Manual refresh is fine. No Supabase Realtime.
- **Scope:** Map pins organized into a day-by-day schedule, each stop has a note + category. No budget tracking, no booking links/confirmation numbers, no checklists — keep scope tight.
- **Offline:** View-only offline support (see the saved itinerary without signal, e.g. on a train). Adding/editing while offline is explicitly out of scope (would need a write-queue/conflict-resolution system not worth the complexity here).
- **Mobile:** Must be installable via "Add to Home Screen" (PWA) on both iOS and Android.
- **Domain:** Registered at **Exabyte**. Will use subdomain `trip.<theirdomain>` (not root) via a CNAME record pointing at Vercel.

## Decisions changed after initial planning

- **Auth switched from magic-link to email+password.** Originally planned as passwordless magic link (2 manually-created Supabase users, public signup disabled). User found checking email for every login annoying, so switched to `signInWithPassword`. The "2 users only, no signup" lock is unchanged — still enforced via Supabase Dashboard → Authentication → disable "Allow new users to sign up." Passwords were set manually per-user via the Supabase dashboard (not self-serve reset flow). The `/auth/callback` route (needed only for magic-link) was removed as dead code.
- **Session behavior:** Not per-browser-session — Supabase issues a refresh token in a cookie that `proxy.ts` (formerly `middleware.ts`, renamed per Next.js 16 convention) silently refreshes on every request. In practice each device stays signed in for weeks until explicit sign-out or cleared cookies.
- **GitHub repo already existed** at `https://github.com/simplicity0308/suiTracker.git` with an unrelated scaffolded app (tRPC + better-auth + Drizzle-style, 2 commits). Per user's explicit choice, this was **force-overwritten** with our project history — old commits are gone from the remote (branch renamed `master` → `main` to match GitHub default).

## Architecture

- **DB schema:** `trips`, `trip_members` (join table gating access), `days`, `stops`. Full SQL in `supabase/migrations/0001_init.sql`. RLS restricts all access to rows where `auth.uid()` is in `trip_members` for that trip, via a `security definer` helper function `is_trip_member(trip_id)`.
- **One trip, seeded manually** via `supabase/seed_trip.sql` (user filled in the real UUIDs after creating the 2 auth accounts). No self-serve "create a trip" UI by design — add one later only if a second trip actually happens.
- **Server Actions** (`lib/actions/*.ts`) handle all mutations, calling `revalidatePath` after. No REST API routes needed.
- **Supabase clients:** `lib/supabase/client.ts` (browser), `lib/supabase/server.ts` (server components/actions), both via `@supabase/ssr`.
- **Route structure:** `/login` (public), everything under `/trip/*` gated by `proxy.ts`. `/trip/agenda` = day-by-day list + day management. `/trip/map` = Google Map with search-and-pin (Phase 2).

## External accounts / resources

- **Supabase project:** ref `agvmnelzuvsadyajrhtd` (URL `https://agvmnelzuvsadyajrhtd.supabase.co`). Region and org are in the user's Supabase account. Keys live in `.env.local` (gitignored) — never commit them, though the anon key is safe to expose client-side by design. Service role key is intentionally never used anywhere in this app.
- **GitHub:** `https://github.com/simplicity0308/suiTracker.git`, branch `main`.
- **Google Cloud / Maps API key:** not yet created — needed for Phase 2. Requires billing enabled (free tier should cover our usage, ~$0 expected), Maps JavaScript API + Places API enabled, a Map ID (for `AdvancedMarker`), and an HTTP-referrer-restricted API key.
- **Vercel:** not yet connected — planned for Phase 5 deployment, or earlier once there's something worth previewing.
- **Domain registrar:** Exabyte (exact DNS panel steps TBD — generic CNAME instructions apply, look for "DNS Management" or "Zone Editor").

## Build status (phases from the original plan)

- [x] Phase 0 — Next.js scaffold, git init, Supabase migration SQL written
- [x] Phase 0b — Supabase project created, 2 users seeded, signup disabled, `.env.local` wired
- [x] Phase 1 — Auth (password-based) + basic day/stop CRUD, verified working end-to-end by user, pushed to GitHub
- [x] Phase 2 — Google Maps pin UI (search-and-pin via Places Autocomplete, day-colored/numbered pins), GCP project + Maps API key + Map ID set up, verified working by user
- [x] Phase 3 — Agenda polish: drag-reorder stops within/across days via dnd-kit, drag-reorder days, inline day rename/delete, category color pills, `sort_order` collision bug fixed. Verified working by user.
- [ ] Phase 4 — PWA + offline support
- [ ] Phase 5 — Deploy + custom domain (`trip.<exabyte-domain>`) + hardening

## Environment variables (`.env.local`, gitignored)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=   # Phase 2
NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID=    # Phase 2, required for AdvancedMarker
```
