import {
  ALL_VERIFICATION_STATUSES,
  CONFIDENCE_LEVELS,
  type RulingRecord,
} from "./types";

const MARJA_IDS = ["sistani", "khamenei", "shirazi"] as const;

export function validateRulingRecords(value: unknown): RulingRecord[] {
  if (!Array.isArray(value)) {
    throw new Error("data/rulings.json must contain an array of ruling records.");
  }

  return value.map((record, index) => validateRulingRecord(record, index));
}

export function validateRulingRecord(value: unknown, index = 0): RulingRecord {
  if (!value || typeof value !== "object") {
    throw new Error(`Ruling record at index ${index} must be an object.`);
  }

  const record = value as Partial<RulingRecord>;
  const location = record.id ? `record ${record.id}` : `record at index ${index}`;

  requireString(record.id, "id", location);
  requireEnum(record.marja_id, MARJA_IDS, "marja_id", location);
  requireString(record.marja_name, "marja_name", location);
  requireString(record.source_type, "source_type", location);
  requireString(record.source_title, "source_title", location);
  requireString(record.topic, "topic", location);
  requireString(record.question_text, "question_text", location);
  requireString(record.ruling_text, "ruling_text", location);
  requireString(record.language, "language", location);
  requireStringArray(record.tags, "tags", location);
  requireString(record.citation_label, "citation_label", location);
  requireEnum(record.verification_status, ALL_VERIFICATION_STATUSES, "verification_status", location);
  requireEnum(record.confidence_level, CONFIDENCE_LEVELS, "confidence_level", location);

  validateOptionalString(record.official_url, "official_url", location);
  validateOptionalString(record.subtopic, "subtopic", location);
  validateOptionalString(record.chapter_title, "chapter_title", location);
  validateOptionalString(record.section_title, "section_title", location);
  validateOptionalString(record.ruling_number, "ruling_number", location);
  validateOptionalString(record.page_number, "page_number", location);

  return record as RulingRecord;
}

function requireString(value: unknown, field: string, location: string): asserts value is string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${location} has invalid ${field}; expected a non-empty string.`);
  }
}

function requireStringArray(value: unknown, field: string, location: string): asserts value is string[] {
  if (!Array.isArray(value) || value.length === 0 || value.some((item) => typeof item !== "string" || item.trim().length === 0)) {
    throw new Error(`${location} has invalid ${field}; expected a non-empty string array.`);
  }
}

function requireEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
  field: string,
  location: string,
): asserts value is T {
  if (typeof value !== "string" || !allowed.includes(value as T)) {
    throw new Error(`${location} has invalid ${field}; expected one of ${allowed.join(", ")}.`);
  }
}

function validateOptionalString(value: unknown, field: string, location: string) {
  if (typeof value !== "undefined" && value !== null && typeof value !== "string") {
    throw new Error(`${location} has invalid ${field}; expected string, null, or undefined.`);
  }
}
