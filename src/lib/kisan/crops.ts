export const CROPS = [
  "Paddy",
  "Wheat",
  "Maize",
  "Mustard",
  "Jute",
  "Potato",
  "Pumpkin",
  "Pea",
  "Peanut (Groundnut)",
  "Papaya",
  "Pearl Millet (Bajra)",
  "Pigeon Pea (Arhar)",
  "Onion",
  "Tomato",
  "Sugarcane",
  "Gram (Chana)",
  "Lentil (Masur)",
  "Soybean",
  "Cotton",
  "Turmeric",
  "Ginger",
  "Chilli",
  "Banana",
  "Mango",
];

export const UNITS = [
  { label: "Quintal (100 kg)", value: "quintal", toQuintal: 1 },
  { label: "Kilogram", value: "kg", toQuintal: 0.01 },
  { label: "Metric Tonne (1000 kg)", value: "tonne", toQuintal: 10 },
  { label: "Maund (40 kg)", value: "maund", toQuintal: 0.4 },
];

export function toQuintal(qty: number, unit: string): number {
  const u = UNITS.find((x) => x.value === unit);
  return Math.round(qty * (u ? u.toQuintal : 1) * 100) / 100;
}
