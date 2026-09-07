# Practice project — a small deal board

1. **Build it fresh.** New Next.js app (`bun create next-app@latest`), your own
   repo. Not our codebase.

2. **What it does:** brokers post deals, buyers browse them. Some deals are
   private — buyers must not see those at all.

3. **Auth is all Supabase Auth.** Signup and login with a password, login with a
   one-time email code, forgot password, change password, change email. No
   NextAuth, no custom users table, no password hashing of your own.

4. **Two roles — broker and buyer.** `auth.users` holds only the login. Make a
   separate `profiles` table for role, name, company, phone. The role is picked
   at signup and the user can never change it. Each role gets its own dashboard
   showing their details.

5. **Broker posts a deal** (title, city, price, public or private). **Buyer sees
   a feed of public deals only.** That privacy must be enforced by the database
   with row-level security — not by a filter in your page code.

6. **Then prove it.** Sign in as a buyer, call the Supabase API directly with
   their token, and try to read a private deal. It must come back empty.

Take it one piece at a time, and ask whenever you are stuck for more than half
an hour.

---

Once this is clear, the full spec is in `REQUIREMENTS.md` (what) and `TASK.md`
(how, in order).
