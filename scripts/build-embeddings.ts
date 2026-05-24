import { promises as fs } from "node:fs";
import path from "node:path";
import rulings from "../data/rulings.json";
import { buildEmbeddingText, hashEmbeddingText, isEmbeddableRecord } from "../src/lib/retrieval/embedding-text";
import type { MarjaId, RulingRecord } from "../src/lib/types";

type EmbeddingRecord = {
  record_id: string;
  marja_id: MarjaId;
  embedding_model: string;
  embedding_text_hash: string;
  embedding: number[];
};

const OUTPUT_PATH = path.join(process.cwd(), "data", "ruling-embeddings.json");
const OPENAI_EMBEDDINGS_URL = "https://api.openai.com/v1/embeddings";
const DEFAULT_OPENAI_MODEL = "text-embedding-3-small";
const DEFAULT_OLLAMA_MODEL = "nomic-embed-text";

async function main() {
  const provider = process.env.YAQEEN_EMBEDDING_PROVIDER ?? "openai";
  const defaultModel = provider === "ollama" ? DEFAULT_OLLAMA_MODEL : DEFAULT_OPENAI_MODEL;
  const model = process.env.YAQEEN_EMBEDDING_MODEL ?? defaultModel;
  const records = (rulings as RulingRecord[]).filter(isEmbeddableRecord);
  const existing = await readExistingEmbeddings();
  const existingByKey = new Map(existing.map((item) => [embeddingKey(item), item]));

  let reused = 0;
  let created = 0;
  let skipped = 0;
  const output: EmbeddingRecord[] = [];

  console.log(`provider: ${provider}`);
  console.log(`model: ${model}`);

  for (const record of records) {
    const embeddingText = buildEmbeddingText(record);
    const textHash = hashEmbeddingText(embeddingText);
    const reusable = existingByKey.get(`${record.id}:${model}:${textHash}`);

    if (reusable) {
      output.push(reusable);
      reused += 1;
      continue;
    }

    const embedding = await generateEmbedding(embeddingText, provider, model);
    if (!embedding) {
      skipped += 1;
      continue;
    }

    output.push({
      record_id: record.id,
      marja_id: record.marja_id,
      embedding_model: model,
      embedding_text_hash: textHash,
      embedding,
    });
    created += 1;
  }

  await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`, "utf8");

  console.log(`records checked: ${records.length}`);
  console.log(`embeddings reused: ${reused}`);
  console.log(`embeddings created: ${created}`);
  console.log(`embeddings skipped (no provider): ${skipped}`);
  console.log(`ineligible records: ${(rulings as RulingRecord[]).length - records.length}`);
  console.log(`output path: ${OUTPUT_PATH}`);
}

async function generateEmbedding(input: string, provider: string, model: string): Promise<number[] | null> {
  if (provider === "ollama") {
    return embedWithOllama(input, model);
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.log("OPENAI_API_KEY not set; skipping generation. Set YAQEEN_EMBEDDING_PROVIDER=ollama to use Ollama.");
    return null;
  }

  return embedWithOpenAI(input, model, apiKey);
}

async function embedWithOllama(input: string, model: string): Promise<number[] | null> {
  const baseUrl = (process.env.OLLAMA_BASE_URL ?? "http://localhost:11434").replace(/\/$/, "");

  for (const endpoint of ["/api/embed", "/api/embeddings"]) {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, input }),
      });

      if (!response.ok) continue;

      const payload = (await response.json()) as { embedding?: number[]; embeddings?: number[][] };
      const embedding = payload.embedding ?? payload.embeddings?.[0];
      if (embedding) return embedding;
    } catch {
      // try next endpoint
    }
  }

  console.error(`Ollama embedding failed for model ${model} at ${process.env.OLLAMA_BASE_URL ?? "http://localhost:11434"}`);
  return null;
}

async function readExistingEmbeddings(): Promise<EmbeddingRecord[]> {
  try {
    const raw = await fs.readFile(OUTPUT_PATH, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter(isEmbeddingRecord) : [];
  } catch (error) {
    if (error instanceof Error && "code" in error && (error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

function isEmbeddingRecord(value: unknown): value is EmbeddingRecord {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<EmbeddingRecord>;
  return Boolean(
    record.record_id &&
      record.marja_id &&
      record.embedding_model &&
      record.embedding_text_hash &&
      Array.isArray(record.embedding) &&
      record.embedding.every((item) => typeof item === "number"),
  );
}

function embeddingKey(record: EmbeddingRecord): string {
  return `${record.record_id}:${record.embedding_model}:${record.embedding_text_hash}`;
}

async function embedWithOpenAI(input: string, model: string, apiKey: string): Promise<number[]> {
  const response = await fetch(OPENAI_EMBEDDINGS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ input, model }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI embeddings request failed with ${response.status}`);
  }

  const payload = (await response.json()) as { data?: Array<{ embedding?: number[] }> };
  const embedding = payload.data?.[0]?.embedding;

  if (!embedding) {
    throw new Error("OpenAI embeddings response did not include an embedding.");
  }

  return embedding;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
