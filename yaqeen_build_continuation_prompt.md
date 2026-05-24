# Yaqeen Continuation Build Prompt

You are continuing development on the Yaqeen hackathon MVP.

Current repo state:
- Frontend + database/API are merged and pushed to main.
- App runs at http://localhost:3000.
- Current commit: 87791da Merge frontend with data API.
- data/rulings.json has 12 verified demo rulings.
- reports/rulings_verification_report.md exists.
- POST /api/ask supports marja-specific retrieval and Compare All.
- Source cards, comparison output, disclaimer, and safe Not Found handling exist.
- npm test, npm run build, and lint have passed.
- Retrieval is deterministic keyword/domain based.
- Local AI is optional; fallback answer uses source records directly.
- Compare All retrieves separately per marja.
- Untracked local files remain: pdf_files/, prompts, and background expansion prompt.

Your task is to continue building toward the PRD-defined hackathon MVP without breaking the working demo.

---

## Required Reading First

Read:
- AGENTS.md
- PRD.md
- reports/rulings_verification_report.md
- data/rulings.json
- existing tests
- src/lib/*
- src/app/api/ask/*

Do not make broad refactors. Prioritize demo path.

---

## PRD Alignment

The PRD requires:
- Web app with marja selector and Compare All.
- Source-backed answers.
- Not Found when no verified source exists.
- Disclaimer on every response.
- Suggested official follow-up path.
- 30–50 verified records as the target MVP dataset.
- 10–15 demo questions answered correctly.
- 0 invented citations.
- Compare All working for at least 3 demo questions.
- Backend-generated citations only.
- Separate retrieval per marja.

The current app is demo-capable but has a narrow dataset. Your job is to strengthen reliability, demo polish, and dataset readiness.

---

## Highest-Priority Goals

Complete these in order:

1. Update suggested questions to match the records currently covered.
2. Add runtime schema validation for data/rulings.json.
3. Add API-level tests for POST /api/ask.
4. Clean stale docs that imply the dataset/API may be missing.
5. Align root lib/* test path with actual src/lib/* app path.
6. Prepare the repo for adding more verified records.
7. Do not interfere with the background database expansion agent.

---

## Do Not Do

Do not:
- Rewrite the architecture.
- Replace deterministic retrieval with a new vector DB.
- Add a full PDF ingestion pipeline.
- Modify untracked pdf_files/ unless explicitly needed.
- Change the exact source wording in data/rulings.json unless verifying against source text.
- Let AI generate citations.
- Remove Not Found safety behavior.
- Merge unverified background expansion records into data/rulings.json without verification.
- Break current demo behavior.

---

## Task 1: Demo Question Polish

Find the current suggested questions in the frontend.

Update them so they only include questions that are actually covered by data/rulings.json.

Goal:
- 5–8 suggested questions.
- Each should reliably return a cited answer for at least one selected marja.
- Include at least 2–3 questions that work well in Compare All mode, even if some maraji return Not Found.

Do not include questions that look impressive but fail due to missing data.

After updating, manually test each suggested question against:
- Sistani
- Khamenei
- Shirazi
- Compare All

Document results briefly in a report or README section.

---

## Task 2: Runtime Schema Validation

Add runtime validation for data/rulings.json.

Preferred:
- Use zod if already installed.
- If not installed, either add zod if acceptable in this repo or create a lightweight validation function without new dependencies.

Validate:
- id: string
- marja_id: one of sistani, khamenei, shirazi
- marja_name: string
- source_type: string
- source_title: string
- topic: string
- question_text: string
- ruling_text: string
- language: string
- tags: string[]
- citation_label: string
- verification_status: verified_demo | verified | needs_review | deprecated
- confidence_level: high | medium | low

Rules:
- App retrieval should only use verified_demo or verified.
- Invalid records should fail loudly in tests/build, not silently corrupt answers.
- Do not retrieve needs_review or deprecated records.

Add a test for invalid records if test structure supports it.

---

## Task 3: API Route Tests

Add API-level tests for POST /api/ask.

Test cases:
1. Valid single-marja request returns mode single.
2. Valid found answer includes at least one source.
3. Valid Not Found answer includes empty sources and Not Found text.
4. Compare All returns one result per marja.
5. Invalid marja returns 400.
6. Empty question returns 400.
7. Every response includes the disclaimer.
8. Found answers never include sources generated outside the dataset.

Use the existing test framework. Do not introduce a heavy test framework if unnecessary.

---

## Task 4: Fix Test Path Alignment

Scout found a mismatch between root lib/* test path and actual src/lib/* app path.

Inspect current tests and imports.

Fix by either:
- moving tests to match src/lib/*
- updating imports to src/lib/*
- or adding a clean alias if already configured

Do not duplicate logic across root lib and src/lib. The app should have one source of truth.

---

## Task 5: Clean Docs for Demo

Update stale docs that imply:
- the dataset is missing
- the API is not built
- Compare All is not implemented
- frontend is separate from backend

Docs should accurately say:
- app is demo-capable
- 12 verified demo records exist
- dataset expansion is ongoing
- Compare All is implemented
- citations are backend-generated
- Not Found is an intentional safety behavior

Prioritize:
- README.md
- AGENTS.md only if stale
- context/current-task.md if present
- any demo notes

Do not over-document. Keep it concise and demo-useful.

---

## Task 6: Dataset Expansion Readiness

Do not merge background expansion records unless instructed.

But prepare a safe merge workflow note.

Create or update a short doc section explaining:
- background expansion files are separate
- main data/rulings.json only accepts exact-source verified records
- records marked needs_review must not be used by the app
- after verification, records can be copied into data/rulings.json

If a script already exists to validate the dataset, document how to run it.

---

## Task 7: UI Handling for Exact PDF Wording

The source text may contain awkward transliteration or PDF extraction artifacts.

Do not change exact ruling_text in the dataset just to make it prettier.

Instead, improve display safely:
- render exact source wording in source cards or expanded details
- keep the direct answer short
- if answer text is deterministic from exact source, do not rewrite religious meaning
- if adding a display helper, make clear it does not alter the stored source text

Avoid interpreting rulings.

---

## Required Safety Constraints

Maintain these invariants:

1. No source = Not Found.
2. No invented citations.
3. Backend constructs citations from dataset metadata.
4. Retrieval filters by selected marja before search.
5. Compare All runs separate retrieval per marja.
6. No unsupported agreement claims.
7. Disclaimer appears on every answer.
8. needs_review and deprecated records are excluded.
9. Exact source wording remains preserved in data/rulings.json.

---

## Acceptance Criteria

Stop when all are true:

- npm test passes.
- npm run build passes.
- lint passes.
- Suggested questions match real dataset coverage.
- API tests cover single, compare, invalid, empty, found, and Not Found paths.
- Runtime dataset validation exists.
- Docs accurately reflect current implementation.
- No broad architecture refactor was introduced.
- No unverified expansion records were merged into main data/rulings.json.

---

## Final Output

At the end, report:

- Files changed
- Tests run
- Suggested questions added/updated
- Validation added
- API tests added
- Any remaining risks
- Whether data/rulings.json was modified

Keep the build focused. The demo principle is:

For religious AI, the safest answer is the one you can trace.
