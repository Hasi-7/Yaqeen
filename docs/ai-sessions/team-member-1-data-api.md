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
- Deterministic retrieval in `lib/retriever.ts`.
- Backend-owned citation formatting in `lib/citations.ts`.
- Deterministic short answer formatting in `lib/answer.ts`.
- Supported marja metadata and validation in `lib/marja.ts`.
- `POST /api/ask` route in `app/api/ask/route.ts`.
- Smoke tests in `scripts/test-retrieval.ts`.

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

Response fields include `mode`, `status` or `results`, `answer`, `sources`, `follow_up`, and `disclaimer`.

Render source cards from the `sources` array. Do not parse citations out of the answer text.

## Retrieval Behavior

- Single-marja mode filters by `marja_id` before retrieval.
- Compare All mode searches each marja independently.
- Only records with `verification_status` of `verified_demo` or `verified` are retrievable.
- If the question has no sufficiently relevant verified record, the API returns `Not Found in the current verified dataset`.
- Retrieval is keyword/domain based for MVP reliability and demo speed.

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
