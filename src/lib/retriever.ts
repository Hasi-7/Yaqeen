import { MARJA_ORDER } from "./maraji";
import {
  APPROVED_VERIFICATION_STATUSES,
  type MarjaId,
  type RulingRecord,
} from "./types";

export type RetrievedRuling = {
  record: RulingRecord;
  score: number;
};

const MIN_SCORE = 2;
const APPROVED = new Set<string>(APPROVED_VERIFICATION_STATUSES);

export function retrieveRulings(
  records: RulingRecord[],
  question: string,
  marjaId: MarjaId,
  limit = 5,
): RetrievedRuling[] {
  const queryTerms = tokenize(question);

  if (queryTerms.length === 0) {
    return [];
  }

  return records
    .filter((record) => record.marja_id === marjaId)
    .filter((record) => APPROVED.has(record.verification_status))
    .map((record) => ({
      record,
      score: scoreRecord(record, queryTerms),
    }))
    .filter((result) => result.score >= MIN_SCORE)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit);
}

export function retrieveForAllMaraji(records: RulingRecord[], question: string) {
  return MARJA_ORDER.map((marjaId) => ({
    marjaId,
    matches: retrieveRulings(records, question, marjaId),
  }));
}

function scoreRecord(record: RulingRecord, queryTerms: string[]): number {
  const searchableText = [
    record.topic,
    record.subtopic,
    record.question_text,
    record.ruling_text,
    record.chapter_title,
    record.section_title,
    ...(record.tags ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return queryTerms.reduce((score, term) => {
    if (record.tags?.some((tag) => tag.toLowerCase() === term)) {
      return score + 3;
    }

    if (searchableText.includes(term)) {
      return score + 1;
    }

    return score;
  }, 0);
}

function tokenize(text: string): string[] {
  return Array.from(
    new Set(
      text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((term) => term.length > 2)
        .filter((term) => !STOP_WORDS.has(term)),
    ),
  );
}

const STOP_WORDS = new Set([
  "the",
  "and",
  "are",
  "can",
  "for",
  "from",
  "how",
  "into",
  "is",
  "may",
  "that",
  "this",
  "what",
  "when",
  "where",
  "while",
  "with",
  "would",
  "you",
  "your",
]);
