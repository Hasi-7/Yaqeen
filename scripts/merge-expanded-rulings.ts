import { promises as fs } from "node:fs";
import path from "node:path";

type MarjaId = "sistani" | "khamenei" | "shirazi";
type VerificationStatus =
  | "verified_demo"
  | "verified"
  | "scholar_verified"
  | "needs_review"
  | "deprecated"
  | "draft"
  | "reviewed";
type ConfidenceLevel = "high" | "medium" | "low";

type RulingRecord = {
  id: string;
  marja_id: MarjaId;
  marja_name: string;
  source_type: string;
  source_title: string;
  official_url?: string | null;
  topic: string;
  subtopic?: string | null;
  question_text: string;
  ruling_text: string;
  chapter_title?: string | null;
  section_title?: string | null;
  ruling_number?: string | null;
  page_number?: string | null;
  language: string;
  tags: string[];
  citation_label: string;
  verification_status: VerificationStatus;
  confidence_level: ConfidenceLevel;
};

type ExpandedRaw = Record<string, unknown>;

type DuplicateEntry = {
  expanded_id: string;
  existing_id: string;
  duplicate_type: string;
  reason: string;
};

type SkippedEntry = {
  id: string;
  status: string;
  reason: string;
};

type MergedEntry = {
  id: string;
  marja: string;
  topic: string;
  citation: string;
};

type IdChangeEntry = {
  old_id: string;
  new_id: string;
  reason: string;
};

const ELIGIBLE = new Set(["verified_demo", "verified", "scholar_verified"]);
const ALL_STATUSES = new Set([
  "verified_demo",
  "verified",
  "scholar_verified",
  "needs_review",
  "deprecated",
  "draft",
  "reviewed",
]);
const VALID_MARJA: Record<string, MarjaId> = {
  sistani: "sistani",
  khamenei: "khamenei",
  shirazi: "shirazi",
};
const VALID_CONFIDENCE = new Set(["high", "medium", "low"]);

const MARJA_FILE_MAP: Record<string, MarjaId> = {
  "sistani_rulings.json": "sistani",
  "khamenei_rulings.json": "khamenei",
  "shirazi_rulings.json": "shirazi",
};

const ROOT = process.cwd();
const CORE_PATH = path.join(ROOT, "data", "rulings.json");
const EXPANDED_DIR = path.join(ROOT, "data", "expanded");
const REPORT_PATH = path.join(ROOT, "reports", "expanded_dataset_merge_report.md");

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, " ");
}

function wordSet(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(Boolean),
  );
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1;
  let intersection = 0;
  for (const w of a) {
    if (b.has(w)) intersection++;
  }
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function optStr(v: unknown): string | null | undefined {
  if (v === null || v === undefined) return v;
  return typeof v === "string" ? v : undefined;
}

function validateExpandedRecord(raw: ExpandedRaw, expectedMarja: MarjaId): { record: RulingRecord; error?: never } | { record?: never; error: string } {
  const id = str(raw.id);
  if (!id) return { error: "missing id" };

  const marja_id = VALID_MARJA[str(raw.marja_id)];
  if (!marja_id) return { error: `invalid marja_id: ${String(raw.marja_id)}` };
  if (marja_id !== expectedMarja)
    return { error: `marja_id ${marja_id} does not match expected ${expectedMarja} for this file` };

  const marja_name = str(raw.marja_name);
  if (!marja_name) return { error: "missing marja_name" };

  const source_type = str(raw.source_type);
  if (!source_type) return { error: "missing source_type" };

  const source_title = str(raw.source_title);
  if (!source_title) return { error: "missing source_title" };

  const topic = str(raw.topic);
  if (!topic) return { error: "missing topic" };

  const question_text = str(raw.question_text);
  if (!question_text) return { error: "missing question_text" };

  const ruling_text = str(raw.ruling_text);
  if (!ruling_text) return { error: "empty ruling_text" };

  const language = str(raw.language);
  if (!language) return { error: "missing language" };

  const tags = raw.tags;
  if (!Array.isArray(tags) || tags.length === 0 || tags.some((t) => typeof t !== "string")) {
    return { error: "invalid or empty tags" };
  }

  const citation_label = str(raw.citation_label);
  if (!citation_label) return { error: "missing citation_label" };

  const verification_status = str(raw.verification_status);
  if (!ALL_STATUSES.has(verification_status))
    return { error: `invalid verification_status: ${verification_status}` };

  const confidence_level = str(raw.confidence_level);
  if (!VALID_CONFIDENCE.has(confidence_level))
    return { error: `invalid confidence_level: ${confidence_level}` };

  const official_url = optStr(raw.official_url);
  if (official_url === undefined) return { error: "invalid official_url" };

  const subtopic = optStr(raw.subtopic);
  const chapter_title = optStr(raw.chapter_title);
  const section_title = optStr(raw.section_title);
  const ruling_number = optStr(raw.ruling_number);
  const page_number = optStr(raw.page_number);

  const record: RulingRecord = {
    id,
    marja_id,
    marja_name,
    source_type,
    source_title,
    official_url,
    topic,
    subtopic,
    question_text,
    ruling_text,
    chapter_title,
    section_title,
    ruling_number,
    page_number,
    language,
    tags: tags as string[],
    citation_label,
    verification_status: verification_status as VerificationStatus,
    confidence_level: confidence_level as ConfidenceLevel,
  };

  return { record };
}

type DuplicateResult = { isDuplicate: true; existing_id: string; type: string; reason: string } | { isDuplicate: false };

function detectDuplicate(
  candidate: RulingRecord,
  coreById: Map<string, RulingRecord>,
  coreRecords: RulingRecord[],
): DuplicateResult {
  // Rule 1: exact ID
  const byId = coreById.get(candidate.id);
  if (byId) {
    return {
      isDuplicate: true,
      existing_id: byId.id,
      type: "exact_id",
      reason: `ID ${candidate.id} already exists in core dataset`,
    };
  }

  const sameMarja = coreRecords.filter((r) => r.marja_id === candidate.marja_id);

  // Rule 2: same marja + source_title + chapter_title + section_title + ruling_number (all non-null must match)
  if (candidate.ruling_number) {
    const rule2Match = sameMarja.find(
      (r) =>
        r.ruling_number === candidate.ruling_number &&
        r.source_title === candidate.source_title &&
        r.chapter_title === candidate.chapter_title &&
        r.section_title === candidate.section_title,
    );
    if (rule2Match) {
      return {
        isDuplicate: true,
        existing_id: rule2Match.id,
        type: "same_source_reference",
        reason: `same marja, source_title, chapter_title, section_title, ruling_number (${candidate.ruling_number})`,
      };
    }
  }

  // Rule 3: same marja + same citation_label
  const rule3Match = sameMarja.find((r) => r.citation_label === candidate.citation_label);
  if (rule3Match) {
    return {
      isDuplicate: true,
      existing_id: rule3Match.id,
      type: "same_citation",
      reason: `same marja and citation_label: "${candidate.citation_label}"`,
    };
  }

  // Rule 4: same marja + normalized exact ruling text
  const candidateNorm = normalizeText(candidate.ruling_text);
  const rule4Match = sameMarja.find((r) => normalizeText(r.ruling_text) === candidateNorm);
  if (rule4Match) {
    return {
      isDuplicate: true,
      existing_id: rule4Match.id,
      type: "same_ruling_text",
      reason: `same marja and normalized ruling_text`,
    };
  }

  // Rule 5: near duplicate — same marja + same topic + high text similarity
  const candidateWords = wordSet(candidate.ruling_text);
  for (const r of sameMarja) {
    if (r.topic !== candidate.topic) continue;
    const similarity = jaccardSimilarity(candidateWords, wordSet(r.ruling_text));
    if (similarity >= 0.80) {
      return {
        isDuplicate: true,
        existing_id: r.id,
        type: "possible_near_duplicate",
        reason: `same marja, same topic, word-set Jaccard similarity ${(similarity * 100).toFixed(0)}% (threshold 80%)`,
      };
    }
  }

  return { isDuplicate: false };
}

function assignId(
  candidate: RulingRecord,
  coreById: Map<string, RulingRecord>,
): { id: string; changed: boolean } {
  if (!coreById.has(candidate.id)) {
    return { id: candidate.id, changed: false };
  }

  const slug = candidate.topic.toLowerCase().replace(/[^a-z0-9]+/g, "_");
  let counter = 1;
  while (true) {
    const newId = `${candidate.marja_id}_${slug}_${String(counter).padStart(3, "0")}`;
    if (!coreById.has(newId)) {
      return { id: newId, changed: true };
    }
    counter++;
  }
}

function sortRecords(records: RulingRecord[]): RulingRecord[] {
  return [...records].sort((a, b) => {
    const fields: (keyof RulingRecord)[] = ["marja_id", "topic", "subtopic", "source_title", "ruling_number", "id"];
    for (const field of fields) {
      const av = String(a[field] ?? "");
      const bv = String(b[field] ?? "");
      if (av < bv) return -1;
      if (av > bv) return 1;
    }
    return 0;
  });
}

async function main() {
  // Load core dataset
  const coreRaw = JSON.parse(await fs.readFile(CORE_PATH, "utf8")) as unknown;
  if (!Array.isArray(coreRaw)) throw new Error("data/rulings.json is not an array");
  const coreRecords = coreRaw as RulingRecord[];
  const coreById = new Map(coreRecords.map((r) => [r.id, r]));
  const coreBefore = coreRecords.length;

  // Load expanded files
  const expandedFiles = await fs.readdir(EXPANDED_DIR);
  const jsonFiles = expandedFiles.filter((f) => f.endsWith(".json"));

  const mergedEntries: MergedEntry[] = [];
  const duplicates: DuplicateEntry[] = [];
  const skipped: SkippedEntry[] = [];
  const idChanges: IdChangeEntry[] = [];
  const nearDuplicates: { id: string; reason: string }[] = [];

  let expandedTotal = 0;
  let eligibleCount = 0;
  let ineligibleCount = 0;
  let invalidCount = 0;

  const toMerge: RulingRecord[] = [];

  for (const file of jsonFiles) {
    const expectedMarja = MARJA_FILE_MAP[file];
    if (!expectedMarja) {
      console.log(`Skipping unknown file: ${file}`);
      continue;
    }

    const filePath = path.join(EXPANDED_DIR, file);
    const raw = JSON.parse(await fs.readFile(filePath, "utf8")) as unknown;
    if (!Array.isArray(raw)) {
      console.error(`${file} is not a JSON array; skipping.`);
      continue;
    }

    console.log(`\nProcessing ${file} (expected marja: ${expectedMarja})`);
    expandedTotal += raw.length;

    for (const item of raw as ExpandedRaw[]) {
      const result = validateExpandedRecord(item, expectedMarja);

      if (!result.record) {
        const id = str(item.id) || "(no id)";
        const status = str(item.verification_status) || "(unknown)";
        console.log(`  SKIP invalid: ${id} — ${result.error}`);
        skipped.push({ id, status, reason: result.error });
        invalidCount++;
        continue;
      }

      const record = result.record;

      if (!ELIGIBLE.has(record.verification_status)) {
        console.log(`  SKIP ineligible: ${record.id} (${record.verification_status})`);
        skipped.push({ id: record.id, status: record.verification_status, reason: "ineligible status" });
        ineligibleCount++;
        continue;
      }

      eligibleCount++;

      const dupResult = detectDuplicate(record, coreById, [...coreRecords, ...toMerge]);

      if (dupResult.isDuplicate) {
        console.log(`  SKIP duplicate (${dupResult.type}): ${record.id} → existing ${dupResult.existing_id}`);
        duplicates.push({
          expanded_id: record.id,
          existing_id: dupResult.existing_id,
          duplicate_type: dupResult.type,
          reason: dupResult.reason,
        });
        if (dupResult.type === "possible_near_duplicate") {
          nearDuplicates.push({ id: record.id, reason: dupResult.reason });
        }
        continue;
      }

      // Handle ID collision (unique content but colliding ID)
      const { id: finalId, changed } = assignId(record, coreById);
      const finalRecord = { ...record, id: finalId };

      if (changed) {
        console.log(`  ID CHANGED: ${record.id} → ${finalId} (id_collision)`);
        idChanges.push({ old_id: record.id, new_id: finalId, reason: "id_collision" });
        finalRecord.id = finalId;
      }

      console.log(`  MERGE: ${finalRecord.id} (${finalRecord.marja_id}/${finalRecord.topic})`);
      toMerge.push(finalRecord);
      coreById.set(finalId, finalRecord); // prevent ID collision in subsequent iterations
      mergedEntries.push({
        id: finalId,
        marja: finalRecord.marja_id,
        topic: finalRecord.topic,
        citation: finalRecord.citation_label,
      });
    }
  }

  const merged = [...coreRecords, ...toMerge];
  const sorted = sortRecords(merged);
  const coreAfter = sorted.length;

  // Write updated core dataset
  await fs.writeFile(CORE_PATH, `${JSON.stringify(sorted, null, 2)}\n`, "utf8");
  console.log(`\nWrote ${coreAfter} records to ${CORE_PATH}`);

  // Write report
  const report = buildReport({
    coreBefore,
    expandedTotal,
    eligibleCount,
    mergedCount: toMerge.length,
    duplicatesCount: duplicates.length,
    ineligibleCount,
    invalidCount,
    coreAfter,
    processedFiles: jsonFiles,
    mergedEntries,
    duplicates,
    skipped,
    idChanges,
    nearDuplicates,
  });

  await fs.writeFile(REPORT_PATH, report, "utf8");
  console.log(`Wrote merge report to ${REPORT_PATH}`);

  console.log("\n=== Merge Summary ===");
  console.log(`Core records before: ${coreBefore}`);
  console.log(`Expanded records found: ${expandedTotal}`);
  console.log(`Eligible expanded records: ${eligibleCount}`);
  console.log(`Merged records: ${toMerge.length}`);
  console.log(`Skipped duplicates: ${duplicates.length}`);
  console.log(`Skipped ineligible: ${ineligibleCount}`);
  console.log(`Skipped invalid: ${invalidCount}`);
  console.log(`Core records after: ${coreAfter}`);
}

type ReportArgs = {
  coreBefore: number;
  expandedTotal: number;
  eligibleCount: number;
  mergedCount: number;
  duplicatesCount: number;
  ineligibleCount: number;
  invalidCount: number;
  coreAfter: number;
  processedFiles: string[];
  mergedEntries: MergedEntry[];
  duplicates: DuplicateEntry[];
  skipped: SkippedEntry[];
  idChanges: IdChangeEntry[];
  nearDuplicates: { id: string; reason: string }[];
};

function buildReport(args: ReportArgs): string {
  const {
    coreBefore, expandedTotal, eligibleCount, mergedCount, duplicatesCount,
    ineligibleCount, invalidCount, coreAfter, processedFiles,
    mergedEntries, duplicates, skipped, idChanges, nearDuplicates,
  } = args;

  const fileList = processedFiles.map((f) => `- data/expanded/${f}`).join("\n");

  const mergedTable =
    mergedEntries.length === 0
      ? "_None_"
      : "| id | marja | topic | citation |\n|---|---|---|---|\n" +
        mergedEntries.map((e) => `| ${e.id} | ${e.marja} | ${e.topic} | ${e.citation} |`).join("\n");

  const dupTable =
    duplicates.length === 0
      ? "_None_"
      : "| expanded_id | existing_id | duplicate_type | reason |\n|---|---|---|---|\n" +
        duplicates.map((d) => `| ${d.expanded_id} | ${d.existing_id} | ${d.duplicate_type} | ${d.reason} |`).join("\n");

  const skipTable =
    skipped.length === 0
      ? "_None_"
      : "| id | status | reason |\n|---|---|---|\n" +
        skipped.map((s) => `| ${s.id} | ${s.status} | ${s.reason} |`).join("\n");

  const idChangeTable =
    idChanges.length === 0
      ? "_None_"
      : "| old_id | new_id | reason |\n|---|---|---|\n" +
        idChanges.map((c) => `| ${c.old_id} | ${c.new_id} | ${c.reason} |`).join("\n");

  const nearDupSection =
    nearDuplicates.length === 0
      ? "_None_"
      : nearDuplicates.map((n) => `- **${n.id}**: ${n.reason}`).join("\n");

  return `# Expanded Dataset Merge Report

Generated: ${new Date().toISOString()}

## Summary

| Metric | Count |
|---|---|
| Core records before | ${coreBefore} |
| Expanded records found | ${expandedTotal} |
| Eligible expanded records | ${eligibleCount} |
| Merged records | ${mergedCount} |
| Skipped duplicates | ${duplicatesCount} |
| Skipped needs_review/draft/deprecated | ${ineligibleCount} |
| Skipped invalid records | ${invalidCount} |
| Core records after | ${coreAfter} |

## Files Processed

${fileList}

## Merged Records

${mergedTable}

## Skipped Duplicates

${dupTable}

## Skipped Invalid or Ineligible Records

${skipTable}

## ID Changes

${idChangeTable}

## Next Review Items

Near duplicates and uncertain records for manual review:

${nearDupSection}
`;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
