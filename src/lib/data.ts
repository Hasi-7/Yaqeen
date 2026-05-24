import { promises as fs } from "fs";
import path from "path";
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
      records: parsed.filter(isRulingRecord),
      datasetLoaded: true,
    };

    return cachedDataset;
  } catch (error) {
    const missingFile =
      error instanceof Error &&
      "code" in error &&
      (error as NodeJS.ErrnoException).code === "ENOENT";

    if (!missingFile) {
      console.error("Unable to load data/rulings.json", error);
    }

    cachedDataset = {
      records: [],
      datasetLoaded: false,
    };

    return cachedDataset;
  }
}

function isRulingRecord(value: unknown): value is RulingRecord {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Partial<RulingRecord>;

  return Boolean(
    record.id &&
      record.marja_id &&
      record.marja_name &&
      record.source_type &&
      record.source_title &&
      record.topic &&
      record.ruling_text &&
      record.citation_label &&
      record.verification_status &&
      record.confidence_level,
  );
}
