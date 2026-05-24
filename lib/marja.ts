import type { MarjaId } from "./types";

export const MARJA_IDS: MarjaId[] = ["sistani", "khamenei", "shirazi"];

export const MARJA_INFO: Record<MarjaId, { name: string; followUp: string }> = {
  sistani: {
    name: "Sayyid Ali al-Sistani",
    followUp: "For a case-specific ruling, consult Sistani.org, the official office, or a qualified local representative of Sayyid Ali al-Sistani."
  },
  khamenei: {
    name: "Sayyid Ali Khamenei",
    followUp: "For a case-specific ruling, consult Leader.ir, the official office, or a qualified local representative of Sayyid Ali Khamenei."
  },
  shirazi: {
    name: "Sayyid Sadiq Shirazi",
    followUp: "For a case-specific ruling, consult the official office or a qualified local representative of Sayyid Sadiq Shirazi."
  }
};

export function isMarjaId(value: unknown): value is MarjaId {
  return typeof value === "string" && MARJA_IDS.includes(value as MarjaId);
}
