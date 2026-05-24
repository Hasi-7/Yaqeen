import type { MarjaId } from "./types";

export const MARAJI: Record<MarjaId, { id: MarjaId; name: string; shortName: string }> = {
  sistani: {
    id: "sistani",
    name: "Sayyid Ali al-Sistani",
    shortName: "Sistani",
  },
  khamenei: {
    id: "khamenei",
    name: "Sayyid Ali Khamenei",
    shortName: "Khamenei",
  },
  shirazi: {
    id: "shirazi",
    name: "Sayyid Sadiq Shirazi",
    shortName: "Sadiq Shirazi",
  },
};

export const MARJA_ORDER: MarjaId[] = ["sistani", "khamenei", "shirazi"];
