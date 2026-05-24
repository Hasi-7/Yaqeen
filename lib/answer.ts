import { toCitation } from "./citations";
import { MARJA_IDS, MARJA_INFO } from "./marja";
import { retrieveForAllMaraji, retrieveRelevantRulings } from "./retriever";
import type { CompareAskResponse, CompareResult, MarjaId, RetrievedRuling, SingleAskResponse } from "./types";

export const DISCLAIMER = "This tool retrieves rulings from published sources using AI and is not a replacement for contacting your marja's office.";
export const NOT_FOUND_ANSWER = "Not Found in the current verified dataset. Please consult the marja's official channels for this question.";
export const NOT_FOUND_FOLLOW_UP = "This question was not found in the current verified dataset. Submit it through the marja's official Q&A platform or consult a qualified local representative.";

function formatFoundAnswer(marjaId: MarjaId, records: RetrievedRuling[]): string {
  const primary = records[0];
  return `According to ${MARJA_INFO[marjaId].name}, ${primary.ruling_text}`;
}

export function generateSingleAnswer(question: string, marjaId: MarjaId): SingleAskResponse {
  const retrieved = retrieveRelevantRulings(question, marjaId);

  if (retrieved.status === "not_found") {
    return {
      mode: "single",
      question,
      marja: marjaId,
      status: "not_found",
      answer: NOT_FOUND_ANSWER,
      sources: [],
      follow_up: NOT_FOUND_FOLLOW_UP,
      disclaimer: DISCLAIMER
    };
  }

  return {
    mode: "single",
    question,
    marja: marjaId,
    status: "found",
    answer: formatFoundAnswer(marjaId, retrieved.results),
    sources: retrieved.results.map(toCitation),
    follow_up: MARJA_INFO[marjaId].followUp,
    disclaimer: DISCLAIMER
  };
}

function toCompareResult(marjaId: MarjaId, retrieved: ReturnType<typeof retrieveRelevantRulings>): CompareResult {
  if (retrieved.status === "not_found") {
    return {
      marja_id: marjaId,
      marja_name: MARJA_INFO[marjaId].name,
      status: "not_found",
      answer: NOT_FOUND_ANSWER,
      sources: []
    };
  }

  return {
    marja_id: marjaId,
    marja_name: MARJA_INFO[marjaId].name,
    status: "found",
    answer: formatFoundAnswer(marjaId, retrieved.results),
    sources: retrieved.results.map(toCitation)
  };
}

export function compareAllRulings(question: string): CompareAskResponse {
  const retrievedByMarja = retrieveForAllMaraji(question);
  const results = MARJA_IDS.map((marjaId) => toCompareResult(marjaId, retrievedByMarja[marjaId]));
  const foundCount = results.filter((result) => result.status === "found").length;

  return {
    mode: "compare",
    question,
    results,
    comparison_summary: foundCount === 0
      ? "Yaqeen did not find a verified source for this question in the current dataset."
      : "Yaqeen only compares rulings that were found in the verified dataset. Missing entries are marked Not Found.",
    disclaimer: DISCLAIMER
  };
}
