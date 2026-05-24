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

const MIN_SCORE = 6;
const APPROVED = new Set<string>(APPROVED_VERIFICATION_STATUSES);

const SYNONYMS: Record<string, string[]> = {
  break: ["invalidate", "invalidates", "invalidators", "void", "voids"],
  breaks: ["invalidate", "invalidates", "invalidators", "void", "voids"],
  fajr: ["morning", "subh", "dawn"],
  fast: ["fasting"],
  fasting: ["fast"],
  friday: ["jumuah", "jumu'a"],
  jumuah: ["friday", "jumu'a"],
  najis: ["najasat", "impure", "purity"],
  prayer: ["salat", "salah"],
  salah: ["salat", "prayer"],
  salat: ["salah", "prayer"],
  subh: ["fajr", "morning", "dawn"],
  subuh: ["subh", "fajr", "morning"],
  travel: ["traveler", "traveller", "traveling", "travelling"],
  traveling: ["travel", "traveler", "traveller", "travelling"],
  travelling: ["travel", "traveler", "traveller", "traveling"],
  wajib: ["obligatory", "obligation", "required"],
  wudu: ["wudhu", "ablution"],
  wudhu: ["wudu", "ablution"],
};

const DOMAIN_TERMS: Record<string, string[]> = {
  fajr: ["fajr", "subh", "subuh", "dawn", "morning"],
  fasting: ["fast", "fasting", "ramadan", "sawm"],
  friday: ["friday", "jumuah", "jumu'a"],
  khums: ["khums", "fifth"],
  music: ["music", "singing"],
  prayer: ["prayer", "pray", "salat", "salah"],
  purity: ["najis", "najasat", "impure", "purity"],
  wudhu: ["wudhu", "wudu", "ablution"],
};

export function retrieveRulings(
  records: RulingRecord[],
  question: string,
  marjaId: MarjaId,
  limit = 3,
): RetrievedRuling[] {
  const queryTerms = expandTokens(tokenize(question));

  if (queryTerms.size === 0) {
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
    .filter((result) => hasStrongIntentMatch(question, result.record))
    .sort((left, right) => right.score - left.score)
    .slice(0, limit);
}

export function retrieveForAllMaraji(records: RulingRecord[], question: string) {
  return MARJA_ORDER.map((marjaId) => ({
    marjaId,
    matches: retrieveRulings(records, question, marjaId),
  }));
}

function scoreRecord(record: RulingRecord, queryTerms: Set<string>): number {
  let score = 0;

  for (const tag of record.tags ?? []) {
    score += overlapScore(queryTerms, tag, 5);
  }

  score += overlapScore(queryTerms, record.topic, 4);
  score += overlapScore(queryTerms, record.subtopic ?? "", 3);
  score += overlapScore(queryTerms, record.question_text ?? "", 2);
  score += overlapScore(queryTerms, record.ruling_text, 1);

  return score;
}

function tokenize(text: string): string[] {
  return Array.from(
    new Set(
      text
        .toLowerCase()
        .replace(/[^a-z0-9\s']/g, " ")
        .split(/\s+/)
        .map((token) => token.replace(/^'+|'+$/g, ""))
        .filter(Boolean)
        .filter((term) => !STOP_WORDS.has(term)),
    ),
  );
}

function expandTokens(tokens: string[]): Set<string> {
  const expanded = new Set(tokens);
  for (const token of tokens) {
    for (const synonym of SYNONYMS[token] ?? []) {
      expanded.add(synonym);
    }
  }
  return expanded;
}

function overlapScore(query: Set<string>, text: string, weight: number): number {
  let score = 0;
  const seen = new Set<string>();
  for (const token of tokenize(text)) {
    if (!seen.has(token) && query.has(token)) {
      score += weight;
      seen.add(token);
    }
  }
  return score;
}

function overlapCount(query: Set<string>, text: string): number {
  let count = 0;
  const seen = new Set<string>();
  for (const token of tokenize(text)) {
    if (!seen.has(token) && query.has(token)) {
      count += 1;
      seen.add(token);
    }
  }
  return count;
}

function queryDomains(query: Set<string>): Set<string> {
  const domains = new Set<string>();
  for (const [domain, terms] of Object.entries(DOMAIN_TERMS)) {
    if (terms.some((term) => query.has(term))) {
      domains.add(domain);
    }
  }
  return domains;
}

function recordDomains(record: RulingRecord): Set<string> {
  const recordTokens = expandTokens(tokenize([
    record.topic,
    record.subtopic ?? "",
    record.question_text ?? "",
    record.tags?.join(" ") ?? "",
  ].join(" ")));
  return queryDomains(recordTokens);
}

function hasUnmatchedSpecificPurityItem(question: string, record: RulingRecord): boolean {
  const originalQuery = tokenize(question);
  const query = expandTokens(originalQuery);
  if (!queryDomains(query).has("purity")) return false;

  const purityTerms = new Set(DOMAIN_TERMS.purity);
  const recordTokens = expandTokens(tokenize([
    record.question_text ?? "",
    record.subtopic ?? "",
    record.tags?.join(" ") ?? "",
    record.ruling_text,
  ].join(" ")));

  return originalQuery.some((token) => !purityTerms.has(token) && !recordTokens.has(token));
}

function hasStrongIntentMatch(question: string, record: RulingRecord): boolean {
  const query = expandTokens(tokenize(question));
  if (query.size < 2) return false;

  const domains = queryDomains(query);
  const recordDomainMatches = [...domains].filter((domain) => recordDomains(record).has(domain));
  if (domains.size > 0 && recordDomainMatches.length === 0) return false;
  if (hasUnmatchedSpecificPurityItem(question, record)) return false;

  const focusedText = [record.question_text ?? "", record.subtopic ?? "", record.tags?.join(" ") ?? ""].join(" ");
  const focusedOverlap = overlapCount(query, focusedText);
  const rulingOverlap = overlapCount(query, record.ruling_text);

  return focusedOverlap >= 2 || (focusedOverlap >= 1 && rulingOverlap >= 2);
}

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "begin",
  "begins",
  "by",
  "can",
  "do",
  "does",
  "for",
  "from",
  "had",
  "has",
  "have",
  "how",
  "i",
  "if",
  "in",
  "into",
  "is",
  "it",
  "may",
  "my",
  "need",
  "of",
  "on",
  "or",
  "ruling",
  "should",
  "start",
  "starts",
  "that",
  "the",
  "this",
  "to",
  "valid",
  "what",
  "when",
  "where",
  "while",
  "who",
  "why",
  "with",
  "would",
  "you",
  "your",
]);
