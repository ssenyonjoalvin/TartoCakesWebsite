# Tarto Cakes UG

Public website and admin dashboard for **Tarto Cakes UG**, a Kampala bakery for custom celebration cakes.

**Tagline:** *Great Taste in Every Bite*

Customers can browse cakes, request a quote, and leave reviews. Staff manage products, orders, reviews, media, and blog content from a private admin area.

Built with **Next.js 16**, **React 19**, **TypeScript**, **Tailwind CSS 4**, **Prisma 7**, and **MySQL / MariaDB**.

---

## What the application does

Tarto is an inquiry-based bakery site. There is no online checkout or payment. A customer chooses a cake (or a custom order), fills in event details, and the bakery follows up by phone or email.

The admin dashboard is where the team:

- Publishes cakes and photos
- Receives quote requests
- Approves customer reviews
- Manages staff accounts, flavors, sizes, and occasions

---

## Public website

| Route | What it does |
| --- | --- |
| `/` | Home page with hero, bakery highlights, and bestselling cakes |
| `/cakes` | Cake gallery filtered by occasion, with star ratings |
| `/cakes/[slug]` | Cake details, size and flavour options, quote link, and reviews |
| `/about` | Bakery story, values, and team |
| `/blog` | Stories and cake ideas |
| `/blog/[slug]` | Full blog post |
| `/contact` | Quote form, phones, email, address, map, and social links |

The header includes **Home**, **Cakes**, **About Us**, **Blog**, **Contact**, and **Request a Quote**.

### Quote requests

From `/contact`, or from a cake page via **Request This Cake** (which prefills the form).

Customers submit:

- Name, email, and phone
- Occasion (or a custom occasion)
- Date the cake is needed
- Cake type, size, and flavour
- Words on the cake (optional inscription)
- Up to 3 reference photos (optional)
- Comments for the team (optional)

Each request is saved as a new order and the customer record is created or updated by email.

### Cake reviews

Reviews live on each cake page, not on a separate reviews page.

- Customers click **Review cake**, rate 1–5 stars, and write a comment
- Email is used only to stop duplicate reviews (one review per email per cake)
- New reviews wait in admin until they are approved
- Approved reviews and average ratings appear on the cake page and gallery cards

### Contact details

- **Phones:** 0700 796 794, 0700 796 743
- **Email:** hello@tartocakes.ug
- **Address:** Pelican House, Stella — Najjanankumbi, Kampala
- **Instagram:** [@tartocakes_ug](https://www.instagram.com/tartocakes_ug)
- **TikTok:** [@tarto.cakesug](https://www.tiktok.com/@tarto.cakesug)
- **Facebook:** [TartoCakesUG](https://www.facebook.com/TartoCakesUG)
- **X:** [@tartocakesUg](https://x.com/tartocakesUg)

The map embed is set in `src/data/contact.ts`. To change the pin, open Google Maps → **Share** → **Embed a map**, copy the URL inside `src="..."`, and paste it as `mapEmbedUrl`.

---

## Admin dashboard

Open [http://localhost:3000/admin/login](http://localhost:3000/admin/login).

Default local login (override in `.env`):

- **Email:** `admin@tartocakes.com`
- **Password:** `TartoAdmin2026`

On phones, use the menu button in the top bar to open navigation.

| Route | Feature |
| --- | --- |
| `/admin` | Dashboard — completion rate, cake sales, inquiries, schedule, recent orders, top cakes |
| `/admin/users` | Staff accounts (admins only) |
| `/admin/blog` | Create and publish blog posts |
| `/admin/products` | Create and edit cakes, photos, prices, and catalog options |
| `/admin/orders` | Incoming quotes — contact details, inscription, comments, photos, status |
| `/admin/reviews` | Approve, hide, or delete customer reviews |
| `/admin/media` | Shared photo library for products, blog, and the site |
| `/admin/customers` | Directory of people who requested quotes |
| `/admin/profile` | Own name, email, password, and photo |
| `/admin/settings/flavors` | Cake flavours used on products and the quote form |
| `/admin/settings/sizes` | Cake sizes (optional servings) |
| `/admin/settings/occasions` | Occasions used in the gallery and quote form |

### Roles

| Role | Access |
| --- | --- |
| **Admin** | Everything, including User Management |
| **Editor** | Everything except User Management |

Sessions last 1 day, or 30 days if **Remember me** is checked. There is no customer login.

### Orders

Quote statuses in the database: `NEW`, `CONTACTED`, `QUOTED`, `CONFIRMED`, `COMPLETED`, `CANCELLED`.

From the order dialog, staff can:

- **Mark responded** (contacted)
- **Mark fulfilled** (completed)

The dialog shows customer contact info, cake details, inscription, team comments, and reference photos.

### Reviews

- **Pending** — submitted, not public yet
- **Approved** — shown on the cake page
- **Hidden** — kept in the system but not shown publicly

### Products

Staff can set name, description, price, occasion, flavour, sizes, photos (upload or library, up to 12), featured, and published. Only published cakes appear on the public site.

### Media

Uploads are stored under `public/images/` (`library`, `products`, `blog`, `avatars`, `quotes`). Allowed types: JPG, PNG, WEBP, GIF. Typical limit is 5MB per file (avatars 2MB). Files in use cannot be deleted.

---

## Getting started

```bash
npm install
```

Copy `.env.example` to `.env` and set:

```
DATABASE_URL="mysql://root@localhost:3306/tarto_cakes"
ADMIN_EMAIL=admin@tartocakes.com
ADMIN_PASSWORD=TartoAdmin2026
AUTH_SECRET=change-this-to-a-long-random-string
```

Start MySQL or MariaDB (XAMPP Control Panel is fine). The app creates the `tarto_cakes` database, tables, and first admin if they are missing.

```bash
npm run setup
npm run dev
```

`npm run dev` also runs setup first. Open [http://localhost:3000](http://localhost:3000).

Sign in at `/admin/login` with `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env` (defaults: `admin@tartocakes.com` / `TartoAdmin2026`).

```bash
npm run build      # production build
npm run start      # production server
npm run lint       # lint
npm run db:studio  # browse tables at http://localhost:5555
npm run db:migrate # create/apply Prisma migrations
```

The first admin account is created by `npm run setup` if the users table is empty. First login also creates one if none exists.

Add cakes, flavours, sizes, and occasions in admin. Those catalog lists drive the public gallery and quote form.

---

## Project structure

```text
src/
  app/(site)/     public pages
  app/admin/      login and dashboard
  components/     site and admin UI
  data/           static about/blog/contact copy
  lib/            Prisma, auth, reviews, images
prisma/           schema and migrations
public/images/    uploaded and site photos
```

---

## Data sources

| Content | Public site | Admin |
| --- | --- | --- |
| Cakes | Database | Database |
| Quotes / orders | Database | Database |
| Reviews | Database (approved only) | Database |
| Flavours, sizes, occasions | Database | Database |
| Customers | Created from quotes | Database |
| Blog | Static `src/data/blog.ts` | Database |
| Contact, map, socials | `src/data/contact.ts` | — |
| About page | Static page copy | — |

Admin blog posts are stored in the database. The public `/blog` pages still read `src/data/blog.ts`.

---

## Brand

| Token | Colour |
| --- | --- |
| Red | `#D62828` |
| Orange | `#F6B21A` |
| Yellow | `#FFC107` |
| Cream | `#FFF4E5` |
| Ink | `#1A1A1A` |

Fonts: **Poppins** (UI), **Pacifico** (wordmark). Favicon: Tarto Cakes UG logo.

---

## Notes

- No payment, cart, or checkout
- No email or SMS notifications — staff follow up from the orders list
- Newsletter fields on the site send people to Contact; there is no subscriber backend
- Dashboard sales figures use completed order cake prices. Product cost / expenses are not tracked
