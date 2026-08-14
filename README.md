# Tarto Cakes UG

Public website for **Tarto Cakes UG**, a Kampala bakery for custom celebration cakes.  
Tagline: *Great Taste in Every Bite*.

Built with **Next.js**, **React**, **TypeScript**, **Tailwind CSS**, **Prisma**, and **MySQL** (XAMPP MariaDB).

## Pages

| Route | Description |
| --- | --- |
| `/` | Home — hero, features, bestsellers |
| `/cakes` | Cake gallery with category filters |
| `/cakes/[slug]` | Cake details, sizes, flavours, quote request |
| `/about` | Bakery story, values, and team |
| `/blog` | Stories and cake ideas |
| `/blog/[slug]` | Full blog post |
| `/contact` | Quote form, phones, address, map, socials |

## Getting started

```bash
npm install
```

Start MySQL from the XAMPP Control Panel, then create the database and run migrations:

```bash
# once MySQL is running (XAMPP default: user root, no password)
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production build
npm run start   # run the production server
npm run lint    # lint the project
```

## Project structure

```text
src/
  app/           pages and layout
  components/    header, footer, cards, forms
  data/          current public cakes, blog, and contact copy
  lib/prisma.ts  Prisma client (MySQL)
prisma/          schema, migrations, and seed
public/images/   photos used on the site
images/          original image files (copied into public when needed)
```

## Content you can edit

- **Cakes:** `src/data/cakes.ts`
- **Blog:** `src/data/blog.ts`
- **Contact, map, socials:** `src/data/contact.ts`
- **Images:** add files to `public/images/`, then point to them as `/images/your-file.jpg`

### Contact

- Phones: `0700 796 794`, `0700 796 743`
- Address: Pelican House, Stella — Najjanankumbi, Kampala
- Instagram: [@tartocakes_ug](https://www.instagram.com/tartocakes_ug)
- TikTok: [@tarto.cakesug](https://www.tiktok.com/@tarto.cakesug)
- Facebook: [TartoCakesUG](https://www.facebook.com/TartoCakesUG)
- X: [@tartocakesUg](https://x.com/tartocakesUg)

### Google Map

The Contact page embeds Google Maps from `mapEmbedUrl` in `src/data/contact.ts`.

To update the pin:

1. Open [Google Maps](https://www.google.com/maps) and find the bakery
2. **Share** → **Embed a map**
3. Copy only the URL inside `src="..."`
4. Paste it as `mapEmbedUrl`

## Brand

- Red: `#D62828`
- Orange: `#F6B21A`
- Yellow: `#FFC107`
- Cream: `#FFF4E5`
- Ink: `#1A1A1A`
- Fonts: Poppins (UI), Pacifico (wordmark)

## Admin (Tarto Cakes UG)

Open [http://localhost:3000/admin/login](http://localhost:3000/admin/login).

Default local login (override in `.env`):

- Email: `admin@tartocakes.com`
- Password: `TartoAdmin2026`

Copy `.env.example` to `.env` and set `DATABASE_URL`. Admin email, password, and `AUTH_SECRET` are optional — the app has local defaults.

### Database

- **ORM:** Prisma 7
- **Database:** MySQL / MariaDB (`tarto_cakes` on XAMPP, port 3306)
- **Connection:** `DATABASE_URL` in `.env`

```bash
npm run db:migrate   # create/apply migrations
npm run db:seed      # load cakes, blog posts, and contact settings
npm run db:studio    # browse tables at http://localhost:5555
```

Tables: cakes, blog posts, customers, cake orders/inquiries, media, site settings, admin users.

Login uses the `AdminUser` table (not a single env password). The first admin is `admin@tartocakes.com` / `TartoAdmin2026`. Add more staff under User Management — editors can post blogs, and each post is linked to the person who wrote it.

The public site still reads from `src/data/` until the admin modules are wired to Prisma.

Admin modules:

- `/admin` Dashboard
- `/admin/users` User Management — staff accounts and blog authors
- `/admin/blog` Blog Management
- `/admin/products` Product Management
- `/admin/orders` Orders / Inquiries
- `/admin/media` Media Management
- `/admin/customers` Customer Management
- `/admin/settings` Settings

## Notes

Admin modules after login are being built next, now against Prisma + MySQL.
