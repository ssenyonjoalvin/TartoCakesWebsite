export type CakeCategory =
  | "birthday"
  | "wedding"
  | "princess"
  | "custom"
  | "romantic";

export type Cake = {
  id: string;
  slug: string;
  name: string;
  price: number;
  category: CakeCategory;
  image: string;
  description: string;
  sizes: string[];
  flavors: string[];
  featured?: boolean;
};

export const categoryLabels: Record<CakeCategory | "all", string> = {
  all: "All",
  birthday: "Birthday Cakes",
  wedding: "Wedding Cakes",
  princess: "Princess Cakes",
  custom: "Custom Cakes",
  romantic: "Romantic Cakes",
};

export const cakes: Cake[] = [
  {
    id: "1",
    slug: "red-velvet",
    name: "Red Velvet Cake",
    price: 120000,
    category: "birthday",
    image: "/images/red-velvet.jpg",
    description:
      "A classic red velvet cake with smooth cream cheese frosting — rich, moist, and perfect for celebrations.",
    sizes: ['6"', '8"', '10"', '12"'],
    flavors: ["Red Velvet", "Vanilla Buttercream", "Cream Cheese"],
    featured: true,
  },
  {
    id: "2",
    slug: "chocolate-cake",
    name: "Chocolate Cake",
    price: 100000,
    category: "birthday",
    image: "/images/chocolate-cake.jpg",
    description:
      "Decadent chocolate layers finished with a glossy chocolate finish. A crowd favourite for birthdays and parties.",
    sizes: ['6"', '8"', '10"', '12"'],
    flavors: ["Dark Chocolate", "Milk Chocolate", "Chocolate Ganache"],
    featured: true,
  },
  {
    id: "3",
    slug: "birthday-chocolate-cake",
    name: "Birthday Chocolate Cake",
    price: 130000,
    category: "birthday",
    image: "/images/birthday-chocolate-cake.jpg",
    description:
      "A festive chocolate birthday cake decorated for a special day — custom message and toppings available.",
    sizes: ['6"', '8"', '10"', '12"'],
    flavors: ["Chocolate", "Vanilla", "Marble"],
    featured: true,
  },
  {
    id: "4",
    slug: "purple-butter-cream",
    name: "Purple Butter Cream Cake",
    price: 110000,
    category: "custom",
    image: "/images/purple-butter-cream-cake.jpg",
    description:
      "Soft sponge layered with silky purple buttercream — elegant, colourful, and made to order.",
    sizes: ['6"', '8"', '10"'],
    flavors: ["Vanilla", "Buttercream", "Berry"],
    featured: true,
  },
  {
    id: "5",
    slug: "princess-pink-cake",
    name: "Princess Pink Cake",
    price: 140000,
    category: "princess",
    image: "/images/princess-pink-cake.jpg",
    description:
      "A magical pink princess cake with delicate details — ideal for little royalty birthdays.",
    sizes: ['6"', '8"', '10"'],
    flavors: ["Vanilla", "Strawberry", "Buttercream"],
  },
  {
    id: "6",
    slug: "princess-red-cake",
    name: "Princess Red Cake",
    price: 145000,
    category: "princess",
    image: "/images/princess-red-cake.jpg",
    description:
      "Bold red princess styling with elegant frosting work — a showstopper for themed parties.",
    sizes: ['6"', '8"', '10"'],
    flavors: ["Red Velvet", "Vanilla", "Chocolate"],
  },
  {
    id: "7",
    slug: "princess-yellow-cake",
    name: "Princess Yellow Cake",
    price: 140000,
    category: "princess",
    image: "/images/princess-yellow-cake.jpg",
    description:
      "Sunny yellow princess cake with playful decoration — bright, joyful, and celebration-ready.",
    sizes: ['6"', '8"', '10"'],
    flavors: ["Vanilla", "Lemon", "Buttercream"],
  },
  {
    id: "8",
    slug: "princes-red-cake",
    name: "Princes Red Cake",
    price: 135000,
    category: "princess",
    image: "/images/princes-red-cake.jpg",
    description:
      "A striking red celebration cake with custom detailing for princes and princess parties alike.",
    sizes: ['6"', '8"', '10"'],
    flavors: ["Chocolate", "Vanilla", "Red Velvet"],
  },
  {
    id: "9",
    slug: "wedding-cake",
    name: "Classic Wedding Cake",
    price: 450000,
    category: "wedding",
    image: "/images/wedding-cake.jpg",
    description:
      "An elegant wedding centrepiece with refined finishing — customise tiers, flavours, and flowers.",
    sizes: ["2-tier", "3-tier", "4-tier"],
    flavors: ["Vanilla", "Chocolate", "Red Velvet", "Lemon"],
  },
  {
    id: "10",
    slug: "white-wedding-cake",
    name: "White Wedding Cake",
    price: 480000,
    category: "wedding",
    image: "/images/white-wedding-cake.jpg",
    description:
      "Timeless white wedding cake with clean, romantic styling — perfect for formal ceremonies.",
    sizes: ["2-tier", "3-tier", "4-tier"],
    flavors: ["Vanilla Bean", "White Chocolate", "Almond"],
  },
  {
    id: "11",
    slug: "blue-wedding-cake",
    name: "Blue Wedding Cake",
    price: 470000,
    category: "wedding",
    image: "/images/blue-wedding-cake.jpg",
    description:
      "Soft blue tones and elegant structure for a memorable wedding table.",
    sizes: ["2-tier", "3-tier"],
    flavors: ["Vanilla", "Berry", "Buttercream"],
  },
  {
    id: "12",
    slug: "light-blue-wedding-cake",
    name: "Light Blue Wedding Cake",
    price: 460000,
    category: "wedding",
    image: "/images/light-blue-wedding-cake.jpg",
    description:
      "Delicate light-blue wedding cake with refined detailing for modern couples.",
    sizes: ["2-tier", "3-tier"],
    flavors: ["Vanilla", "Lemon", "White Chocolate"],
  },
  {
    id: "13",
    slug: "castle-wedding-cake",
    name: "Castle Wedding Cake",
    price: 550000,
    category: "wedding",
    image: "/images/castle-wedding-cake.jpg",
    description:
      "A grand castle-inspired wedding cake — dramatic, romantic, and unforgettable.",
    sizes: ["3-tier", "4-tier", "Custom"],
    flavors: ["Vanilla", "Chocolate", "Red Velvet"],
  },
  {
    id: "14",
    slug: "girlfriend-purple-cake",
    name: "Girlfriend Purple Cake",
    price: 125000,
    category: "romantic",
    image: "/images/girlfriend-purple-cake.jpg",
    description:
      "A sweet purple cake made for special someone moments — customise the message and toppings.",
    sizes: ['6"', '8"', '10"'],
    flavors: ["Vanilla", "Berry", "Chocolate"],
  },
  {
    id: "15",
    slug: "romantic-guy-cake",
    name: "Romantic Guy Cake",
    price: 125000,
    category: "romantic",
    image: "/images/romantic-guy-cake.jpg",
    description:
      "A thoughtful romantic cake designed for him — bold styling with custom flavours.",
    sizes: ['6"', '8"', '10"'],
    flavors: ["Chocolate", "Coffee", "Vanilla"],
  },
];

export function formatPrice(amount: number) {
  return `UGX ${amount.toLocaleString("en-UG")}`;
}

export function getCakeBySlug(slug: string) {
  return cakes.find((cake) => cake.slug === slug);
}

export function getFeaturedCakes(limit = 4) {
  return cakes.filter((cake) => cake.featured).slice(0, limit);
}

export function getRelatedCakes(slug: string, limit = 3) {
  const current = getCakeBySlug(slug);
  if (!current) return cakes.slice(0, limit);
  return cakes
    .filter((cake) => cake.slug !== slug)
    .filter(
      (cake) =>
        cake.category === current.category || cake.featured
    )
    .slice(0, limit);
}
