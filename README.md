# Personal OS

React + TypeScript port of the approved prototype. The CSS and class names are carried over unchanged, so the rendered UI is meant to match it.

1. Create a Supabase project and run `supabase/schema.sql` in the SQL editor (new project: tables, RLS, private `images` bucket).
2. Auth settings: add your site URL (local: http://localhost:5173) to the redirect URLs.
3. `cp .env.example .env`, fill in the project URL and anon key (never the service-role key).
4. `npm install`, then `npm run dev`. `npm test` runs the streak, date and amount tests. `npm run build` type-checks and builds.

Layout: `lib.ts` (pure logic), `data.tsx` (Supabase, optimistic writes), `ui.tsx` (List, Tabs, dialogs, image slots), one file per page, `migrate.ts` (one-time import of the prototype's `pos1` browser data; a backup stays in `pos1_backup`).
New accounts start empty. Exercise on the radar counts non-negotiables whose title contains "exercise".
