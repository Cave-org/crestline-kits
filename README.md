# Crestline Kits

Online store for football jerseys in Ghana, with Mobile Money checkout through Paystack.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Postgres + Drizzle ORM · Paystack · Vercel Blob (product photos)

## What's included

**Storefront**
- Homepage: hero, national teams, collections, popular jerseys, name & number banner, retro classics
- Shop pages by category, kit type (home/away/third/retro…), sort and search
- Product page: gallery, size picker with live stock, name & number printing, add to cart / buy now, wishlist
- Cart: quantity, wishlist, remove, promo codes
- Checkout: contact, delivery or pickup, region-based delivery fees, Paystack Mobile Money
- Order confirmation, customer accounts and order history, wishlist, help page with size guide

**Admin (`/admin`)**
- Dashboard: 30-day sales, orders waiting to ship, low-stock alerts
- Orders: filter by status, search, update status, call or WhatsApp the customer
- Products: add, edit, hide or delete, stock per size, photo upload
- Promo codes: percent or fixed amount, minimum spend, usage limits, expiry dates

**Payments:** prices are always recalculated on the server. The order is marked paid only after Paystack confirms it, through both the redirect and the webhook, and stock is deducted once.

## Run it locally

You need Node 20+ and a Postgres database. A free [Neon](https://neon.tech) or [Supabase](https://supabase.com) database works, or use Postgres on your Mac (`brew install postgresql@16`).

```bash
npm install
cp .env.example .env      # then fill in the values
npm run db:push           # create the tables
npm run db:seed           # categories, WELCOME10 promo code, admin account
npm run dev
```

Open http://localhost:3000. Sign in with your `ADMIN_EMAIL` / `ADMIN_PASSWORD` at `/account/login` to reach `/admin`.

## Environment variables

| Name | What it's for |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `AUTH_SECRET` | Signs login sessions. Generate with `openssl rand -base64 32` |
| `NEXT_PUBLIC_SITE_URL` | Your site's URL (Paystack sends customers back here) |
| `PAYSTACK_SECRET_KEY` | From Paystack → Settings → API Keys. Use `sk_test_…` until launch |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | The admin account created by `npm run db:seed` |
| `BLOB_READ_WRITE_TOKEN` | Optional. Enables photo uploads in admin (Vercel → Storage → Blob). Without it, paste image links instead |

## Paystack setup

1. Create a Paystack account for Ghana and turn on **Mobile Money** under Settings → Preferences.
2. Put your secret key in `PAYSTACK_SECRET_KEY`.
3. In Settings → API Keys & Webhooks, set the webhook URL to `https://YOUR-DOMAIN/api/paystack/webhook`.
4. Test with the test key and Paystack's test mobile money numbers, then switch to the live key.

Checkout offers Mobile Money only. To add cards later, add `"card"` to `channels` in `src/lib/paystack.ts`.

## Deploy to Vercel

1. Push this repo to GitHub and import it in Vercel.
2. Add the environment variables above, with `NEXT_PUBLIC_SITE_URL` set to your live domain.
3. Deploy, then run `npm run db:push` and `npm run db:seed` once against the production `DATABASE_URL`.

## Where to change things

- Store name, contact details, delivery fees, free-delivery threshold, printing fee: `src/lib/config.ts`
- Colours and fonts: `src/app/globals.css`
- Database tables: `src/db/schema.ts` (run `npm run db:push` after changes)
- Products and their photos are managed in the admin dashboard; photos are stored in Vercel Blob, not in this repo. `npm run db:seed` only creates the categories, the WELCOME10 promo code and the admin account.
- Copy on the help page (returns policy, delivery times): `src/app/(store)/help/page.tsx`

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run db:push` | Sync the schema to the database |
| `npm run db:seed` | Create categories, promo code and admin account |
| `npm run db:studio` | Browse the database in your browser |
| `npm run lint` / `npm run typecheck` | Checks |
