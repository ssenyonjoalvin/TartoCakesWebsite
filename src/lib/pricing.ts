import { business } from "@/data/business";
import { formatPrice } from "@/data/cakes";

type PricedCake = {
  price: number;
  sizes?: string[];
  flavors?: string[];
};

/** True when size/flavour choices could change what the customer pays. */
export function hasPriceOptions(cake: PricedCake) {
  return (cake.sizes?.length ?? 0) > 1 || (cake.flavors?.length ?? 0) > 1;
}

export function showsStartingPrice(cake: PricedCake) {
  return business.pricing.listedPriceIsStartingPrice && hasPriceOptions(cake);
}

export function formatCakePrice(cake: PricedCake) {
  const amount = formatPrice(cake.price);
  return showsStartingPrice(cake) ? `From ${amount}` : amount;
}
