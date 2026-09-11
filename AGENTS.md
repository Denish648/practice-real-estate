<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project context: Real Estate Deals Board

Next.js 16 App Router + Supabase. Two roles — **broker** (creates/manages deals
and deal photos) and **buyer** (browses public deals). Deal privacy is enforced
in PostgreSQL via Row Level Security, not in application code.

Practice/learning repo, built in stages (`stage-1/profile-photo`,
`stage-2/deal-manage`, `stage-3/deal-photo`, each merged to `main`). No CI, no
automated test suite.

## Stack

| Concern | Choice | Notes |
|---|---|---|
| Framework | Next.js **16.3.4**, App Router | Turbopack is the default builder |
| React | 19.2.8 | `React.SubmitEvent<T>` is used for form handlers |
| Package manager / runtime | **Bun 1.3.14** (`packageManager` field) | `bun.lock`, not `package-lock.json` |
| Backend | Supabase (Postgres + Auth + Storage) via `@supabase/ssr` | remote-linked project; no local stack in use |
| Styling | Tailwind CSS v4 (CSS-first, `app/globals.css`) | no `tailwind.config.*`; see `components.json` |
| UI | shadcn (`style: radix-nova`) + `radix-ui` + `lucide-react` + `sonner` | |
| Validation | Zod 4 | `z.email()`, `result.error.issues` (v4 API, not v3 `.errors`) |

### Next.js 16 differences that break older habits

- **`middleware.ts` is deprecated and renamed to `proxy.ts`.** This repo has
  `proxy.ts` at the root exporting `export async function proxy(request)` plus a
  `config.matcher`. Do not reintroduce `middleware.ts`.
- `PageProps<'/route'>` and `LayoutProps<'/route'>` are **global** generated
  helpers (no import needed). `app/layout.tsx` uses `LayoutProps<"/">`. Dynamic
  pages currently hand-roll `{ params: Promise<{ id: string }> }`; `PageProps` is
  the idiomatic form — *recommendation*, both compile.
- `params` is a Promise and must be awaited.
- `images.qualities` now defaults to `[75]`; any other `quality` prop is coerced
  down to it. `next.config.ts` allows `[75, 90]` so the hero photo can be sharp.
- Per the managed block above: check `node_modules/next/dist/docs/` before
  writing Next-specific code.

## Commands

All verified against this repo.

```bash
bun install
bun dev              # next dev (Turbopack)
bun run build        # next build — also runs the TypeScript check
bun run start
bun run lint         # eslint — currently FAILS, see Known issues
bun run format       # prettier --write . — read Known issues before running
bun run format:check # currently FAILS on Windows checkouts, see Known issues
./node_modules/.bin/tsc --noEmit   # clean as of this writing; `npx tsc` does NOT work here
```

Supabase CLI is a devDependency with no npm script wrapper. Use `bunx supabase …`
(`migration new`, `db push`, `gen types`).

## Repository map

```
proxy.ts                  Auth gate + role-based routing; runs before every render
app/(auth)/               login, signup, forgot-password, change-password — all client pages
app/api/                  NOT route handlers — see Architecture rules
app/dashboard/            sidebar layout + broker/, buyer/, profile/ — mostly server components
app/discover/             PUBLIC deal board + /discover/{broker}/{deal} detail — no session needed
app/tests/page.tsx        Manual RLS probe page, routable at /tests — see Known issues
components/               Feature components (forms, tables, dialog, sidebar)
components/landing/       Marketing shell shared by / and /discover (header, footer, cards)
components/ui/            shadcn primitives — regenerate via shadcn CLI, avoid hand-edits
lib/supabase/client.ts    createBrowserClient — for "use client" code
lib/supabase/server.ts    createClient (async, cookie-backed) — for server components
lib/data/                 Data access: server reads plus browser-side storage helpers
lib/types/                Aliases over generated Database types, re-exported from index.ts
lib/validations/          Zod schemas plus the image size/count rules
components/deal-feed*.tsx One deal card + one feed layout, shared by both dashboards and Browse Deals
lib/utils/deal-feed.ts    FeedDeal view model, `toFeedDeals` mapper and the shared search matcher
lib/utils/slug.ts         Derives (and resolves) the /discover URL slugs — nothing is stored
lib/utils/deal-search.ts  Search-param parsing and client-side filtering shared by / and /discover
lib/constants/            Fixed marketing artwork paths (hero, contact background)
lib/database.types.ts     GENERATED — do not hand-edit
supabase/migrations/      SQL migrations; the real authorization layer (see supabase/AGENTS.md)
```

## Architecture rules

These are the load-bearing decisions. Follow them, or change them deliberately.

1. **There are no Server Actions and no Route Handlers.** Zero `"use server"`,
   zero `route.ts`. Do not add either without a deliberate decision — it would
   split the mutation path in two.
2. **Reads happen on the server, writes happen in the browser.**
   - Reads: server components call `lib/data/*`, which use `lib/supabase/server.ts`.
   - Writes: client components call `app/api/*` and
     `lib/data/{avatar,deal-photos}.ts`, which use `lib/supabase/client.ts` and
     talk to Supabase directly from the browser.
3. **`app/api/` holds plain modules, not HTTP endpoints.** Next only routes
   `page.tsx` and `route.ts`, so nothing is served under `/api` — confirmed, the
   build manifest contains no `/api` routes. These files are imported, e.g.
   `import { createDealAPI } from "@/app/api/deals"`. Read `app/api/` as
   "browser-side Supabase mutation helpers".
4. **RLS is the security boundary.** Because mutations originate in the browser
   with the anon key, any client-side check is advisory only. Every new table,
   column or bucket needs a policy; never rely on UI or JS guards for access
   control.
5. **Cache invalidation is `router.refresh()`** after a successful mutation,
   usually paired with `router.push()`. There is no `revalidatePath` or
   `revalidateTag` anywhere — do not mix idioms.
6. **`getDeals()` with no argument returns what RLS allows** — neither "all
   deals" nor "my deals". Pass `user.id` when you mean the current broker's deals.

## Auth and routing (`proxy.ts`)

Runs on every request except `_next/static`, `_next/image`, `favicon.ico` and
any path ending in a static image extension. That last exclusion is load-bearing:
without it the gate answers `/images/*.png` with a 307 to `/login`, and the
image optimizer then fails with "The requested resource isn't a valid image".

- Public routes, open without a session: `/`, `/discover` and everything under
  it, plus the four auth pages. Everything else needs a user.
- No user, non-public route: redirect to `/login`.
- Signed in, path outside `/dashboard`: pass through — a logged-in user can still
  reach `/login`; they are *not* currently redirected away.
- `/dashboard`: redirect to `/dashboard/{role}`, role read from `profiles`.
- Cross-role path (a buyer hitting `/dashboard/broker/*`, or the reverse):
  redirect back to their own dashboard.
- A failed profile fetch is logged and **allowed through**, so pages must not
  assume the proxy already authorized them. Server components re-check
  `getUser()` themselves, and detail pages re-check ownership before rendering.

Signup passes `name`, `company`, `phone`, `role` as auth user metadata; the
`handle_new_user` trigger copies them into `public.profiles`. The
`prevent_role_update` trigger blocks role changes after signup.

## Data model and access rules

Three tables, all RLS-enabled. Full policy text lives in `supabase/migrations/`.

- **`profiles`** — `id` FK to `auth.users`, `role` (`broker` | `buyer`), `name`,
  `company`, `phone`, `avatar_url`. Readable: your own row, plus any row with
  `role = 'broker'` — granted to `authenticated` and, since
  `anon_can_view_broker_profiles`, to `anon` as well, so the public `/discover`
  pages can render the broker contact card. Updatable: own row only, with the
  role column frozen by trigger.
- **`deals`** — `broker_id`, `title`, `city`, `price` (numeric, `>= 0`),
  `is_private`. SELECT is the OR of two permissive policies: public deals are
  visible to `anon` **and** `authenticated`; private deals only to the owning
  broker. Insert, update and delete each require `broker_id = auth.uid()` *and*
  `role = 'broker'`.
- **`deal_images`** — `deal_id`, `path`, `sort_order`. Visible when the parent
  deal is visible; writable only by that deal's broker.

Storage buckets:

- **`avatars`** — public bucket. Path `{userId}/{uuid}.{ext}`. Served via
  `getPublicUrl` and stored in `profiles.avatar_url`. Insert and delete are
  restricted to your own first-level folder.
- **`deal-images`** — **private** bucket. Path `{brokerId}/{dealId}/{uuid}.{ext}`.
  The path shape is load-bearing: the storage SELECT policy reads segment `[2]`
  as the deal id and segment `[1]` as the owner, so changing the layout breaks
  RLS. Reads go through 1-hour signed URLs from `getDealImagesWithSignedUrls`.

`next.config.ts` allowlists `**.supabase.co` for `next/image`.

## Conventions

- **Result objects, never throws, in `lib/data/` and `app/api/`.** Each function
  returns `{ data | images | user | …, error }` and wraps its body in
  `try/catch`, converting unknown throws into `new Error(...)`. Callers branch on
  `error`.
- **Server components throw; client components toast.** Pages do
  `if (error) throw error` and let `app/dashboard/error.tsx` catch it. Client
  handlers call `toast.error(...)` from `sonner`.
- **Validate with Zod at the form boundary** using `schema.safeParse`, then map
  `result.error.issues` into a `Record<string, string>` keyed by `issue.path[0]`
  and feed it to the field's `error` prop. `components/ui/input.tsx` is a
  customized shadcn primitive accepting `error?: string`, rendering the message
  and setting `aria-invalid` — use it rather than rolling your own error text.
- **Uploads are compensated manually.** Multi-step create and update flows
  collect `uploadedPaths` and call `deleteDealStorageFiles(uploadedPaths)` in
  `catch`. Keep that pattern when adding upload steps — there is no transaction
  spanning Storage and Postgres.
- `cn` is imported from the `cn` package directly (`import { cn } from "cn"`),
  not from `@/lib/utils`, which only re-exports it. Match the surrounding file.
- Imports use the `@/*` alias rooted at the repo root. There is no `src/`.
- Money formats through `formatPrice` (₹, `en-IN`); avatars fall back to
  `getInitials`.
- Prettier: no semicolons, double quotes, 2-space indent, trailing commas,
  width 80.
- Naming: files kebab-case; browser mutation helpers carry an `API` suffix
  (`createDealAPI`); server read helpers are `get…`; types are aliases of
  `Database["public"]["Tables"][…]` exported from `lib/types/`.

## Generated and managed files — do not hand-edit

- `lib/database.types.ts` — output of `supabase gen types`. It is **UTF-16LE
  encoded**, an artifact of a PowerShell redirect. It sits in `.prettierignore`
  and it breaks ESLint (see below). Regenerate it; do not patch it.
- `next-env.d.ts`, `tsconfig.tsbuildinfo`, `.next/` — gitignored build output.
- The `nextjs-agent-rules` block at the top of this file is rewritten by
  `next dev`. Text outside the markers is preserved — verified in
  `node_modules/next/dist/server/lib/generate-agent-files.js` — so this section
  is safe to keep here.
- `components/ui/*` — shadcn output. `input.tsx` carries a deliberate local
  modification (the `error` prop) and `button.tsx` another (pill radius plus
  wider default/lg padding, to match the landing page); re-running
  `shadcn add input` or `shadcn add button` would drop them.

## Known issues and technical debt

Verified by running the commands, not inferred. Do not fix these as drive-by
changes while doing unrelated work.

- **The two `anon` read migrations are written but not pushed.**
  `20260911120000_public_deal_images_for_anon.sql` and
  `20260911130000_anon_can_view_broker_profiles.sql` are not applied on the
  linked project yet — verified by loading `/discover` signed out, which renders
  the listings but reports "No photos" and "Broker details are unavailable".
  Run `bunx supabase db push` to fix.
- **`bun run lint` fails** with 2 errors and 4 warnings:
  - `lib/database.types.ts:1  Parsing error: File appears to be binary` — caused
    by the UTF-16 encoding above. Re-saving as UTF-8 would fix it.
  - `app/dashboard/broker/create-deal/page.tsx:149  Unexpected any`.
  - Warnings: raw `<img>` in the two upload previews, plus one unused `catch`
    binding in `lib/data/deal-images.ts`.
- **`bun run format:check` fails on 31 files, purely over line endings.**
  `core.autocrlf=true` puts CRLF on disk while Prettier defaults to
  `endOfLine: "lf"`; the content is otherwise byte-identical, verified.
  **Do not run `bun run format` to silence this** — it rewrites every file and
  buries the real diff. Real fixes would be a `.gitattributes` file or
  `"endOfLine": "auto"` in `.prettierrc` (*recommendation, not applied*).
- **`.gitignore` ends with `tests/`**, which matches `app/tests/` at any depth.
  `app/tests/page.tsx` is tracked only because it predates that rule; new files
  under any `tests/` directory are silently untracked. Use `git add -f`.
- **`/tests` ships in production builds.** `app/tests/page.tsx` is a manual RLS
  probe with hardcoded deal and image UUIDs, and appears in the build manifest as
  a static route. It is a verification harness, not a test suite — this project
  has no test runner.
- `app/page.tsx` is a placeholder (`<h1>home</h1>`).
- `components/login-form.tsx` and `components/signup-form.tsx` use hooks but
  carry no `"use client"` directive; they compile only because the pages
  importing them declare it. A server-component importer would break them.
- `deal_images.sort_order` is assigned on upload and never re-sequenced after a
  delete, so gaps and duplicate values accumulate.
- There is no error boundary outside `/dashboard`, and no `loading.tsx` anywhere.

## Common workflows

**Add a field to a deal**

1. `bunx supabase migration new add_deal_<field>`, then write the `alter table`
   (plus a policy change if the field is access-relevant).
2. `bunx supabase db push`, then regenerate `lib/database.types.ts` — save it as
   UTF-8, see above.
3. Extend `lib/validations/deal.ts`.
4. Thread it through `app/api/deals/index.ts`: `createDealAPI`, `updateDealAPI`,
   and the `UpdateDeal` `Pick<…>` type.
5. Update both forms: `app/dashboard/broker/create-deal/page.tsx` and
   `components/deal-edit-form.tsx`.
6. Update the read sites: the select strings in `lib/data/deals.ts`, the two
   deal detail pages, `components/my-deals-table.tsx`, and
   `app/dashboard/buyer/browse-deals/page.tsx`.

**Add a dashboard page**

Create `app/dashboard/{role}/<name>/page.tsx` as an async server component;
fetch through `lib/data/*`; add the nav entry to the `brokerData` or `buyerData`
array in `components/app-sidebar.tsx`. `proxy.ts` already enforces the role split
by path prefix, so keep new pages under the correct role segment.

**Change who can see what**

Write a migration. Do not add the check only in a page or a `lib/data` helper —
the browser client can bypass it.

## Validation checklist before finishing a change

1. `./node_modules/.bin/tsc --noEmit` — must stay clean.
2. `bun run build` — must succeed.
3. `bun run lint` — must not add findings beyond the baseline listed above.
4. Touched RLS? Sign in as both a broker and a buyer, and confirm a private deal
   is invisible to the buyer at all three layers: the `deals` row, the
   `deal_images` row, and the signed URL. `/tests` exercises the storage side.
5. Touched anything under a `tests/` directory? Confirm `git status` sees it.

## Assumptions and unknowns

- **The deployment target is undocumented.** There is no `.github/`, no
  `vercel.json`, no Dockerfile. `.gitignore` mentions `.vercel`, which hints at
  Vercel, but nothing in the repo confirms it.
- **`supabase/config.toml` is the CLI default** with a remote project linked via
  `supabase/.temp/project-ref`. Nothing indicates anyone runs `supabase start`
  locally; migrations appear to be pushed to the remote project.
- `NEXT_PUBLIC_SITE_URL` is read only by `ForgotPasswordAPI`, for the reset
  redirect. It must match a Supabase Auth redirect-allowlist entry, which is
  configured in the Supabase dashboard rather than in this repo.
- Required env vars, from the gitignored `.env`: `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`. All three are
  `NEXT_PUBLIC_`, i.e. shipped to the browser by design — never put a
  service-role key or a database password in a `NEXT_PUBLIC_` variable.
