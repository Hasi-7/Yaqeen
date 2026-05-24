import assert from "node:assert/strict";
import rulings from "../data/rulings.json";
import { buildEmbeddingText, hashEmbeddingText } from "../src/lib/retrieval/embedding-text";
import { hybridSearchRulings } from "../src/lib/retrieval/hybrid-search";
import { vectorSearchRulings, type RulingEmbedding } from "../src/lib/retrieval/vector-search";
import type { RulingRecord } from "../src/lib/types";

const records = rulings as RulingRecord[];
const wudhuRecord = records.find((record) => record.id === "sistani_wudhu_001") as RulingRecord | undefined;
const shiraziWudhuRecord = records.find((record) => record.id === "shirazi_wudhu_001") as RulingRecord | undefined;

if (!wudhuRecord || !shiraziWudhuRecord) {
  throw new Error("Vector retrieval fixtures are missing expected wudhu records.");
}

const sistaniWudhuRecord: RulingRecord = wudhuRecord;
const verifiedShiraziWudhuRecord: RulingRecord = shiraziWudhuRecord;

async function main() {
  await testKeywordFallbackWhenEmbeddingsMissing();
  await testVectorExcludesNeedsReview();
  await testCompareAllRunsPerMarjaEquivalent();
  await testSourcesComeFromRulingsMetadata();
  await testSimilarWordingWithMockEmbeddings();
  await testInvalidEmbeddingRecordIdIgnored();

  console.log("PASS vector retrieval tests");
}

async function testKeywordFallbackWhenEmbeddingsMissing() {
  delete process.env.YAQEEN_EMBEDDINGS_ENABLED;
  const results = await hybridSearchRulings(records, "What breaks wudhu?", "sistani");
  assert.equal(results[0]?.record.id, "sistani_wudhu_001");
}

async function testVectorExcludesNeedsReview() {
  const unsafeRecord: RulingRecord = {
    ...sistaniWudhuRecord,
    id: "sistani_wudhu_needs_review",
    verification_status: "needs_review",
  };
  const embeddings = [embeddingFor(unsafeRecord, [1, 0])];

  const results = await vectorSearchRulings(
    [unsafeRecord],
    "Do I need ablution again?",
    "sistani",
    {
      embeddings,
      embedQuestion: () => [1, 0],
      threshold: 0.1,
    },
  );

  assert.deepEqual(results, []);
}

async function testCompareAllRunsPerMarjaEquivalent() {
  const embeddings = [
    embeddingFor(sistaniWudhuRecord, [1, 0]),
    embeddingFor(verifiedShiraziWudhuRecord, [1, 0]),
  ];

  const sistani = await hybridSearchRulings(records, "Do I need ablution again?", "sistani", {
    embeddings,
    embedQuestion: () => [1, 0],
  });
  const shirazi = await hybridSearchRulings(records, "Do I need ablution again?", "shirazi", {
    embeddings,
    embedQuestion: () => [1, 0],
  });

  assert.equal(sistani[0]?.record.marja_id, "sistani");
  assert.equal(shirazi[0]?.record.marja_id, "shirazi");
}

async function testSourcesComeFromRulingsMetadata() {
  const results = await hybridSearchRulings(records, "Do I need ablution again?", "sistani", {
    embeddings: [embeddingFor(sistaniWudhuRecord, [1, 0])],
    embedQuestion: () => [1, 0],
  });

  assert.equal(results[0]?.record.citation_label, sistaniWudhuRecord.citation_label);
  assert.equal(results[0]?.record.ruling_text, sistaniWudhuRecord.ruling_text);
}

async function testSimilarWordingWithMockEmbeddings() {
  const results = await hybridSearchRulings(records, "Do I need ablution again?", "sistani", {
    embeddings: [embeddingFor(sistaniWudhuRecord, [1, 0]), embeddingFor(records.find((record) => record.id === "sistani_friday_prayer_001")!, [0, 1])],
    embedQuestion: () => [1, 0],
  });

  assert.equal(results[0]?.record.id, "sistani_wudhu_001");
}

async function testInvalidEmbeddingRecordIdIgnored() {
  const results = await vectorSearchRulings(records, "Do I need ablution again?", "sistani", {
    embeddings: [
      {
        record_id: "missing_record",
        marja_id: "sistani",
        embedding_model: "mock",
        embedding_text_hash: "not-used",
        embedding: [1, 0],
      },
    ],
    embedQuestion: () => [1, 0],
    threshold: 0.1,
  });

  assert.deepEqual(results, []);
}

function embeddingFor(record: RulingRecord, embedding: number[]): RulingEmbedding {
  return {
    record_id: record.id,
    marja_id: record.marja_id,
    embedding_model: "mock",
    embedding_text_hash: hashEmbeddingText(buildEmbeddingText(record)),
    embedding,
  };
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
