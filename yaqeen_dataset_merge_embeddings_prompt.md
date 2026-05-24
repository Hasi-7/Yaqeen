# Yaqeen Dataset Merge + Embeddings Integration Prompt

You are continuing the Yaqeen hackathon MVP.

The app currently has:

- Core dataset: `data/rulings.json`
- Expanded datasets, likely under:
  - `data/expanded/sistani_rulings.json`
  - `data/expanded/khamenei_rulings.json`
  - `data/expanded/shirazi_rulings.json`
- Optional/local embeddings support, likely:
  - `data/ruling-embeddings.json`
  - `scripts/build-embeddings.ts`
  - retrieval code under `src/lib/retrieval/*` or similar
- API: `POST /api/ask`
- AI layer with source-constrained generation and deterministic fallback
- Compare All mode
- Backend-generated source citations

Your task is to safely merge verified expanded records into the core dataset and regenerate vector embeddings, without adding duplicate data points.

Do not rewrite architecture. Do not change app behavior except improving dataset coverage and embeddings.

---

## Required Reading First

Read these files before editing:

```txt
AGENTS.md
PRD.md
README.md
data/rulings.json
reports/rulings_verification_report.md
src/app/api/ask/route.ts
src/lib/types.ts
src/lib/*
package.json
```

Then inspect:

```txt
data/expanded/
data/ruling-embeddings.json
scripts/build-embeddings.ts
src/lib/retrieval/
reports/database_expansion_report.md
```

If some of these files do not exist, continue with the files that do exist.

---

# Objective

Merge non-duplicate, source-verified expanded records into:

```txt
data/rulings.json
```

Then rebuild/update:

```txt
data/ruling-embeddings.json
```

so the app can retrieve the newly merged records through vector/hybrid retrieval.

---

# Non-Negotiable Safety Rules

1. `data/rulings.json` remains the source of truth.
2. Only merge records whose `verification_status` is one of:
   - `verified_demo`
   - `verified`
   - `scholar_verified`
3. Do not merge records marked:
   - `needs_review`
   - `draft`
   - `reviewed`
   - `deprecated`
4. Do not merge duplicate data points.
5. Do not alter `ruling_text` unless fixing obvious JSON escaping or formatting issues.
6. `ruling_text` must remain exact source wording.
7. Do not paraphrase, summarize, or interpret rulings.
8. Do not invent citation metadata.
9. Do not remove existing verified core records.
10. Do not let embeddings become the source of truth.
11. If uncertain whether a record is duplicate or valid, do not merge it; report it.

---

# Expanded Dataset Files

Look for expanded dataset files in:

```txt
data/expanded/
```

Expected files:

```txt
data/expanded/sistani_rulings.json
data/expanded/khamenei_rulings.json
data/expanded/shirazi_rulings.json
```

Each file should contain only records for that marja.

Validate that:

```txt
sistani_rulings.json → marja_id must be sistani
khamenei_rulings.json → marja_id must be khamenei
shirazi_rulings.json → marja_id must be shirazi
```

If a record is in the wrong file or has mismatched `marja_id`, do not merge it. Report it.

---

# Required Merge Logic

Implement or use a script rather than manually copying records.

Preferred script:

```txt
scripts/merge-expanded-rulings.ts
```

The script should:

1. Load `data/rulings.json`.
2. Load all JSON files under `data/expanded/`.
3. Validate JSON structure.
4. Filter only eligible records:
   - `verified_demo`
   - `verified`
   - `scholar_verified`
5. Exclude all non-eligible records.
6. Detect duplicates.
7. Merge only unique records.
8. Sort final records consistently.
9. Write updated `data/rulings.json`.
10. Write a merge report.

Add package script if appropriate:

```json
{
  "scripts": {
    "merge:expanded": "tsx scripts/merge-expanded-rulings.ts"
  }
}
```

Use the repo’s existing TypeScript script runner. If `tsx` is not installed and the repo uses another runner, use that instead.

---

# Duplicate Detection Rules

A duplicate means the same substantive ruling record already exists in the core dataset.

Detect duplicates using multiple methods.

## 1. Exact ID duplicate

If expanded record `id` already exists in `data/rulings.json`, do not merge it.

Report:

```txt
duplicate_type: exact_id
```

## 2. Same marja + same source + same ruling number

If all of these match:

```txt
marja_id
source_title
chapter_title
section_title
ruling_number
```

then treat as duplicate.

Report:

```txt
duplicate_type: same_source_reference
```

## 3. Same marja + same citation label

If all of these match:

```txt
marja_id
citation_label
```

then treat as likely duplicate.

Report:

```txt
duplicate_type: same_citation
```

## 4. Same marja + normalized exact ruling text

Normalize `ruling_text` by:

- lowercasing
- trimming
- collapsing whitespace
- removing repeated spaces
- normalizing straight/curly quotes only if needed

If normalized `ruling_text` matches for the same `marja_id`, treat as duplicate.

Report:

```txt
duplicate_type: same_ruling_text
```

## 5. Near duplicate

If records have the same marja and highly similar `ruling_text`, same topic, or overlapping citation but not exact, do not merge automatically.

Report as:

```txt
duplicate_type: possible_near_duplicate
action: skipped
```

Do not use an LLM to decide near duplicates. Use conservative heuristics.

---

# Required Field Validation

Each merged record must have these required fields:

```txt
id
marja_id
marja_name
source_type
source_title
topic
question_text
ruling_text
language
tags
citation_label
verification_status
confidence_level
```

Reject/skip any expanded record missing required fields.

Optional fields may be null:

```txt
official_url
source_file
subtopic
chapter_title
section_title
ruling_number
page_number
```

Allowed `marja_id` values:

```txt
sistani
khamenei
shirazi
```

Allowed `verification_status` values in merged core dataset:

```txt
verified_demo
verified
scholar_verified
needs_review
deprecated
draft
reviewed
```

But only merge new records if status is one of:

```txt
verified_demo
verified
scholar_verified
```

Allowed `confidence_level` values:

```txt
high
medium
low
```

If tags are missing or not an array, skip.

If `ruling_text` is empty, skip.

If `citation_label` is empty, skip.

---

# ID Collision Handling

Do not overwrite existing IDs.

If an expanded record is unique but its `id` collides with an existing core record, create a new stable ID.

Format:

```txt
{marja_id}_{topic_slug}_{next_number}
```

Example:

```txt
sistani_wudhu_013
khamenei_fasting_009
shirazi_taharah_021
```

Report the ID change:

```txt
old_id:
new_id:
reason: id_collision
```

Do not change IDs of existing core records.

---

# Sorting Rules

After merging, sort `data/rulings.json` by:

1. `marja_id`
2. `topic`
3. `subtopic`
4. `source_title`
5. `ruling_number`
6. `id`

Keep formatting stable: pretty JSON with 2-space indentation.

---

# Merge Report

Create or update:

```txt
reports/expanded_dataset_merge_report.md
```

Report format:

```md
# Expanded Dataset Merge Report

## Summary

Core records before:
Expanded records found:
Eligible expanded records:
Merged records:
Skipped duplicates:
Skipped needs_review/draft/deprecated:
Skipped invalid records:
Core records after:

## Files Processed

- data/expanded/sistani_rulings.json
- data/expanded/khamenei_rulings.json
- data/expanded/shirazi_rulings.json

## Merged Records

| id | marja | topic | citation |
|---|---|---|---|

## Skipped Duplicates

| expanded_id | existing_id | duplicate_type | reason |
|---|---|---|---|

## Skipped Invalid or Ineligible Records

| id | status | reason |
|---|---|---|

## ID Changes

| old_id | new_id | reason |
|---|---|---|

## Next Review Items

List any near duplicates or uncertain records that should be manually reviewed.
```

---

# Embeddings Integration

After merging, update vector embeddings.

Preferred command:

```bash
npm run build:embeddings
```

If this script does not exist, create it or adapt the existing embedding builder.

The embedding builder must:

1. Load `data/rulings.json`.
2. Embed only eligible records:
   - `verified_demo`
   - `verified`
   - `scholar_verified`
3. Skip:
   - `needs_review`
   - `draft`
   - `reviewed`
   - `deprecated`
4. Reuse existing embeddings when the source text hash has not changed.
5. Generate embeddings for newly merged records.
6. Remove or ignore embeddings for deleted/ineligible records.
7. Write:
   - `data/ruling-embeddings.json`
8. Print summary.

---

# Embedding Text

For each record, build embedding text from:

```txt
Marja: {marja_name}
Topic: {topic}
Subtopic: {subtopic}
Question: {question_text}
Tags: {tags}
Ruling: {ruling_text}
Citation: {citation_label}
```

Hash this embedding text.

Store:

```json
{
  "record_id": "sistani_wudhu_001",
  "marja_id": "sistani",
  "embedding_model": "nomic-embed-text",
  "embedding_text_hash": "sha256...",
  "embedding": [0.1, 0.2, 0.3]
}
```

Do not duplicate full ruling text in the embeddings file.

---

# Local Ollama Embeddings

If using Ollama, expect:

```env
YAQEEN_EMBEDDINGS_ENABLED=true
YAQEEN_EMBEDDING_PROVIDER=ollama
YAQEEN_EMBEDDING_MODEL=nomic-embed-text
OLLAMA_BASE_URL=http://localhost:11434
```

If `nomic-embed-text` is not installed, do not fail the merge. Report:

```txt
Embeddings not generated because model is missing.
Run: ollama pull nomic-embed-text
Then: npm run build:embeddings
```

Do not let missing embeddings break the app. Keyword fallback must continue working.

---

# Retrieval Integration Check

After updating embeddings, confirm retrieval still works.

Check that:

1. API can answer from existing original records.
2. API can answer from at least one newly merged record.
3. Compare All still returns separate per-marja results.
4. Sources are still backend-generated.
5. AI answer generation still receives retrieved records only.
6. If embeddings are missing, keyword fallback works.
7. If AI is unavailable, deterministic fallback works.

---

# Suggested Manual Tests

Run:

```bash
npm test
npm run build
npm run lint
```

If embeddings are configured:

```bash
npm run build:embeddings
```

Then test API manually.

Single marja:

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/ask" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"question":"What breaks wudhu?","marja":"sistani"}'
```

Compare All:

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/ask" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"question":"What breaks wudhu?","marja":"all"}'
```

Test one newly merged record by asking a question matching its `question_text` or tags.

---

# Tests to Add or Update

Add tests if the existing setup makes it feasible.

Tests for merge script:

1. Skips `needs_review`.
2. Skips exact ID duplicate.
3. Skips same citation duplicate.
4. Skips same normalized `ruling_text` duplicate.
5. Merges unique verified record.
6. Handles ID collision by creating new stable ID.
7. Writes report.

Tests for retrieval after merge:

1. Newly merged record is retrievable.
2. Duplicate records are not returned twice.
3. Embeddings file links to valid `record_id`.
4. Missing embeddings still falls back to keyword.

Do not call real Ollama/OpenAI in automated tests.

---

# Do Not Do

Do not:

- Use LLM reasoning to decide religious duplicate meaning.
- Merge `needs_review` records.
- Change exact source wording.
- Delete existing core records.
- Turn embeddings into source of truth.
- Modify frontend design unless needed for display.
- Modify AI prompt unless needed for new record compatibility.
- Add Pinecone, Supabase, Qdrant, or Weaviate.
- Add PDF ingestion.
- Add admin dashboard.

---

# Acceptance Criteria

You are done when:

1. Expanded verified records are merged into `data/rulings.json`.
2. No exact duplicate IDs are added.
3. No duplicate citations/ruling text are added.
4. Ineligible records are skipped and reported.
5. `reports/expanded_dataset_merge_report.md` exists.
6. `data/rulings.json` remains valid JSON.
7. Embeddings are regenerated or clear instructions are reported if not possible.
8. `data/ruling-embeddings.json` contains embeddings for eligible records if embedding generation ran.
9. API still works for original records.
10. API works for at least one newly merged record.
11. Compare All still works.
12. `npm test`, `npm run build`, and `npm run lint` pass.

---

# Final Report

At the end, report:

```txt
Expanded dataset merge complete.

Files changed:
-

Core dataset:
- before:
- after:
- merged:
- skipped duplicates:
- skipped ineligible:
- skipped invalid:

Embeddings:
- generated: yes/no
- model:
- records embedded:
- reused:
- skipped:
- file:

Tests:
- npm test:
- npm run build:
- npm run lint:

Manual API checks:
- original record:
- newly merged record:
- compare all:

Remaining risks:
-
```

Do not commit unless instructed.
