/**
 * Business facts that must come from the Tarto owner (see docs/ROADMAP.md §8).
 *
 * Rule: never put a guess here. Leave a value `null`/`false` until it is
 * confirmed. UI that depends on a missing value hides itself instead of
 * showing placeholder text to customers.
 */
export const business = {
  pricing: {
    /**
     * When true, catalog prices for cakes that have size/flavour options
     * render as "From UGX …". Turn on once the owner confirms the listed
     * price is the price of the smallest/basic option (ROADMAP §8 Q6).
     */
    listedPriceIsStartingPrice: false,
  },
} as const;
