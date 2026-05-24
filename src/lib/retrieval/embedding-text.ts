import { createHash } from "node:crypto";
import { APPROVED_VERIFICATION_STATUSES, type RulingRecord } from "@/lib/types";

const APPROVED = new Set<string>(APPROVED_VERIFICATION_STATUSES);

export function isEmbeddableRecord(record: RulingRecord): boolean {
  return APPROVED.has(record.verification_status);
}

export function buildEmbeddingText(record: RulingRecord): string {
  return [
    `Marja: ${record.marja_name}`,
    `Topic: ${record.topic}`,
    `Subtopic: ${record.subtopic ?? ""}`,
    `Question: ${record.question_text ?? ""}`,
    `Tags: ${record.tags?.join(", ") ?? ""}`,
    `Ruling: ${record.ruling_text}`,
    `Citation: ${record.citation_label}`,
  ].join("\n");
}

export function hashEmbeddingText(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}
