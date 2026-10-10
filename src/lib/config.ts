// Store-wide settings. Money is in pesewas (GH₵ 1.00 = 100).

export const store = {
  name: "Crestline Kits",
  tagline: "Football jerseys for every matchday",
  currency: "GHS",
  email: "hello@crestlinekits.com",
  phone: "+233 20 000 0000",
  freeDeliveryThreshold: 100000, // GH₵ 1,000
  customizationFee: 5000, // GH₵ 50 for name + number printing
  announcement: "Free delivery in Greater Accra on orders over GH₵ 1,000 · Pay with Mobile Money",
};

export const sizes = ["S", "M", "L", "XL", "XXL"] as const;

export const kitTypes = ["Home", "Away", "Third", "Retro", "Training", "Other"] as const;

export const regions = [
  "Greater Accra",
  "Ashanti",
  "Central",
  "Eastern",
  "Western",
  "Western North",
  "Volta",
  "Oti",
  "Northern",
  "Savannah",
  "North East",
  "Upper East",
  "Upper West",
  "Bono",
  "Bono East",
  "Ahafo",
] as const;

export const deliveryFees: Record<string, number> = {
  "Greater Accra": 3000, // GH₵ 30
  default: 6000, // GH₵ 60 for every other region
};

export function deliveryFeeFor(method: string, region: string, subtotal: number) {
  if (method === "pickup") return 0;
  if (region === "Greater Accra" && subtotal >= store.freeDeliveryThreshold) return 0;
  return deliveryFees[region] ?? deliveryFees.default;
}
