export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  image: string;
  gallery: string[];
  sections: { heading: string; body: string }[];
  quote?: string;
  featured?: boolean;
};

export const blogPosts: BlogPost[] = [
  {
    id: "5",
    slug: "how-to-order-a-custom-cake-in-kampala",
    title: "How to Order a Custom Cake in Kampala Without Last-Minute Stress",
    excerpt:
      "A baker’s checklist for dates, servings, flavours, and photos — so your Tarto cake arrives calm, fresh, and on time.",
    category: "Tips",
    author: "Sarah Tarto",
    date: "August 20, 2026",
    image: "/images/cooking-with-love.jpg",
    gallery: [
      "/images/chef-shaping-cake.jpg",
      "/images/pouring-cream-in-bowl.jpg",
    ],
    featured: false,
    quote:
      "Give us the date, the guest count, and one clear idea. We will turn that into a cake that tastes as considered as it looks.",
    sections: [
      {
        heading: "Start with the date, not the decoration",
        body: "In our kitchen at Najjanankumbi, the first question is never “what colour?” It is “when do you need it?” A celebration cake is baked to order, then finished, boxed, and delivered with care. We ask for at least a day’s lead time so the sponge can rest and the frosting can set. If the event is this weekend, tell us that first — we will be honest about what we can still do beautifully, and what needs a simpler design. A calm order always tastes better than a rushed one.",
      },
      {
        heading: "Tell us who you are feeding, and how you want it to feel",
        body: "Servings matter more than a sketch. A small family lunch needs a different size from a hall of wedding guests. Share the occasion, the age of the person being celebrated, and any flavours they already love — chocolate, red velvet, vanilla, or something brighter like lemon. Photos from Instagram help, but a short note such as “soft pink, pearls, no cartoon toppers” is often clearer. If you have a wording for the cake, keep it short. We write it by hand, and a clean message photographs better on the table.",
      },
      {
        heading: "Lock the details, then let the bakery work",
        body: "Once size, flavour, and pickup or delivery are agreed, we shop, bake, and decorate for that order only. You do not need to chase every swirl. If you want to taste a flavour first, say so when you request a quote. For Kampala deliveries, leave a reachable phone number and a landmark — Pelican House, Stella is easy to find, and we use the same care when we bring the cake to you. When you are ready, send the date, guest count, and a reference photo through our quote form. We will confirm, bake, and show up on time.",
      },
    ],
  },
  {
    id: "1",
    slug: "top-10-birthday-cake-ideas",
    title: "Top 10 Birthday Cake Ideas to Surprise Your Loved Ones",
    excerpt:
      "From princess themes to classic chocolate drip, here are our favourite birthday cake ideas to inspire your next party.",
    category: "Birthday",
    author: "Tarto Team",
    date: "March 12, 2026",
    image: "/images/chef-making-cake.jpg",
    gallery: ["/images/birthday-chocolate-cake.jpg", "/images/princess-pink-cake.jpg"],
    featured: true,
    quote:
      "A birthday cake should feel like a hug — colourful, personal, and impossible to forget.",
    sections: [
      {
        heading: "Start with the person, not the trend",
        body: "The sweetest birthday cakes begin with a story. Favourite colours, a hobby, a childhood flavour — these details turn a beautiful bake into a memory. At Tarto Cakes UG, we sketch each design around the person being celebrated, then build flavour and finish to match.",
      },
      {
        heading: "Chocolate drip, princess themes, and classic red velvet",
        body: "A glossy chocolate drip still steals the table. Princess cakes in pink, red, and yellow make little birthdays feel magical. And a tall red velvet with cream cheese frosting remains the crowd-pleaser for grown-up parties. Mix textures — pearls, cherries, gold leaf — to keep the look rich without overcrowding the cake.",
      },
      {
        heading: "Make it personal",
        body: "Add a handwritten message, a favourite snack on top, or a flavour the guest of honour actually loves. A cake that tastes like home will always outshine a cake that only looks impressive. Share your date, servings, and theme with us — we will handle the rest with care.",
      },
    ],
  },
  {
    id: "2",
    slug: "wedding-cake-trends",
    title: "Wedding Cake Trends Couples Love This Year",
    excerpt:
      "Elegant whites, soft blues, and castle-inspired tiers — see what’s trending for wedding cakes in Uganda.",
    category: "Wedding",
    author: "Tarto Team",
    date: "February 28, 2026",
    image: "/images/white-wedding-cake.jpg",
    gallery: ["/images/castle-wedding-cake.jpg", "/images/light-blue-wedding-cake.jpg"],
    quote:
      "The best wedding cakes feel like the couple — graceful, joyful, and made to be shared.",
    sections: [
      {
        heading: "Timeless white, with a modern twist",
        body: "Clean white tiers still lead the season, now softened with sugar flowers, pearls, and a hint of texture. Couples are choosing quieter luxury — fewer heavy ornaments, more refined piping, and finishes that photograph beautifully in natural light.",
      },
      {
        heading: "Soft blues and castle romance",
        body: "Dusty blue and castle-inspired designs are having a moment for formal ceremonies. They feel fairy-tale without becoming costume. Pair a sculpted silhouette with simple florals and the cake becomes a centrepiece, not a distraction.",
      },
      {
        heading: "Flavour still matters most",
        body: "Guests remember how the cake tasted. Vanilla bean, lemon, chocolate, and red velvet remain our most requested wedding flavours. We can mix tiers so every guest finds a favourite slice.",
      },
    ],
  },
  {
    id: "3",
    slug: "how-to-choose-cake-flavours",
    title: "How to Choose the Perfect Cake Flavours",
    excerpt:
      "Not sure between red velvet, chocolate, or vanilla? A simple guide to picking flavours everyone will love.",
    category: "Tips",
    author: "Tarto Team",
    date: "February 10, 2026",
    image: "/images/purple-butter-cream-cake.jpg",
    gallery: ["/images/red-velvet.jpg", "/images/chocolate-layered-cake.jpg"],
    quote:
      "Beauty catches the eye. Flavour is what makes people come back for a second slice.",
    sections: [
      {
        heading: "Think about the room, not just your favourite",
        body: "A party cake should please a table, not only one person. Chocolate and vanilla are safe, beloved bases. Red velvet feels festive. Lemon and berry cut through richness on a warm afternoon. If the guest list is mixed, offer two flavours or a classic sponge with a standout filling.",
      },
      {
        heading: "Match flavour to the occasion",
        body: "Birthdays love chocolate drip and bright buttercream. Weddings lean toward vanilla, almond, and delicate fruit. Romantic cakes can carry berry or coffee notes. Tell us the time of day, the theme, and who you are baking for — we will suggest a pairing that tastes as considered as it looks.",
      },
      {
        heading: "Fresh ingredients make the difference",
        body: "No flavour can hide a tired sponge. We bake to order with ingredients we trust, so the slice is moist, balanced, and worth the celebration. When in doubt, start with a flavour you already love and let us refine the finish.",
      },
    ],
  },
  {
    id: "4",
    slug: "princess-party-cakes",
    title: "Princess Party Cakes That Steal the Show",
    excerpt:
      "Pink, red, and yellow princess designs that turn birthday tables into fairytale moments.",
    category: "Birthday",
    author: "Tarto Team",
    date: "January 22, 2026",
    image: "/images/princess-pink-cake.jpg",
    gallery: ["/images/princess-yellow-cake.jpg", "/images/princess-red-cake.jpg"],
    quote:
      "A princess cake should feel like the first page of a storybook — bright, kind, and full of wonder.",
    sections: [
      {
        heading: "Colour that feels magical, not noisy",
        body: "Soft pink pearls, sunny yellow swirls, and bold red details can all work — the secret is balance. We keep one colour as the hero and use white frosting, butterflies, and pearls as quiet supporting notes so the cake stays elegant on the table.",
      },
      {
        heading: "Details children remember",
        body: "A named topper, a favourite character colour, or a ring of cupcakes around the main cake makes the moment feel made just for them. Parents love a design that photographs well; little guests love a cake that looks like a celebration.",
      },
      {
        heading: "Flavour they will actually eat",
        body: "Vanilla, strawberry, and light chocolate are the safest princess-party winners. We can still dress the outside like a fairytale while keeping the inside friendly for young palates. Share your theme and guest count — we will design the rest.",
      },
    ],
  },
];

export function getFeaturedPost() {
  return blogPosts.find((post) => post.featured) ?? blogPosts[0];
}

export function getRecentPosts(limit = 3) {
  return blogPosts.slice(0, limit);
}

export function getPostBySlug(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}

export function getRelatedPosts(slug: string, limit = 3) {
  const current = getPostBySlug(slug);
  if (!current) return blogPosts.slice(0, limit);
  const sameCategory = blogPosts.filter(
    (post) => post.slug !== slug && post.category === current.category
  );
  const others = blogPosts.filter(
    (post) => post.slug !== slug && post.category !== current.category
  );
  return [...sameCategory, ...others].slice(0, limit);
}
