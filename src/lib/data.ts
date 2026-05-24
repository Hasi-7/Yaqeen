import { promises as fs } from "fs";
import path from "path";
import { validateRulingRecords } from "./ruling-schema";
import type { RulingRecord } from "./types";

type DatasetResult = {
  records: RulingRecord[];
  datasetLoaded: boolean;
};

let cachedDataset: DatasetResult | null = null;

export async function loadRulings(): Promise<DatasetResult> {
  if (cachedDataset) {
    return cachedDataset;
  }

  const datasetPath = path.join(process.cwd(), "data", "rulings.json");

  try {
    const raw = await fs.readFile(datasetPath, "utf8");
    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      throw new Error("data/rulings.json must contain an array of ruling records.");
    }

    cachedDataset = {
      records: validateRulingRecords(parsed),
      datasetLoaded: true,
    };

    return cachedDataset;
  } catch (error) {
    const missingFile =
      error instanceof Error &&
      "code" in error &&
      (error as NodeJS.ErrnoException).code === "ENOENT";

    if (!missingFile) {
      throw error;
    }

    cachedDataset = {
      records: [],
      datasetLoaded: false,
    };

    return cachedDataset;
  }
}
