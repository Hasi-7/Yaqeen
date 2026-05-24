import { retrieveRulings, type RetrievedRuling } from "@/lib/retriever";
import type { MarjaId, RulingRecord } from "@/lib/types";
import { vectorSearchRulings, type RulingEmbedding } from "./vector-search";

type HybridSearchOptions = {
  embeddings?: RulingEmbedding[];
  embedQuestion?: (question: string) => Promise<number[] | null> | number[] | null;
};

export async function hybridSearchRulings(
  records: RulingRecord[],
  question: string,
  marjaId: MarjaId,
  options: HybridSearchOptions = {},
): Promise<RetrievedRuling[]> {
  const keywordResults = retrieveRulings(records, question, marjaId);
  const vectorResults = await vectorSearchRulings(records, question, marjaId, options);

  if (!vectorResults) {
    return keywordResults;
  }

  if (vectorResults.length === 0) {
    return keywordResults;
  }

  const byId = new Map<string, RetrievedRuling>();
  const maxKeywordScore = Math.max(...keywordResults.map((result) => result.score), 1);

  for (const result of keywordResults) {
    byId.set(result.record.id, {
      record: result.record,
      score: 0.3 * (result.score / maxKeywordScore),
    });
  }

  for (const result of vectorResults) {
    const existing = byId.get(result.record.id);
    byId.set(result.record.id, {
      record: result.record,
      score: (existing?.score ?? 0) + 0.7 * result.score,
    });
  }

  return [...byId.values()]
    .sort((left, right) => right.score - left.score)
    .slice(0, 3);
}
