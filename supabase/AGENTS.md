# Working in `supabase/`

Scoped rules for this directory. The app-level security model (which tables and
buckets exist, and who can read what) is in the root `AGENTS.md` — this file
covers only how to author migrations here.

## Migrations are append-only

Every file in `migrations/` has already been pushed to the linked remote project.
**Never edit or delete an applied migration** — write a new one that supersedes
it. The existing history demonstrates the pattern: `create_profile_trigger`
shipped with a bug (`->>"name"` instead of `->>'name'`), and it was corrected by
two later `create or replace function` migrations rather than by editing the
original.

There are no down migrations, and none are expected.

## Authoring a migration

```bash
bunx supabase migration new <snake_case_description>   # creates migrations/<timestamp>_<name>.sql
bunx supabase db push
bunx supabase gen types typescript --linked > ../lib/database.types.ts
```

Do not hand-name migration files; the CLI timestamp prefix orders them.

**Save the generated types file as UTF-8.** The current
`lib/database.types.ts` is UTF-16LE because a PowerShell `>` redirect produced
it, which makes ESLint fail with `Parsing error: File appears to be binary`.
A Bash-tool redirect writes UTF-8; in PowerShell use
`| Out-File -Encoding utf8` instead of `>`.

## House style in this directory

Matches every existing migration:

- Lowercase SQL keywords, `create policy` / `create table if not exists`.
- Quoted, sentence-shaped policy names (`"broker can update their own deals"`).
- When replacing a policy, `drop policy if exists "<exact old name>" on <table>;`
  first — policy names are the only handle you get.
- Trigger functions are `language plpgsql security definer set search_path = public`.
  Keep `security definer` on anything that writes to `public.profiles` from an
  `auth` trigger, and keep the `search_path` pin — without it, `security definer`
  is exploitable.
- Comment the intent above each policy, as the existing files do.

## Rules that are easy to get wrong

- **Postgres RLS policies are permissive by default, so multiple `for select`
  policies on one table are OR-ed.** `deals` relies on this: one policy exposes
  public deals, a second exposes a broker's own private deals. Adding another
  permissive SELECT policy *widens* access — it cannot restrict it. To narrow
  access, change or drop the existing policy.
- **Every new table needs `alter table … enable row level security` plus explicit
  policies.** Without RLS the anon key reads everything, since the app mutates
  from the browser.
- **Storage paths are part of the policy.** `deal-images` objects are
  `{brokerId}/{dealId}/{uuid}.{ext}` and the SELECT policy matches
  `(storage.foldername(name))[1]` against `auth.uid()` and
  `(storage.foldername(name))[2]` against `deals.id`. Changing the upload path
  layout in `lib/data/deal-photos.ts` silently breaks these policies — change
  both together.
- **`deal-images` is a private bucket, `avatars` is public.** Deal photos are
  reached through signed URLs; avatars through `getPublicUrl`. Do not flip a
  bucket's visibility without revisiting both the policies and the read path.
- Role checks are written as `exists (select 1 from public.profiles where
  id = auth.uid() and role = 'broker')`. Reuse that shape so behaviour stays
  consistent.

## Not tracked here

`config.toml` is the CLI default with a remote project linked through
`.temp/project-ref` (gitignored). There is no evidence a local `supabase start`
stack is part of the workflow; migrations appear to be pushed straight to the
remote project. If you introduce local development, say so here.
