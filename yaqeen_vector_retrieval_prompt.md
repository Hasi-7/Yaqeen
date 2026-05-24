# Yaqeen Vector Retrieval Implementation Prompt

You are continuing the Yaqeen MVP.

Current state:
- data/rulings.json is the source of truth.
- Retrieval is deterministic keyword/domain based.
- POST /api/ask already supports single-marja and Compare All.
- AI generation may be implemented separately.
- Do not break the current safe retrieval and Not Found behavior.

Your task is to add lightweight vector/embedding retrieval as a retrieval upgrade, not as a replacement for the source database.

---

## Core Principle

The vector index is not the database.

The source of truth remains:

```txt
data/rulings.json
```

The vector index is only a search accelerator over verified records.

---

## Goal

Add semantic retrieval so user questions can match records even when wording differs.

Example:
- User asks: “Do I need ablution again?”
- Dataset says: “Things that invalidate wudhu”
- Vector search should retrieve the wudhu record.

---

## Required Safety Invariants

Do not break these:

1. Filter by selected marja before returning results.
2. Exclude needs_review and deprecated records.
3. No source = Not Found.
4. Citations come from dataset metadata.
5. Compare All runs retrieval separately per marja.
6. Keyword retrieval fallback remains available.
7. App works if embedding file or API key is missing.
8. Vector search must never invent or alter ruling_text.
9. data/rulings.json remains the source of truth.

---

## Recommended Files

Add:

```txt
scripts/build-embeddings.ts
data/ruling-embeddings.json
src/lib/retrieval/vector-search.ts
src/lib/retrieval/hybrid-search.ts
```

Adapt paths to existing repo structure.

---

## Embedding Model

Use OpenAI embeddings if available:

```txt
text-embedding-3-small
```

Environment variables:

```txt
OPENAI_API_KEY
YAQEEN_EMBEDDINGS_ENABLED=true
YAQEEN_EMBEDDING_MODEL=text-embedding-3-small
```

If OpenAI embeddings are not available, skip generation and keep keyword fallback.

Do not hardcode keys.

---

## Embedding Record Shape

Create `data/ruling-embeddings.json`:

```json
[
  {
    "record_id": "sistani_wudhu_001",
    "marja_id": "sistani",
    "embedding_model": "text-embedding-3-small",
    "embedding_text_hash": "sha256-hash",
    "embedding": [0.0123, -0.0456]
  }
]
```

Do not duplicate full ruling text in the embeddings file.

The `record_id` links back to `data/rulings.json`.

---

## Embedding Text

For each verified record, embed this constructed text:

```txt
Marja: {marja_name}
Topic: {topic}
Subtopic: {subtopic}
Question: {question_text}
Tags: {tags}
Ruling: {ruling_text}
Citation: {citation_label}
```

Only embed records with:

```txt
verified_demo
verified
scholar_verified
```

Do not embed:

```txt
needs_review
deprecated
draft
reviewed
```

---

## Build Script Requirements

Create:

```txt
scripts/build-embeddings.ts
```

It should:

1. Load `data/rulings.json`.
2. Validate records if validation exists.
3. Filter eligible verified records.
4. Construct embedding text.
5. Hash embedding text.
6. If existing embedding with same hash exists, reuse it.
7. Generate embeddings for missing/stale records.
8. Write `data/ruling-embeddings.json`.
9. Print summary:
   - records checked
   - embeddings reused
   - embeddings created
   - skipped records
   - output path

Add package script if appropriate:

```json
{
  "scripts": {
    "build:embeddings": "tsx scripts/build-embeddings.ts"
  }
}
```

Use existing project tooling. If `tsx` is not available, use whatever the repo already uses for TypeScript scripts.

---

## Vector Search Requirements

Create vector search function:

```ts
vectorSearchRulings(question, marjaId)
```

It should:

1. Return null or fallback signal if embeddings disabled/missing.
2. Embed user question.
3. Filter embeddings by marja_id.
4. Join embedding result to source record by record_id.
5. Exclude ineligible records again.
6. Compute cosine similarity.
7. Return top 3 results.
8. Apply threshold.

Suggested threshold to start:

```txt
0.35 to 0.45
```

Tune based on tests.

---

## Hybrid Search Requirements

Create hybrid search:

```ts
hybridSearchRulings(question, marjaId)
```

It should:

1. Run vector search if enabled.
2. Run existing keyword search.
3. Combine scores.
4. Deduplicate by record_id.
5. Return top 3.
6. Fall back to keyword search if vector search unavailable.

Suggested scoring:

```txt
final_score = 0.7 * normalized_vector_score + 0.3 * normalized_keyword_score
```

If normalization is time-consuming, use a simpler rule:

```txt
Prefer vector top results when above threshold.
Otherwise use keyword search.
```

---

## API Integration

Do not change the API contract if possible.

Replace internal retrieval call with hybrid retrieval:

```txt
retrieveRelevantRulings → hybridSearchRulings
```

or wrap existing retrieval so the rest of the API does not change.

For Compare All, still run separately:

```txt
hybridSearchRulings(question, "sistani")
hybridSearchRulings(question, "khamenei")
hybridSearchRulings(question, "shirazi")
```

---

## Tests

Add tests for:

1. App falls back to keyword when embeddings file missing.
2. App excludes needs_review records from vector search.
3. Compare All still runs per marja.
4. Returned sources still come from rulings.json metadata.
5. Similar wording question retrieves expected record if embeddings are mocked.
6. Invalid embedding record_id is ignored safely.

Do not call real OpenAI embeddings in tests. Mock embedding vectors.

---

## Documentation

Update README or implementation notes with:

```txt
Vector retrieval is optional.
Source of truth is data/rulings.json.
Embeddings can be regenerated using npm run build:embeddings.
If embeddings are missing, Yaqeen falls back to deterministic keyword retrieval.
```

---

## Acceptance Criteria

Done when:

1. `npm run build:embeddings` works if OPENAI_API_KEY is present.
2. App still works if embeddings are missing.
3. Hybrid/vector retrieval is used before AI answer generation.
4. Compare All still retrieves separately per marja.
5. Not Found still works.
6. Tests pass.
7. Build passes.
8. Lint passes.

---

## Final Report

Report:

```txt
Vector retrieval implementation complete.

Added:
- files changed
- embedding script
- retrieval functions
- tests

Behavior:
- with embeddings:
- without embeddings:
- Compare All:
- fallback:

Commands run:
- npm test
- npm run build
- npm run lint
- npm run build:embeddings if possible

Remaining:
- production vector DB
- local embedding model
- threshold tuning
```

---

## Final Reminder

The vector database does not determine truth.

It only helps find the correct verified record.

The safe flow is:

```txt
data/rulings.json → embeddings index → marja-filtered retrieval → source-constrained AI → backend citations
```
