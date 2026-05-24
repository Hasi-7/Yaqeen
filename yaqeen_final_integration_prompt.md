# Yaqeen Final Integration Prompt — Frontend + AI + Database + Embeddings

You are finishing the Yaqeen hackathon MVP integration.

The app already has:
- Next.js frontend
- `data/rulings.json`
- POST `/api/ask`
- deterministic retrieval
- source cards
- Compare All
- Not Found handling
- disclaimer
- AI provider layer with OpenAI/Ollama/mock/none support
- local Ollama available
- vector/embedding prompt planned but not fully integrated

Your task is to patch everything together so the frontend actually uses the full pipeline:

```txt
frontend question
  → POST /api/ask
  → validated dataset
  → hybrid retrieval: vector if available, keyword fallback
  → source-constrained AI answer if enabled
  → deterministic fallback if AI fails
  → backend-generated citations
  → frontend displays answer mode, source cards, compare table, and disclaimer
```

Do not rewrite the whole app. Patch the current code.

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
src/components/YaqeenApp.tsx
src/lib/types.ts
src/lib/ai/*
src/lib/*
package.json
```

Also inspect whether these exist:

```txt
data/ruling-embeddings.json
scripts/build-embeddings.ts
src/lib/retrieval/*
src/lib/vector*
src/lib/hybrid*
```

Preserve current working behavior.

---

# Goal

Finish the end-to-end MVP integration.

At the end:

1. The frontend sends questions to `/api/ask`.
2. `/api/ask` uses verified records from `data/rulings.json`.
3. Retrieval uses embeddings/vector search if available.
4. Retrieval falls back safely to keyword search if embeddings are unavailable.
5. AI answer generation uses only retrieved records.
6. If AI is disabled or fails, deterministic fallback still works.
7. Frontend clearly shows whether response came from AI or fallback.
8. Source cards remain generated from backend metadata.
9. Compare All still runs separately per marja.
10. Tests/build/lint pass.

---

# Non-Negotiable Safety Rules

Do not break these:

1. `data/rulings.json` is the source of truth.
2. Embeddings are only a search index, not truth.
3. Retrieval must filter by selected marja before returning results.
4. Retrieval must exclude `needs_review`, `draft`, `reviewed`, and `deprecated`.
5. AI must not answer without retrieved source records.
6. Not Found must not call AI.
7. Citations must come from backend metadata, not the AI.
8. Compare All must retrieve separately per marja.
9. No unsupported “all maraji agree” claims.
10. The app must work without OpenAI, Ollama, or embeddings.

---

# Environment Variables

Support these env vars if not already supported:

```env
YAQEEN_AI_ENABLED=true
YAQEEN_AI_PROVIDER=ollama
YAQEEN_AI_MODEL=llama3.2:3b
OLLAMA_BASE_URL=http://localhost:11434

YAQEEN_EMBEDDINGS_ENABLED=true
YAQEEN_EMBEDDING_PROVIDER=ollama
YAQEEN_EMBEDDING_MODEL=nomic-embed-text
```

Also preserve support for:

```env
YAQEEN_AI_PROVIDER=openai
OPENAI_API_KEY=...
YAQEEN_AI_PROVIDER=mock
YAQEEN_AI_PROVIDER=none
```

For embeddings, support one of these paths:

```txt
data/ruling-embeddings.json
```

or whatever existing embedding file path the repo uses.

If embeddings are not built, the app must still work using keyword retrieval.

---

# Part 1 — Inspect Current Integration

First, inspect current flow:

1. What does the frontend send?
   - `marja` or `marja_id`?
2. What does `/api/ask` expect?
3. What does `/api/ask` return?
4. Does frontend handle:
   - `answer_mode`
   - `ai_provider`
   - `ai_model`
   - `sources`
   - `results` for Compare All?
5. Is vector retrieval implemented yet?
6. Is the AI generator actually called by `/api/ask`?

Write a short note in your final report.

Do not change API contract unnecessarily. If frontend and backend mismatch, patch compatibility in the API so both `marja` and `marja_id` work.

---

# Part 2 — Patch API Contract Compatibility

Ensure `/api/ask` accepts both request shapes:

```json
{
  "question": "What breaks wudhu?",
  "marja": "sistani"
}
```

and:

```json
{
  "question": "What breaks wudhu?",
  "marja_id": "sistani"
}
```

Normalize internally to:

```ts
const selectedMarja = body.marja_id ?? body.marja;
```

Valid values:

```txt
sistani
khamenei
shirazi
all
```

Reject:
- empty question
- question longer than 500 characters
- invalid marja

Return 400 with useful JSON.

---

# Part 3 — Ensure AI Is Called After Retrieval

In `/api/ask`, enforce this flow:

```txt
validate request
  → retrieve relevant records
  → if not_found: return Not Found without AI
  → if found: call generateAnswer(...)
  → attach backend-generated sources
  → return response
```

For single marja:

```ts
const retrieval = await retrieveRelevantRulings(question, selectedMarja);

if (retrieval.status === "not_found") {
  return notFoundResponse(...);
}

const generated = await generateAnswer({
  question,
  marjaId: selectedMarja,
  marjaName,
  retrievedRecords: retrieval.results,
});

return {
  mode: "single",
  status: "found",
  answer: generated.answer,
  answer_mode: generated.answer_mode,
  ai_provider: generated.ai_provider,
  ai_model: generated.ai_model,
  sources: retrieval.results.map(toCitation),
  disclaimer,
};
```

For Compare All:

```ts
for each marja:
  retrieve separately
  if not found: no AI
  if found: generateAnswer separately
```

Do not send all maraji into one AI prompt.

---

# Part 4 — Patch Frontend Display

Update `src/components/YaqeenApp.tsx` so the UI shows:

For single response:
- answer text
- answer mode badge:
  - `AI answer` when `answer_mode === "ai"`
  - `Source fallback` when `answer_mode === "deterministic_fallback"`
  - `Not Found` when `answer_mode === "not_found"` or `status === "not_found"`
- provider/model if present:
  - `ollama / llama3.2:3b`
  - `openai / gpt-4o-mini`
  - `mock / mock`
- source cards from `sources`
- follow-up text if provided
- disclaimer

For Compare All:
- one card/table row per marja
- status
- answer
- answer mode badge per marja
- source cards or citation labels per marja
- comparison summary
- disclaimer

Do not parse citations out of the answer string. Use `sources`.

The user should be able to visually confirm the AI path is active.

Example display text:

```txt
Generated with: AI answer · ollama · llama3.2:3b
```

or:

```txt
Generated with: Source fallback
```

---

# Part 5 — Add Lightweight Embedding Retrieval

If vector retrieval is not implemented, add a minimal safe version.

Do not add a heavy external vector database.

Use:

```txt
data/ruling-embeddings.json
```

as a local embedding index.

Add or patch:

```txt
scripts/build-embeddings.ts
src/lib/retrieval/vector-search.ts
src/lib/retrieval/hybrid-search.ts
```

If the repo already has retrieval files, integrate there instead of duplicating.

## Embedding Source of Truth

Only embed eligible records:

```txt
verified_demo
verified
scholar_verified
```

Never embed:

```txt
needs_review
draft
reviewed
deprecated
```

## Embedding Text

Construct embedding text from:

```txt
Marja: {marja_name}
Topic: {topic}
Subtopic: {subtopic}
Question: {question_text}
Tags: {tags}
Ruling: {ruling_text}
Citation: {citation_label}
```

## Embedding File Shape

Use:

```json
[
  {
    "record_id": "sistani_wudhu_001",
    "marja_id": "sistani",
    "embedding_model": "nomic-embed-text",
    "embedding_text_hash": "sha256",
    "embedding": [0.1, 0.2, 0.3]
  }
]
```

Do not duplicate full ruling text in the embedding file.

## Ollama Embeddings

If using Ollama embeddings, support:

```env
YAQEEN_EMBEDDING_PROVIDER=ollama
YAQEEN_EMBEDDING_MODEL=nomic-embed-text
OLLAMA_BASE_URL=http://localhost:11434
```

Use Ollama `/api/embeddings` or `/api/embed`, depending on what is supported by the installed Ollama version.

Make the implementation tolerant:
- if endpoint fails, print clear error
- if embeddings missing, app falls back to keyword retrieval

## Build Embeddings Script

Add package script if not present:

```json
{
  "scripts": {
    "build:embeddings": "tsx scripts/build-embeddings.ts"
  }
}
```

Use the repo’s existing TypeScript runner if different.

The script should:

1. Load `data/rulings.json`.
2. Filter verified records.
3. Build embedding text.
4. Hash embedding text.
5. Reuse embeddings with matching hash if present.
6. Generate missing/stale embeddings.
7. Write `data/ruling-embeddings.json`.
8. Print summary.

## Hybrid Retrieval

Patch the existing retrieval function so the app uses:

```txt
vector retrieval if available and enabled
keyword fallback always available
```

Safe approach:

```txt
If vector top score passes threshold:
  use vector result
Else:
  use keyword result
```

or:

```txt
Run both and merge/deduplicate.
```

Keep it simple.

For Compare All, still call retrieval separately per marja.

---

# Part 6 — Add Test/Debug Commands

Ensure there are easy ways to test.

Add or preserve:

```txt
npm run test:ai
npm run build:embeddings
```

If `test:ai` exists, make sure it can test:
- mock provider
- ollama provider if env is set
- deterministic fallback

Add a small debug note to README:

```md
## Local AI Test

1. Start Ollama.
2. Pull model:
   `ollama pull llama3.2:3b`
3. Set `.env.local`.
4. Run:
   `npm run dev`
5. Ask a covered question.
6. Confirm `answer_mode: ai` and `ai_provider: ollama`.
```

Add embedding notes:

```md
## Local Embeddings

1. Pull embedding model:
   `ollama pull nomic-embed-text`
2. Set:
   `YAQEEN_EMBEDDINGS_ENABLED=true`
   `YAQEEN_EMBEDDING_PROVIDER=ollama`
   `YAQEEN_EMBEDDING_MODEL=nomic-embed-text`
3. Run:
   `npm run build:embeddings`
```

---

# Part 7 — Tests

Add or update tests for:

## API + AI

1. API accepts `marja`.
2. API accepts `marja_id`.
3. Found answer can return `answer_mode: ai` with mock provider.
4. AI disabled returns deterministic fallback.
5. Not Found does not call AI.
6. Sources still come from backend metadata.
7. Compare All returns separate per-marja answer modes.

## Embeddings

1. App works when `data/ruling-embeddings.json` is missing.
2. Vector search excludes non-verified records.
3. Hybrid search falls back to keyword.
4. Compare All still retrieves separately.
5. Invalid embedding `record_id` is ignored.

Do not call real Ollama or OpenAI in automated tests. Mock external calls.

---

# Part 8 — Manual Local Test Commands

After implementation, run:

```powershell
npm test
npm run build
npm run lint
```

Then manually test with Ollama:

```powershell
ollama pull llama3.2:3b
ollama pull nomic-embed-text
```

Create `.env.local`:

```env
YAQEEN_AI_ENABLED=true
YAQEEN_AI_PROVIDER=ollama
YAQEEN_AI_MODEL=llama3.2:3b
OLLAMA_BASE_URL=http://localhost:11434

YAQEEN_EMBEDDINGS_ENABLED=true
YAQEEN_EMBEDDING_PROVIDER=ollama
YAQEEN_EMBEDDING_MODEL=nomic-embed-text
```

Build embeddings:

```powershell
npm run build:embeddings
```

Start app:

```powershell
npm run dev
```

Test API:

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/ask" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"question":"What breaks wudhu?","marja":"sistani"}'
```

Expected:
- `status: found`
- `answer_mode: ai`
- `ai_provider: ollama`
- `sources` non-empty

Test Compare All:

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/ask" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"question":"What breaks wudhu?","marja":"all"}'
```

Expected:
- one result per marja
- no blended answer
- found results have citations
- not found results have empty sources

---

# Part 9 — Do Not Overbuild

Do not add:
- Pinecone
- Supabase
- Qdrant
- Weaviate
- auth
- database migrations
- PDF ingestion
- admin panel
- streaming unless everything else is complete

This is a hackathon MVP. Finish the working integration.

---

# Acceptance Criteria

You are done when:

1. Frontend calls the integrated API successfully.
2. API supports both `marja` and `marja_id`.
3. AI generation works with mock provider.
4. AI generation works with Ollama if local model is available.
5. Deterministic fallback works when AI is disabled.
6. Embeddings can be built locally if Ollama embedding model is available.
7. App falls back to keyword retrieval if embeddings are missing.
8. Frontend displays answer mode/provider/model.
9. Source cards still render from backend metadata.
10. Compare All remains separate per marja.
11. `npm test` passes.
12. `npm run build` passes.
13. `npm run lint` passes.
14. README explains local AI and local embeddings setup.

---

# Final Report

At the end, report:

```txt
Final integration complete.

Files changed:
-

AI:
- provider tested:
- answer_mode shown in frontend:
- fallback behavior:

Embeddings:
- embedding provider:
- build script:
- vector file:
- keyword fallback:

API:
- accepts marja:
- accepts marja_id:
- Compare All:

Frontend:
- answer mode badge:
- source cards:
- comparison display:

Commands run:
- npm test
- npm run build
- npm run lint
- npm run build:embeddings if run

Manual test:
- single marja:
- compare all:
- not found:

Remaining risks:
-
```

Remember: for Yaqeen, the model is not the source of truth. The verified dataset is.
