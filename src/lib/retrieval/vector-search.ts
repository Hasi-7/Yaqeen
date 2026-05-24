import { promises as fs } from "node:fs";
import path from "node:path";
import { buildEmbeddingText, hashEmbeddingText, isEmbeddableRecord } from "./embedding-text";
import type { RetrievedRuling } from "@/lib/retriever";
import type { MarjaId, RulingRecord } from "@/lib/types";

export type RulingEmbedding = {
  record_id: string;
  marja_id: MarjaId;
  embedding_model: string;
  embedding_text_hash: string;
  embedding: number[];
};

type VectorSearchOptions = {
  embeddings?: RulingEmbedding[];
  embedQuestion?: (question: string) => Promise<number[] | null> | number[] | null;
  threshold?: number;
  limit?: number;
};

const DEFAULT_MODEL = "text-embedding-3-small";
const DEFAULT_THRESHOLD = 0.4;
const OPENAI_EMBEDDINGS_URL = "https://api.openai.com/v1/embeddings";
let cachedEmbeddings: RulingEmbedding[] | null = null;

export async function vectorSearchRulings(
  records: RulingRecord[],
  question: string,
  marjaId: MarjaId,
  options: VectorSearchOptions = {},
): Promise<RetrievedRuling[] | null> {
  if (process.env.YAQEEN_EMBEDDINGS_ENABLED !== "true" && !options.embeddings) {
    return null;
  }

  const embeddings = options.embeddings ?? (await loadEmbeddings());
  if (!embeddings || embeddings.length === 0) {
    return null;
  }

  const questionEmbedding = await getQuestionEmbedding(question, options.embedQuestion);
  if (!questionEmbedding) {
    return null;
  }

  const recordsById = new Map(
    records
      .filter((record) => record.marja_id === marjaId)
      .filter(isEmbeddableRecord)
      .map((record) => [record.id, record]),
  );

  const threshold = options.threshold ?? DEFAULT_THRESHOLD;
  const limit = options.limit ?? 3;

  return embeddings
    .filter((embedding) => embedding.marja_id === marjaId)
    .map((embedding) => {
      const record = recordsById.get(embedding.record_id);
      if (!record || !embeddingStillMatchesRecord(embedding, record)) {
        return null;
      }

      return {
        record,
        score: cosineSimilarity(questionEmbedding, embedding.embedding),
      };
    })
    .filter((result): result is RetrievedRuling => Boolean(result))
    .filter((result) => result.score >= threshold)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit);
}

async function loadEmbeddings(): Promise<RulingEmbedding[] | null> {
  if (cachedEmbeddings) {
    return cachedEmbeddings;
  }

  const embeddingsPath = path.join(/* turbopackIgnore: true */ process.cwd(), "data", "ruling-embeddings.json");

  try {
    const raw = await fs.readFile(embeddingsPath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    cachedEmbeddings = Array.isArray(parsed) ? parsed.filter(isRulingEmbedding) : [];
    return cachedEmbeddings;
  } catch (error) {
    if (error instanceof Error && "code" in error && (error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }

    console.error("Unable to load ruling embeddings", error);
    return null;
  }
}

function isRulingEmbedding(value: unknown): value is RulingEmbedding {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<RulingEmbedding>;
  return Boolean(
    record.record_id &&
      record.marja_id &&
      record.embedding_model &&
      record.embedding_text_hash &&
      Array.isArray(record.embedding) &&
      record.embedding.every((item) => typeof item === "number"),
  );
}

async function getQuestionEmbedding(
  question: string,
  embedQuestion?: VectorSearchOptions["embedQuestion"],
): Promise<number[] | null> {
  if (embedQuestion) {
    return await embedQuestion(question);
  }

  const provider = process.env.YAQEEN_EMBEDDING_PROVIDER;

  if (provider === "ollama") {
    return getOllamaEmbedding(question);
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const model = process.env.YAQEEN_EMBEDDING_MODEL ?? DEFAULT_MODEL;
  const response = await fetch(OPENAI_EMBEDDINGS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ input: question, model }),
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as { data?: Array<{ embedding?: number[] }> };
  return payload.data?.[0]?.embedding ?? null;
}

async function getOllamaEmbedding(question: string): Promise<number[] | null> {
  const baseUrl = (process.env.OLLAMA_BASE_URL ?? "http://localhost:11434").replace(/\/$/, "");
  const model = process.env.YAQEEN_EMBEDDING_MODEL ?? "nomic-embed-text";

  for (const endpoint of ["/api/embed", "/api/embeddings"]) {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, input: question }),
      });

      if (!response.ok) continue;

      const payload = (await response.json()) as {
        embedding?: number[];
        embeddings?: number[][];
      };
      const embedding = payload.embedding ?? payload.embeddings?.[0];
      if (embedding) return embedding;
    } catch {
      // try next endpoint
    }
  }

  console.error(`Ollama embedding request failed for model ${model}`);
  return null;
}

function embeddingStillMatchesRecord(embedding: RulingEmbedding, record: RulingRecord): boolean {
  return embedding.embedding_text_hash === hashEmbeddingText(buildEmbeddingText(record));
}

function cosineSimilarity(left: number[], right: number[]): number {
  if (left.length !== right.length || left.length === 0) {
    return 0;
  }

  let dot = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;

  for (let index = 0; index < left.length; index += 1) {
    dot += left[index] * right[index];
    leftMagnitude += left[index] ** 2;
    rightMagnitude += right[index] ** 2;
  }

  if (leftMagnitude === 0 || rightMagnitude === 0) {
    return 0;
  }

  return dot / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude));
}
