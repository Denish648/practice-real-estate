# Real Estate Deals Board

A full-stack real estate deal management and marketplace platform built with **Next.js (App Router)** and **Supabase**.

Brokers can publish and manage deals (public or private), while buyers can browse public deals. Deal privacy and data access are enforced directly at the database layer using **Row Level Security (RLS)**.

---

## Features

- **Role-Based Access Control (RBAC):**
  - **Brokers:** Create, view, and manage property deals (public or private deals visible only to the creator).
  - **Buyers:** Browse and search active public property deals.
- **Supabase Authentication:** Secure signup, sign-in, and session management using Supabase Auth and SSR cookies.
- **Database-Level Privacy (RLS):** Private deals are strictly protected via PostgreSQL Row Level Security policies.
- **Modern UI / UX:** Built with Tailwind CSS v4, Lucide Icons, Sonner toasts, and Radix UI components.

---

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router, Server Components & Server Actions)
- **Runtime & Package Manager:** [Bun](https://bun.sh/)
- **Database & Auth:** [Supabase](https://supabase.com/) (`@supabase/ssr`)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Validation:** [Zod](https://zod.dev/)
- **UI Components & Icons:** Radix UI primitives, Lucide React, Sonner

---

## Getting Started

### 1. Prerequisites

Make sure you have [Bun](https://bun.sh/) installed:

```bash
bun --version
```

### 2. Environment Variables

Create a `.env.local` or `.env` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Install Dependencies

```bash
bun install
```

### 4. Run Development Server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```text
├── app/
│   ├── (auth)/              # Authentication routes (login, signup, reset)
│   ├── api/                 # Browser-side Supabase mutation helpers (not route handlers)
│   ├── dashboard/
│   │   ├── broker/          # Broker dashboard & deal creation
│   │   └── buyer/           # Buyer dashboard & deals browser
│   ├── layout.tsx           # Global root layout & providers
│   └── globals.css          # Tailwind CSS and theme setup
├── components/
│   ├── ui/                  # Reusable UI primitives (buttons, inputs, cards, tables)
│   ├── app-sidebar.tsx      # Role-aware dashboard sidebar
│   └── ...
├── lib/
│   ├── supabase/            # Supabase browser + server clients
│   └── validations/         # Zod schemas (deals, auth)
└── supabase/                # Database migrations & schemas
```

---

## Available Scripts

- `bun dev` - Starts development server at `http://localhost:3000`
- `bun run build` - Builds production bundle
- `bun run start` - Runs the production build
- `bun run lint` - Runs ESLint checks
- `bun run format` - Formats codebase with Prettier

---

## Security Verification & Tests

### Final Security Tests (Stage 3 - Deal Photos)

1. **Test 1: Buyer Cannot Directly Access a Private Deal Image**
   - **Vector:** Direct HTTP access or Supabase Storage download for an image path in the private `deal-images` bucket belonging to a private deal (`is_private = true`).
   - **Enforcement:** Enforced at the storage layer via PostgreSQL Row Level Security (RLS) on `storage.objects`:
     ```sql
     create policy "users can view accessbile deal image"
     on storage.objects
     for select
     to authenticated
     using (
       bucket_id = 'deal-images'
       and exists (
         select 1 from public.deals
         where (storage.foldername(name))[2] = deals.id::text
         and (deals.is_private = false or deals.broker_id = auth.uid())
       )
     );
     ```
   - **Result:** **PASSED**. A buyer or unauthorized user attempting to access or download a private deal's photo receives a `403 Forbidden` / RLS denial.

2. **Test 2: Buyer Cannot Generate a Signed URL for a Private Deal Image**
   - **Vector:** Requesting signed URLs or querying records from `deal_images` as a buyer for a private deal.
   - **Enforcement:**
     - The `deal_images` table RLS policy `views images of accessible deals` filters out rows where `is_private = true` unless `broker_id = auth.uid()`.
     - Server-side access check in `lib/data/deal-images.ts` explicitly verifies ownership before calling `createSignedUrl`:
       ```typescript
       if (isPrivate && (!user || user.id !== brokerId)) {
         return {
           images: [],
           error: new Error("not allowed to access private deal images"),
         }
       }
       ```
     - Buyer deal page (`app/dashboard/buyer/deals/[id]/page.tsx`) immediately aborts with `notFound()` if `deal.is_private` is true.
   - **Result:** **PASSED**. Buyers cannot query private image paths or generate signed URLs for private deals.
