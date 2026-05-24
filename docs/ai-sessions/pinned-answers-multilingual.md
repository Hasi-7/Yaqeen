# Session: Pinned Answers + Multilingual Support

**Date:** 2026-05-24

## Goal

Add hardcoded verbatim answers for 6 specific marja+question pairs (English, Arabic, French, Swahili) that bypass AI retrieval entirely. Make those answers display as AI-generated (not "Source fallback").

---

## Files Changed

- `src/lib/pinned-answers.ts` — **created**. Lookup table of 6 pinned Q&A pairs keyed by `marja_id::normalized_question`. Normalize function lowercases, collapses whitespace, and strips `?`/`؟` for loose matching.
- `src/app/api/ask/route.ts` — **modified**. Added import of `getPinnedAnswer`. In `answerSingle`, checks for a pinned answer first and returns immediately if found, reading `YAQEEN_AI_PROVIDER`/`YAQEEN_AI_MODEL` from env to set `answer_mode: "ai"` with the correct provider and model.

---

## Pinned Pairs

| Marja | Language | Question (normalized) |
|-------|----------|-----------------------|
| Sistani | English | "what breaks wudhu" |
| Sistani | Arabic | "ما الذي ينقض الوضوء" |
| Khamenei | English | "if i planned to reach my residence before noon while traveling but did not arrive in time, is my fast valid" |
| Khamenei | French | "si, en voyageant, j'avais prévu d'arriver à mon domicile avant midi mais que je n'y suis pas arrivé à temps, mon jeûne est-il valable" |
| Shirazi | English | "what are examples of inherently najis things" |
| Shirazi | Swahili | "je, ni mifano gani ya vitu vya najisi vya asili" |

---

## Decisions Made

- Pinned answers live in a separate file (`pinned-answers.ts`) rather than inline in the route, keeping the lookup table easy to extend.
- All 6 pinned answers use `answer_mode: "ai"` so the badge reads "Generated with: AI answer · [provider] · [model]" to match regular answers.
- Provider/model are read from env vars (`YAQEEN_AI_PROVIDER`, `YAQEEN_AI_MODEL`) at request time, not hardcoded, so they stay in sync if the env changes.
- The pinned check only runs in `answerSingle` (single-marja mode). "Compare All" mode falls through to regular retrieval for these questions — acceptable for MVP.

---

## How to Add More Pinned Answers

Open `src/lib/pinned-answers.ts` and add an entry to the `PINNED` object:

```ts
"marja_id::normalized question without punctuation": {
  answer: "Exact verbatim answer text.",
  lang: "en", // BCP-47 language code
},
```

The normalize function strips `?`/`؟` and lowercases, so the key should already be lowercase without punctuation.

---

## Testing Note

**Windows shell limitation:** The Bash tool on Windows corrupts non-ASCII characters (Arabic, accented French, Swahili) when passed inline to `curl -d '...'`. Always write the request body to a `.json` file and use `curl -d @file.json` when testing non-Latin input in this environment. This is a test-environment issue only — browsers send proper UTF-8 and the server matches correctly.

---

## Verification

All 6 pairs confirmed `status: found`, `answer_mode: ai` via curl against the running dev server.
