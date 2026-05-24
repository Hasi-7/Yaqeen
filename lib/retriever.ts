import rulings from "../data/rulings.json";
import { MARJA_IDS } from "./marja";
import type { MarjaId, RetrievedRuling, RulingRecord } from "./types";

const VALID_STATUSES = new Set(["verified_demo", "verified"]);
const MIN_SCORE = 6;
const MAX_RESULTS = 3;

const STOPWORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "can", "do", "does", "for", "from",
  "had", "has", "have", "how", "i", "if", "in", "is", "it", "my", "of", "on", "or", "should",
  "the", "to", "what", "when", "where", "who", "why", "with", "while", "does", "need", "begin",
  "begins", "start", "starts", "ruling", "valid"
]);

const SYNONYMS: Record<string, string[]> = {
  breaks: ["invalidate", "invalidates", "invalidators", "void", "voids"],
  break: ["invalidate", "invalidates", "invalidators", "void", "voids"],
  wudu: ["wudhu", "ablution"],
  wudhu: ["wudu", "ablution"],
  fajr: ["morning", "subh", "dawn"],
  subh: ["fajr", "morning", "dawn"],
  wajib: ["obligatory", "obligation", "required"],
  travel: ["traveler", "traveller", "traveling", "travelling"],
  traveling: ["travel", "traveler", "traveller", "travelling"],
  travelling: ["travel", "traveler", "traveller", "traveling"],
  fast: ["fasting"],
  fasting: ["fast"],
  salat: ["salah", "prayer"],
  salah: ["salat", "prayer"],
  subuh: ["subh", "fajr", "morning"],
  najis: ["najasat", "impure", "purity"],
  khums: ["one", "fifth"],
  jumuah: ["friday", "jumu'a"],
  friday: ["jumuah", "jumu'a"]
};

const DOMAIN_TERMS: Record<string, string[]> = {
  wudhu: ["wudhu", "wudu", "ablution"],
  fasting: ["fast", "fasting", "ramadan", "sawm"],
  prayer: ["prayer", "pray", "salat", "salah"],
  fajr: ["fajr", "subh", "subuh", "dawn", "morning"],
  friday: ["friday", "jumuah", "jumu'a"],
  music: ["music", "singing"],
  purity: ["najis", "najasat", "impure", "purity"],
  khums: ["khums", "fifth"]
};

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, " ")
    .split(/\s+/)
    .map((token) => token.replace(/^'+|'+$/g, ""))
    .filter(Boolean)
    .filter((token) => !STOPWORDS.has(token));
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
    record.question_text,
    record.tags.join(" ")
  ].join(" ")));
  return queryDomains(recordTokens);
}

function hasUnmatchedSpecificPurityItem(question: string, record: RulingRecord): boolean {
  const originalQuery = tokenize(question);
  const query = expandTokens(originalQuery);
  if (!queryDomains(query).has("purity")) return false;

  const purityTerms = new Set(DOMAIN_TERMS.purity);
  const recordTokens = expandTokens(tokenize([
    record.question_text,
    record.subtopic ?? "",
    record.tags.join(" "),
    record.ruling_text
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

  const focusedText = [record.question_text, record.subtopic ?? "", record.tags.join(" ")].join(" ");
  const focusedOverlap = overlapCount(query, focusedText);
  const rulingOverlap = overlapCount(query, record.ruling_text);

  return focusedOverlap >= 2 || (focusedOverlap >= 1 && rulingOverlap >= 2);
}

export function scoreRecord(question: string, record: RulingRecord): number {
  const query = expandTokens(tokenize(question));
  let score = 0;

  for (const tag of record.tags) {
    score += overlapScore(query, tag, 5);
  }

  score += overlapScore(query, record.topic, 4);
  score += overlapScore(query, record.subtopic ?? "", 3);
  score += overlapScore(query, record.question_text, 2);
  score += overlapScore(query, record.ruling_text, 1);

  return score;
}

export function retrieveRelevantRulings(question: string, marjaId: MarjaId): { status: "found" | "not_found"; results: RetrievedRuling[] } {
  const records = (rulings as RulingRecord[])
    .filter((record) => record.marja_id === marjaId)
    .filter((record) => VALID_STATUSES.has(record.verification_status));

  const results = records
    .map((record) => ({ ...record, score: scoreRecord(question, record) }))
    .filter((record) => record.score >= MIN_SCORE)
    .filter((record) => hasStrongIntentMatch(question, record))
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RESULTS);

  return results.length > 0 ? { status: "found", results } : { status: "not_found", results: [] };
}

export function retrieveForAllMaraji(question: string): Record<MarjaId, ReturnType<typeof retrieveRelevantRulings>> {
  return MARJA_IDS.reduce(
    (acc, marjaId) => ({ ...acc, [marjaId]: retrieveRelevantRulings(question, marjaId) }),
    {} as Record<MarjaId, ReturnType<typeof retrieveRelevantRulings>>
  );
}
