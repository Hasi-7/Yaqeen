# Team Member 1 Data/API Notes

Status: implemented, tested, committed, and pushed to branch `database`.

Commit: `d961bb3 Add data retrieval API`

Pull request URL:

```txt
https://github.com/Hasi-7/Yaqeen/pull/new/database
```

## Scope

This session implemented Team Member 1's MVP layer:

- Curated ruling dataset in `data/rulings.json`.
- Deterministic retrieval in `src/lib/retriever.ts`.
- Optional hybrid/vector retrieval in `src/lib/retrieval/`.
- Backend-owned citation formatting in `src/lib/citations.ts`.
- Source-constrained AI answer generation in `src/lib/ai/`.
- Supported marja metadata in `src/lib/maraji.ts`.
- Runtime dataset validation in `src/lib/ruling-schema.ts`.
- `POST /api/ask` route in `src/app/api/ask/route.ts`.
- Smoke/API/dataset tests in `scripts/`.

The implementation intentionally avoids model-generated citations and unsupported religious reasoning. The dataset remains the source of truth.

## API

Endpoint:

```txt
POST /api/ask
```

Request:

```json
{ "question": "What breaks wudhu?", "marja": "sistani" }
```

Accepted `marja` values:

- `sistani`
- `khamenei`
- `shirazi`
- `all`

The route also accepts `marja_id` for compatibility with backend naming.

Use `"marja": "all"` for Compare All mode. Compare All runs retrieval separately for each marja instead of mixing all sources into one retrieval pass.

Response fields include `mode`, `status` or `results`, `answer`, `sources`, `disclaimer`, and optional AI metadata fields such as `answer_mode`, `ai_provider`, and `ai_model`.

Render source cards from the `sources` array. Do not parse citations out of the answer text.

## Retrieval Behavior

- Single-marja mode filters by `marja_id` before retrieval.
- Compare All mode searches each marja independently.
- Only records with `verification_status` of `verified_demo` or `verified` are retrievable.
- If the question has no sufficiently relevant verified record, the API returns `Not Found in the current verified dataset`.
- Retrieval uses optional hybrid search: vector retrieval when embeddings are enabled and available, with keyword/domain retrieval as the safe fallback.

Vector retrieval is an access layer only. The source of truth remains `data/rulings.json`, and vector results are joined back to verified dataset records by `record_id` before use.

Embedding generation:

```bash
npm run build:embeddings
```

Embedding environment variables:

```txt
OPENAI_API_KEY=<key>
YAQEEN_EMBEDDINGS_ENABLED=true
YAQEEN_EMBEDDING_MODEL=text-embedding-3-small
```

If `data/ruling-embeddings.json` is missing, stale, disabled, or cannot embed the question, retrieval falls back to keyword search.

## AI Answer Generation

The API now performs retrieval before AI generation:

```txt
verified records -> retrieval -> source-constrained AI answer -> backend citations
```

Supported providers are configured with environment variables:

```txt
YAQEEN_AI_ENABLED=true
YAQEEN_AI_PROVIDER=openai | ollama | mock | none
YAQEEN_AI_MODEL=<model-name>
OPENAI_API_KEY=<key>
OLLAMA_BASE_URL=http://localhost:11434
```

If AI is disabled, missing, throws, returns empty text, returns a `Sources:` section, invents URL-like citations, or returns Not Found despite retrieved records, the API uses deterministic fallback text from the top retrieved record.

Citations still come only from stored dataset metadata. The AI prompt explicitly tells the model not to create citations.

Token streaming is not implemented yet.

## Dataset

To add more rulings, append records to `data/rulings.json` using the existing schema. Only records marked `verified_demo` or `verified` are retrievable.

Current MVP coverage is intentionally limited. Add records only when the source text and citation metadata have been verified.

Do not add:

- Model-generated rulings.
- Model-generated citations.
- Inferred opinions from another marja.
- Unsupported page numbers, ruling numbers, or URLs.

## Verification

Manual retrieval test:

```bash
npm run test:retrieval
```

AI/provider/API tests:

```bash
npm run test:ai
```

TypeScript check:

```bash
npx tsc --noEmit
```

Production build:

```bash
npm run build
```

Last known verification status:

- `npm run test:retrieval` passed.
- `npx tsc --noEmit` passed.
- `npm run build` passed.

## Known Risks

- Dataset coverage is narrow and demo-focused.
- Runtime schema validation is not yet implemented for `data/rulings.json`.
- Some citation URL metadata points to official/root source pages instead of direct PDF anchors.
- `npm install` reported 2 moderate dependency vulnerabilities; no force fix was applied.

## Local Untracked Files

These files were intentionally left uncommitted when the `database` branch was pushed:

- `pdf_files/`
- `team_member_1_agent_prompt.md`
- `rulings_verification_prompt.md`
