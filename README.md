# Tarto Cakes UG

Public website for **Tarto Cakes UG**, a Kampala bakery for custom celebration cakes.  
Tagline: *Great Taste in Every Bite*.

Built with **Next.js**, **React**, **TypeScript**, and **Tailwind CSS**.

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
  data/          cakes, blog posts, contact details
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

## Notes

This is the public frontend. Cake and blog content is currently stored in local data files. An admin upload area can be added later.
