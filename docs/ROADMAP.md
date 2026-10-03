    # Tarto Cakes UG — Improvement Roadmap

_Audit date: 2026-10-03 · Branch audited: `develop` · Live preview: tarto-cakes-website-git-develop-…vercel.app_

This document is the plan for turning the current site into a conversion-focused cake ordering site. It is based on reading the code and the live preview, plus a review of seven Ugandan cake sites.

## Decisions already made

| Topic | Decision | Why |
| --- | --- | --- |
| Backend | **Keep Next.js + Prisma + MySQL (Aiven).** UI talks only to `src/lib/*` data functions, never to Prisma directly. | A working admin, orders, reviews and catalog already exist. A Spring Boot rewrite would throw that away. If a Java API is ever added, only `src/lib/public-*.ts` changes. |
| Ordering model | **Quote request + structured WhatsApp message. No cart, no online payment.** | Custom cakes are priced by hand. Every competitor that converts well locally uses WhatsApp or a quote form. A cart adds complexity without matching how Tarto sells. |
| Business facts | **Nothing is invented.** Unknown facts live in one config file (`src/data/business.ts`) as `null`, and the UI hides any section whose data is missing. | Customers never see "[TBD]" text, and nothing false is published. |

---

## 1. Current website audit

Priority key: **Critical** (fix before launch) · **High** · **Medium** · **Low** · **Optional**.

### Pages & navigation
| Area | Finding | Priority |
| --- | --- | --- |
| Pages | `/`, `/cakes`, `/cakes/[slug]`, `/about`, `/blog`, `/blog/[slug]`, `/contact`. `/reviews` just redirects to `/cakes`. | — |
| Missing pages | No delivery info, FAQ, custom cake builder, or quote confirmation page. | High |
| Navigation | Clear and short (Home, Cakes, About, Blog, Contact + "Request a Quote"). Mobile menu works. | — |
| Mobile menu | Uses text glyphs (☰/✕), has no `aria-expanded`/`aria-controls`, doesn't close on Escape, and links have small touch targets (~36px). | Medium |
| 404 / errors | No custom `not-found`, `error` or `loading` pages. A DB outage shows the default Next.js error. | High |

### Homepage
| Area | Finding | Priority |
| --- | --- | --- |
| Hero | Good imagery and a clear tagline. The headline says *what* ("Great Taste in Every Bite") but not *where* or *how to order*. No "Create your cake" path. | High |
| Hero carousel | Auto-rotates every 5s with no pause and ignores `prefers-reduced-motion`. All 3 slides load eagerly at `quality=95`, which is heavy on mobile data. | Medium |
| Feature strip | "On Time Delivery", "100% Satisfaction" are unverified claims. | High (confirm) |
| Bestsellers | Good. Uses `featured` cakes from the DB. | — |
| Missing sections | Shop by occasion, how it works, reviews, gallery, FAQ teaser, and the WhatsApp CTA. | High |

### Catalog & product
| Area | Finding | Priority |
| --- | --- | --- |
| `/cakes` | Occasion filter chips work. No search, sort or price filter. That's fine at today's catalog size but will matter as cakes grow. | Medium |
| Product cards | Consistent 4:5 ratio and `object-cover` (no distortion). They show name, rating and price but no occasion, no short description, and no "from" price wording. | Medium |
| Product page | Strong: gallery, sizes, flavours, reviews, related cakes, and a prefilled quote link. | — |
| Price wording | Shows "UGX 120,000" as if fixed, although size and flavour change the price. | High (confirm) |
| "24h Lead Time" | A hard-coded claim in `CakeOrderOptions`. | High (confirm) |
| Thumbnails | Gallery thumbnails have `alt=""` and all share the label "View photo". | Low |

### Ordering & forms
| Area | Finding | Priority |
| --- | --- | --- |
| Quote form | Thorough: occasion, date, size, flavour, inscription, 3 reference photos, and server-side validation. | — |
| Form errors | One error message for the whole form, shown at the bottom. The field that needs fixing isn't highlighted. | Medium |
| Spam | The review form has a honeypot. The **quote form has none and no rate limit**, and each spam submit can upload 3 images to Cloudinary. | High |
| Confirmation | An inline "Thank you!" with no order summary or reference number. | Medium |
| WhatsApp | **None anywhere.** This is the #1 local ordering channel. | Critical |
| Newsletter | The footer form has **no action**, so "Subscribe" just reloads the page. It looks broken. | High |

### Trust & content
| Area | Finding | Priority |
| --- | --- | --- |
| About page | "1,000+ Smiles Delivered", the baker names and bios (Sarah Tarto, John Musoke, Grace Nakato), "Ethical Sourcing" and "100% Better Quality" need owner confirmation. If any are placeholders, they must come down before launch. | **Critical (confirm)** |
| Reviews | Real, moderated, per-cake reviews. Good, but not surfaced on the homepage. | Medium |
| Contact | Phones, email, map and socials are all present. | — |
| Delivery info | None (areas, fees, notice, pickup). | High |

### Visual design
| Area | Finding | Priority |
| --- | --- | --- |
| Brand | Red/orange/yellow/cream is warm and distinctive, so we keep it. | — |
| Contrast | `text-tarto-orange` (#F6B21A) on cream is ≈1.7:1. It's used for eyebrow labels and hero words in 14 places. White text on the orange CTA button is ≈1.9:1. Both fail WCAG AA (4.5:1 text, 3:1 large). | High |
| Typography | Poppins for everything plus Pacifico for the wordmark. Hierarchy is OK. Headings are sometimes ALL CAPS ("OUR BESTSELLERS"), which is harder to read. | Low |
| Components | Button styles are copy-pasted in ~20 places with slight differences (rounded-full vs rounded-md vs rounded-xl). | Medium |
| Focus states | Browser default only, and some elements have `outline-none` with no replacement. | High |

### SEO, performance, accessibility
| Area | Finding | Priority |
| --- | --- | --- |
| Metadata | Title template and per-page descriptions exist. No Open Graph images, no canonical URLs. | High |
| Sitemap / robots | Missing. `/admin` is not `noindex`. | High |
| Structured data | None (no LocalBusiness/Bakery, no Product). | Medium |
| Images | `next/image` is used everywhere (good). Local photos total 4.3MB. Hero and gallery are forced to `quality=95`. | Medium |
| Caching | `/blog` is `force-dynamic`. Cake pages hit the DB on every request. | Low |
| Accessibility | Labels on forms are good. Missing: skip link, reduced motion, focus styles, `aria-current`, `aria-pressed` on chips and thumbnails. | High |

---

## 2. Competitor comparison

Reviewed: Cake Album UG, Cake Studio UG, Stuart Cakes UG, The Indulge Cake Haven, Florie Cakes, Kher Fetea Shoppe, eShop Uganda. Stuart Cakes was unreachable on 2026-10-03 (DNS failure), and eShop's SSL certificate had expired. Florie's site returned no readable content, and Cake Studio's details came from search listings only. Notes below cover what could be seen.

| Feature | Tarto (now) | Cake Album | Indulge | Kher Fetea | eShop UG | Pattern worth adapting |
| --- | --- | --- | --- | --- | --- | --- |
| Categories | Occasions (DB) | 8 incl. Traditional, Corporate, Kids | 4 catalog groups | 6 groups | Many | Add **Traditional/Introduction**, **Corporate**, **Kids** occasions if Tarto makes them |
| Prices shown | Yes, fixed-looking | Some, plus "live estimate" | No (form for estimate) | Placeholders | Yes (cart) | Show **"From UGX …"** |
| Custom builder | No | Yes, sends to WhatsApp | Form → email + WhatsApp | No | No | **Guided builder that ends in quote + WhatsApp** |
| WhatsApp | No | Primary channel | Dual submit | No | No | **WhatsApp everywhere: header, product, builder, sticky mobile** |
| Delivery info | No | Lead times, same-day, coverage | Pickup / Kampala / upcountry | "By zone" | Flat city fee | **Delivery page with notice periods & pickup** |
| Reviews | Per-cake, moderated | Homepage testimonials | Testimonials | Testimonials | — | **Surface approved reviews on homepage** (real ones only) |
| Trust | Contact, socials | Stats, award, founders | Mission, address, hours | Opening date, hygiene badges | Address | **Opening hours, physical address, real founder story** |
| FAQ | No | Yes | — | — | — | **FAQ page** |
| Cart/checkout | No (by choice) | No | No | No | Yes | Confirms the quote + WhatsApp model fits the local market |

**Main takeaway:** The best local site (Cake Album) wins on **WhatsApp-first ordering, a cake builder, clear lead times and visible proof**. Tarto already has better *infrastructure* (real catalog, moderated reviews, an admin that tracks orders) but hides it behind a generic quote form.

---

## 3. Recommended information architecture

```
/                       Home — what, why trust, how to order
/cakes                  Catalog — search, occasion, flavour, sort
/cakes/[slug]           Cake details — sizes, flavours, from-price, quote, WhatsApp
/design-your-cake       Guided builder → quote request + WhatsApp
/quote/thank-you        Confirmation with summary + reference
/delivery               Areas, fees, notice, pickup (owner-supplied)
/faq                    Questions (owner-confirmed answers only)
/about                  Story, values, team (owner-confirmed)
/blog, /blog/[slug]     Ideas & guides (SEO)
/contact                Contact details, map, short quote form
```
Header: **Cakes · Design Your Cake · About · Blog · Contact** + **WhatsApp** + **Request a Quote**.

## 4. Component structure

```
src/components/ui/        Button / ButtonLink, SectionHeading, Badge, Alert,
                          Skeleton, Field (Input/Select/Textarea)
src/components/           Site sections (Header, Footer, HomeHero, CakeCard, …)
src/data/business.ts      Owner-supplied facts (WhatsApp, hours, delivery, FAQ, stats)
src/data/contact.ts       Existing contact/social config
src/lib/public-*.ts       Data-access layer (Prisma today, any API tomorrow)
src/lib/whatsapp.ts       Builds the structured order message
```

---

## 5. TODO backlog

### P0 — Critical (before launch)

```text
ID: TRUST-001
Feature: Remove or confirm unverified claims
Problem: About page and homepage show stats, staff and promises
  that may not be real ("1,000+ Smiles Delivered", 3 named bakers,
  "100% Satisfaction", "24h Lead Time", "Ethical Sourcing").
Proposed solution: Move every claim into src/data/business.ts. Render
  only confirmed ones. Remove unconfirmed ones.
Priority: P0   Complexity: Low   Dependencies: Owner answers (§8)
Affected: about/page.tsx, (site)/page.tsx, CakeOrderOptions.tsx
Acceptance criteria:
- No number, name, award or policy appears unless owner confirmed it.
- Unconfirmed sections disappear cleanly (no empty boxes).
```

```text
ID: ORD-001
Feature: WhatsApp ordering
Problem: No WhatsApp option, the main way Ugandan customers order.
Proposed solution: Configurable number (NEXT_PUBLIC_WHATSAPP_NUMBER).
  Build a structured message in src/lib/whatsapp.ts. Add buttons in
  header, product page, builder, quote confirmation, plus a sticky
  mobile button.
Priority: P0   Complexity: Low   Dependencies: Owner WhatsApp number
Affected: Header, CakeOrderOptions, builder, Footer
Acceptance criteria:
- Button hidden when number not configured.
- Message includes name, cake, size, flavour, message, date, location.
- Opens wa.me on mobile and WhatsApp Web on desktop.
```

```text
ID: INFRA-001
Feature: Production database reliability
Problem: Aiven free tier powers off when idle. The live site then
  fails completely (seen 2026-10-03: ENOTFOUND).
Proposed solution: Move to a paid Aiven plan (or another always-on
  MySQL) before launch. Add error.tsx so the public site degrades
  gracefully.
Priority: P0   Complexity: Low (ops)   Dependencies: Budget decision
Acceptance criteria:
- DB stays reachable for 7 days without manual power-on.
- If the DB fails, visitors see a friendly page with phone + WhatsApp.
```

```text
ID: INFRA-002
Feature: Stop running setup on every dev start
Problem: `predev` runs prisma/setup.ts (schema diff + seed) against
  the remote production DB on every `npm run dev`.
Proposed solution: Remove predev. Keep `npm run setup` manual. Use a
  separate dev database.
Priority: P0   Complexity: Low   Dependencies: none
Acceptance criteria:
- `npm run dev` never writes to the DB.
- README documents the separate dev DB.
```

```text
ID: FIX-001
Feature: Broken newsletter form
Problem: Footer "Subscribe" has no action and silently reloads.
Proposed solution: Replace with a "Follow us / Chat with us" block
  until a subscriber backend exists.
Priority: P0   Complexity: Low   Dependencies: none
Acceptance criteria: No control on the site that does nothing.
```

```text
ID: A11Y-001
Feature: Colour contrast
Problem: Orange text on cream (≈1.7:1) and white-on-orange button
  (≈1.9:1) fail WCAG AA.
Proposed solution: Add an accessible text token (deep amber) for
  orange-coloured text. Keep bright orange for fills and decoration only.
Priority: P0   Complexity: Low   Dependencies: DS-001
Acceptance criteria: All text ≥4.5:1 (≥3:1 for 24px+ bold).
```

```text
ID: SEC-001
Feature: Quote form spam protection
Problem: No honeypot or rate limit. Each spam submit can push 3 images
  to Cloudinary and create a fake order + customer.
Proposed solution: Honeypot field (same as reviews) plus a per-IP rate
  limit on the server action.
Priority: P0   Complexity: Low   Dependencies: none
Acceptance criteria: Bot submissions with the honeypot filled are
  dropped silently. More than N requests/hour per IP are rejected.
```

### P1 — High priority

```text
ID: DS-001
Feature: Design system foundation
Problem: Buttons, headings and spacing are copy-pasted with drift.
  No focus styles.
Proposed solution: Tokens in globals.css plus components/ui (Button,
  ButtonLink, SectionHeading, Badge, Alert, Skeleton). Global
  :focus-visible ring and reduced-motion rules.
Priority: P1   Complexity: Medium   Dependencies: none
Affected: all public pages
Acceptance criteria:
- One Button component used for all public CTAs.
- Visible focus ring on every interactive element.
- Animations disabled under prefers-reduced-motion.
```

```text
ID: NAV-001
Feature: Accessible, touch-friendly navigation
Problem: Mobile menu lacks aria state, Escape/route-change close and
  44px targets. No skip link.
Proposed solution: Rebuild menu toggle with aria-expanded/controls,
  SVG icons, close on navigation/Escape, aria-current on active link,
  skip-to-content link.
Priority: P1   Complexity: Low
Acceptance criteria: Keyboard-only user can open, use and close the
  menu. All tap targets ≥44px.
```

```text
ID: STATE-001
Feature: Loading, error and 404 states
Problem: No loading.tsx, error.tsx or not-found.tsx.
Proposed solution: Skeleton cards for /cakes and cake pages, friendly
  error with retry + phone, branded 404 with links to cakes.
Priority: P1   Complexity: Low
Acceptance criteria: Every public route shows a branded state for
  loading, failure and missing content.
```

```text
ID: HOME-001
Feature: Homepage restructure
Problem: Homepage doesn't explain how to order or show proof.
Proposed solution: Sections in this order: Hero (View Our Cakes /
  Create Your Cake) → Shop by Occasion (DB occasions) → Bestsellers →
  How It Works (5 steps) → Recent approved reviews → Gallery →
  FAQ teaser → Final CTA "Have a cake in mind? Let's create it."
Priority: P1   Complexity: Medium   Dependencies: DS-001, TRUST-001
Acceptance criteria: Each section hides when it has no data. No
  invented stats.
```

```text
ID: ORD-002
Feature: Design Your Cake builder
Problem: Custom orders go through one long generic form.
Proposed solution: /design-your-cake, 8 steps (occasion, size, flavour,
  decoration, message, inspiration upload, delivery, review). Reuses
  submitQuoteRequest on the server. Ends in quote request and/or
  WhatsApp. Options come from the DB catalog (CakeSize, CakeFlavor,
  Occasion).
Priority: P1   Complexity: High   Dependencies: ORD-001, DS-001
Acceptance criteria:
- Works one-handed on a 320px screen.
- Progress saved if user goes back.
- No exact price promised for custom work; shows "We'll confirm price".
```

```text
ID: ORD-003
Feature: Quote confirmation page
Problem: Inline "Thank you" with no summary or reference.
Proposed solution: Redirect to /quote/thank-you?ref=… showing summary,
  next steps, expected response time (owner-supplied) and WhatsApp
  follow-up.
Priority: P1   Complexity: Low
```

```text
ID: FORM-001
Feature: Field-level form errors
Problem: One generic error at the bottom of the form.
Proposed solution: Server action returns { fieldErrors }. Inputs get
  aria-invalid + aria-describedby. Focus moves to the first error.
Priority: P1   Complexity: Medium
```

```text
ID: PRICE-001
Feature: "From" pricing
Problem: Price looks fixed though size/flavour change it.
Proposed solution: Display "From UGX X" and a one-line note on the
  product page (wording owner-confirmed).
Priority: P1   Complexity: Low   Dependencies: Owner confirmation
```

```text
ID: DEL-001
Feature: Delivery page
Problem: No delivery areas, fees, notice period or pickup info.
Proposed solution: /delivery rendered from business.ts. Sections
  hidden until supplied.
Priority: P1   Complexity: Low   Dependencies: Owner info
```

```text
ID: FAQ-001
Feature: FAQ page
Proposed solution: /faq from business.ts (question + confirmed answer).
  Unanswered questions not shown. FAQPage JSON-LD.
Priority: P1   Complexity: Low   Dependencies: Owner answers
```

```text
ID: SEO-001
Feature: Technical SEO
Proposed solution: sitemap.ts (cakes + posts), robots.ts (disallow
  /admin, /api), noindex on admin layout, metadataBase + canonical,
  Open Graph image per cake/post, Bakery LocalBusiness JSON-LD on
  home/contact, Product JSON-LD on cake pages.
Priority: P1   Complexity: Medium
```

### P2 — Medium priority

```text
ID: CAT-001  Catalog search, flavour filter and sort (name, price, popular).
  URL-synced (?q=&occasion=&flavor=&sort=) so filters are shareable.
  Complexity: Medium.
ID: CAT-002  Product card: occasion badge, 1-line description,
  "From" price, View + WhatsApp actions. Complexity: Low.
ID: GAL-001  Homepage gallery of real work filtered by occasion
  (reuses product images). Complexity: Medium.
ID: PERF-001  Image tuning: drop forced quality=95 to 80–85, lazy-load
  non-first hero slides, compress local JPGs, AVIF via next.config.
  Complexity: Low.
ID: PERF-002  Cache public catalog (revalidate tags on admin save)
  instead of querying per request. Remove force-dynamic on blog.
  Complexity: Medium.
ID: ABOUT-001  Rebuild About from confirmed story, mission, values, team.
  Complexity: Low. Dependency: owner content.
ID: A11Y-002  aria-pressed on filter chips and gallery thumbnails,
  descriptive thumbnail alts, pause control on hero carousel.
ID: DOC-001  Update README (Aiven, Cloudinary, no predev, env vars).
```

### P3 — Future

```text
ID: ANL-001  Privacy-reviewed analytics (cake views, WhatsApp clicks,
  quote submits). Prefer cookieless (Vercel Analytics / Plausible).
ID: NOTIF-001  Email/WhatsApp notification to staff on new quote.
ID: PROMO-001  Promotions/banners managed in admin.
ID: DEL-002  Delivery zones + fees managed in admin (SiteSetting).
ID: PAY-001  Mobile Money deposit for confirmed orders (only if owner wants).
ID: API-001  Optional REST layer (route handlers) if a mobile app or
  Java service needs the data.
```

---

## 6. Implementation phases

| Phase | Scope | Backlog IDs |
| --- | --- | --- |
| 1 — Foundation | Tokens, UI primitives, nav, focus/contrast/motion, loading/error/404, footer fix, image tuning, admin noindex | DS-001, NAV-001, A11Y-001, STATE-001, FIX-001, PERF-001 (part), A11Y-002 (part) |
| 2 — Product | Catalog search/sort/filter, cards, "From" price, gallery | CAT-001/002, PRICE-001, GAL-001 |
| 3 — Ordering | WhatsApp, builder, confirmation, field errors, spam guard | ORD-001/002/003, FORM-001, SEC-001 |
| 4 — Trust | Delivery, FAQ, About, homepage reviews, claims cleanup | DEL-001, FAQ-001, ABOUT-001, TRUST-001, HOME-001 |
| 5 — SEO & perf | Sitemap, robots, JSON-LD, OG, caching | SEO-001, PERF-002 |
| 6 — Integration | Keep `src/lib/public-*` as the single data boundary; document contract | API-001 (only if needed) |

## 7. Technical risks

1. **Aiven free tier sleeps.** The production site goes down until someone powers it on (INFRA-001).
2. **Serverless + MySQL connections.** Each Vercel function instance opens its own pool (default limit 10 in prod). Under traffic this can exhaust Aiven's connection cap. Mitigation: `DATABASE_CONNECTION_LIMIT=2–3` on Vercel, and caching the catalog (PERF-002).
3. **Setup script against prod** (INFRA-002). Schema diffs are applied as raw SQL without migration history.
4. **Cloudinary abuse** via unauthenticated quote uploads (SEC-001).
5. **Static content drift:** `src/data/blog.ts` and `src/data/cakes.ts` still exist next to the DB versions, so it's easy to edit the wrong one.
6. **Next.js 16 / React 19** are very new. Check library compatibility before adding dependencies.

## 8. Questions for the Tarto business owner

Please answer each item, or mark it "don't show".

**Ordering**
1. WhatsApp number for orders (may differ from call numbers)?
2. Minimum notice for standard cakes? For custom/wedding cakes? Same-day possible?
3. Typical response time to a quote request?
4. Accepted payment methods (MTN MoMo, Airtel Money, cash, bank)? Is a deposit required?
5. Can customers change or cancel orders? Until when?

**Pricing**
6. Are listed prices the *starting* price for the smallest size? What wording do you prefer ("From UGX…")?
7. Sizes offered (inches / tiers / servings)?

**Delivery**
8. Delivery areas and fees (flat, by zone, by distance)?
9. Is pickup available? Address and hours?
10. Opening hours?

**Products**
11. Full list of flavours, fillings and decoration styles you actually offer.
12. Do you make Traditional/Introduction, Corporate, Graduation, Kids, Anniversary cakes?

**Trust & About**
13. Is "1,000+ Smiles Delivered" accurate? Any other real numbers (years in business, cakes baked)?
14. Are Sarah Tarto, John Musoke and Grace Nakato real team members, and are those their photos?
15. Founding story: when and how Tarto started.
16. Are "24h Lead Time", "On Time Delivery", "100% Satisfaction" and "Ethical Sourcing" commitments you stand behind?
17. Any awards, certifications (e.g. UNBS) or press?

**Infrastructure**
18. Budget approval for an always-on database (≈ USD 20–30/month)?

---

## 9. Progress log

### Phase 1 — Foundation (2026-10-03) ✅

**Changed**
- Design tokens: `--tarto-amber` (text-safe orange, 5.8:1 on cream), global `:focus-visible` ring (white on `data-surface="dark"` sections), `prefers-reduced-motion` support. (`globals.css`)
- New UI primitives in `src/components/ui/`: `Button` / `ButtonLink` / `buttonClasses` (4 variants, 44px+ touch targets), `SectionHeading`, `Skeleton` / `CakeCardSkeleton` / `CakeGridSkeleton`.
- Header: SVG menu icon, `aria-expanded`/`aria-controls`, Escape closes the menu, `aria-current`, 44px targets. Skip-to-content link in the site layout.
- Hero: eyebrow "Custom cakes in Kampala", clearer subcopy, **View Our Cakes** + **Create Your Cake** CTAs. The carousel pauses on hover or focus and doesn't rotate under reduced motion. Hidden slides are `aria-hidden`, quality lowered 95→85, and non-first slides are no longer forced to load eagerly.
- Contrast: all orange eyebrow text → amber, CTA banner button now ink on yellow.
- Footer: the non-working newsletter form was replaced with a "Plan Your Cake → Browse Cakes" block (FIX-001).
- Cards, chips and galleries: shared `ButtonLink`, `aria-pressed` on occasion chips, size/flavour chips and thumbnails, descriptive thumbnail labels, and the image link was removed from tab order (one focus stop per card).
- Quote form: fixed a duplicate "Custom Cake" option when arriving via `?cake=Custom Cake`. Inputs are 16px on mobile (stops iOS zoom-on-focus), have a visible focus ring, and "Remove photo N" labels.
- States: `cakes/loading.tsx`, `cakes/[slug]/loading.tsx`, `(site)/error.tsx` (retry + call button), branded 404 (`not-found.tsx` at root and in `(site)`).
- `/admin` now sends `noindex, nofollow`.

**Tests performed**
- `tsc --noEmit` passes. ESLint: no new errors (7 existing `set-state-in-effect` errors in admin/ContactForm, untouched).
- HTTP smoke test on dev server: `/`, `/cakes`, `/cakes/[slug]`, `/about`, `/contact`, `/blog` → 200. Unknown URL → 404 with branded page. `/admin/login` has robots noindex.

**Known behaviour**
- `/cakes/<missing-slug>` returns HTTP 200 (with `noindex` + the 404 UI) because `loading.tsx` streams the response before `notFound()` runs. Search engines respect the noindex. A true 404 status would need the slug check to happen before streaming (revisit in Phase 5).

**Not yet done / assumptions**
- Unverified claims (TRUST-001) are left in place until the owner answers §8. Removing real information would be worse than waiting a few days.
- No visual browser test at every breakpoint yet. Phase 2 should include a manual pass at 320/375/768/1024/1440.

### Phase 2 — Product experience (2026-10-03) ✅ (uncommitted)

**Changed**
- **Catalog (CAT-001):** search (all words must match across name, description, occasion and flavours, accent-insensitive), occasion chips, flavour filter, and sort (featured, price ↑/↓, top rated, name). Filters live in the URL (`/cakes?occasion=wedding&sort=price-asc`). The page reads them on the server, so shared links and the first HTML are already filtered. Typing uses `history.replaceState`, so there's no reload and no history spam. Includes a result count (`role="status"`), "Clear filters", and an empty state with a custom-cake CTA. Occasion chips only show occasions that have published cakes. Flavour options come from published cakes only. Chips scroll horizontally on phones.
- Logic lives in `src/lib/catalog-filter.ts` (pure functions, no React/Prisma), so a future API can reuse it.
- **Cards (CAT-002):** occasion badge (catalog only), 2-line description, larger price, "Photo coming soon" fallback, tighter `sizes`.
- **"From" pricing (PRICE-001):** `src/lib/pricing.ts` plus a `business.pricing.listedPriceIsStartingPrice` flag in `src/data/business.ts`. **Off by default** until the owner confirms (§8 Q6). When on, cakes with several sizes/flavours show "From UGX …" and the detail page explains the final price is confirmed before baking.
- **Homepage:** "Shop by occasion" grid (DB occasions, each with a real cake photo and design count, linking to the filtered catalog) and a "View All Cakes" button under bestsellers.

**Tests performed**
- `tsc` passes. No new lint errors.
- 13 assertions on the filter module (filtering, multi-word search, each sort, URL round-trip, invalid `sort` param) all pass.
- Dev server: `/`, `/cakes`, `?occasion=wedding` (5 cards), `?q=zzzz` (empty state), `?sort=price-desc` (most expensive first) all return 200 with correct server-rendered cards.

**Decisions / not done**
- **Price-range filter skipped:** with ~15 cakes, price sorting covers the need. Revisit past ~40 cakes.
- **Separate gallery (GAL-001) deferred:** it would duplicate the catalog. It's better built in Phase 4 once the owner confirms which photos are Tarto's own work (some may be stock images, see §8).
- Still no visual pass at each breakpoint (320–1440px).
