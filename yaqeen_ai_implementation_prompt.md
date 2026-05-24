# Yaqeen AI Implementation Agent Prompt

You are continuing the Yaqeen hackathon MVP.

Current state:
- Frontend + database/API are merged and pushed to main.
- App runs at http://localhost:3000.
- Current commit: 87791da Merge frontend with data API.
- data/rulings.json has 12 verified demo rulings.
- POST /api/ask supports marja-specific and Compare All retrieval.
- Source cards, comparison output, disclaimer, and Not Found handling exist.
- Retrieval is currently deterministic keyword/domain based.
- Answer generation currently falls back to source records directly.
- Nothing meaningful has started for actual AI/LLM answer generation.

Your task is to implement the actual AI/RAG layer while preserving the existing safety behavior.

Do not break the working demo.

---

## Required Reading First

Read:

- AGENTS.md
- PRD.md
- data/rulings.json
- reports/rulings_verification_report.md
- src/lib/*
- src/app/api/ask/*
- existing tests

Understand the current request/response shape before changing anything.

---

## Product Principle

Yaqeen is not a generic religious chatbot.

Yaqeen is:

```txt
verified source records → retrieval → source-constrained AI answer → backend-generated citations
```

The AI may only produce a short user-facing answer from retrieved records.

The AI must never:
- answer from outside knowledge
- invent citations
- invent marja opinions
- invent ruling numbers
- invent page numbers
- blend maraji
- claim agreement without source support

The deterministic answer fallback must remain available.

---

# Primary Goal

Implement a real AI answer-generation layer for Yaqeen.

The MVP should support:

1. Retrieval first.
2. LLM answer generation second.
3. Strict source-only prompt.
4. Deterministic fallback if AI is unavailable.
5. Backend-generated citations from dataset metadata.
6. Compare All with separate AI generation per marja.
7. Tests with a mocked AI provider.

---

# Architecture Requirement

Add an AI layer without rewriting the app.

Suggested files:

```txt
src/lib/ai/types.ts
src/lib/ai/provider.ts
src/lib/ai/prompt.ts
src/lib/ai/generate-answer.ts
src/lib/ai/mock-provider.ts
```

If the repo has a different structure, adapt to the existing structure.

Do not duplicate existing retrieval logic.

The AI layer should sit after retrieval:

```txt
POST /api/ask
  → validate request
  → retrieve records
  → if Not Found, return existing Not Found response
  → if Found, pass retrieved records to AI answer generator
  → if AI succeeds, return AI answer + backend citations
  → if AI fails, return deterministic fallback answer + backend citations
```

---

# Environment Variables

Use environment variables.

Add support for:

```txt
YAQEEN_AI_ENABLED=true
YAQEEN_AI_PROVIDER=openai | ollama | mock | none
YAQEEN_AI_MODEL=<model-name>
OPENAI_API_KEY=<key>
OLLAMA_BASE_URL=http://localhost:11434
```

Rules:
- Do not hardcode API keys.
- Do not require AI to run the app.
- If env vars are missing, fall back to deterministic answer generation.
- Keep mock provider available for tests.

---

# Provider Interface

Create a clean interface similar to:

```ts
export type AIMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type AICompletionInput = {
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
};

export type AICompletionResult = {
  text: string;
  provider: string;
  model: string;
};

export interface AIProvider {
  complete(input: AICompletionInput): Promise<AICompletionResult>;
}
```

Then implement:

```txt
getAIProvider()
```

It should return:

- OpenAI provider if `YAQEEN_AI_PROVIDER=openai` and `OPENAI_API_KEY` exists.
- Ollama/local provider if `YAQEEN_AI_PROVIDER=ollama`.
- Mock provider for tests.
- Null/none provider if disabled.

---

# OpenAI Provider

Add a simple OpenAI provider only if dependency/setup is reasonable.

Use the existing project package style.

If the OpenAI SDK is already installed, use it.

If not installed, either:
- add the official OpenAI package if acceptable, or
- use `fetch` directly against the Responses API or Chat Completions API.

Keep it simple.

Requirements:
- server-side only
- no API key exposed to frontend
- low temperature
- short max output
- timeout protection if easy

Recommended generation settings:

```txt
temperature: 0
max output: 250-400 tokens
```

Do not use AI for retrieval yet unless there is time.

---

# Ollama / Local Provider

Add this only if quick.

Support:

```txt
YAQEEN_AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
YAQEEN_AI_MODEL=gemma3:4b or similar
```

Use a simple HTTP call to Ollama if available.

If this takes more than 20 minutes, skip or stub it.

The app must work with OpenAI, mock, or no AI.

---

# Strict System Prompt

Create the prompt in:

```txt
src/lib/ai/prompt.ts
```

Use this system prompt:

```txt
You are Yaqeen, a retrieval-based assistant for Shia marja rulings.

You may only answer using the retrieved source records provided in the prompt.
Do not use outside knowledge.
Do not invent rulings, ruling numbers, page numbers, chapter names, URLs, source titles, or marja opinions.
Do not blend rulings across maraji.
Do not claim that maraji agree unless the provided sources explicitly support that.
If the retrieved records do not directly answer the user's question, say exactly: "Not Found in the current verified dataset."
Keep the answer short, practical, and plain.
Use careful wording.
Do not add religious reasoning that is not in the source.
Do not add new conditions that are not in the source.
Do not remove important conditions from the source.
The backend will attach citations separately. Do not create your own citation list.
```

---

# User Prompt Format

For single-marja mode, pass the AI a compact source packet.

Example:

```txt
User question:
"What breaks wudhu?"

Selected marja:
Sayyid Ali al-Sistani

Retrieved source records:
[1]
Record ID: sistani_wudhu_001
Marja: Sayyid Ali al-Sistani
Source: Islamic Laws
Citation label: Islamic Laws, Wudhu, ruling 322
Ruling text:
"""
EXACT SOURCE TEXT HERE
"""

Task:
Write a short answer using only the retrieved source records.
Do not include citations in the answer text.
Do not mention sources unless necessary.
If the source does not answer the question, respond exactly:
"Not Found in the current verified dataset."
```

For Compare All, do not send all maraji together.

Generate answers separately per marja:

```txt
generateAnswer(question, sistaniRecords)
generateAnswer(question, khameneiRecords)
generateAnswer(question, shiraziRecords)
```

Then compose the compare response from the three separate outputs.

---

# Output Validation

The AI answer should be treated as untrusted until checked.

Implement simple validation:

1. If retrieved records are empty, do not call AI.
2. If AI output is empty, use deterministic fallback.
3. If AI output contains suspicious fake citation patterns, strip or fallback.
4. If AI output says Not Found despite strong retrieved records, allow fallback answer.
5. If AI throws, timeout, or returns invalid data, fallback.

Suspicious citation patterns include:
- “ruling #” not present in metadata
- made-up URLs
- “page” numbers not present in metadata
- source titles not in metadata

Simplest safe rule:
The answer text should not contain a “Sources:” section. Sources are rendered separately by backend/UI.

---

# Deterministic Fallback

Keep the existing fallback.

If AI is disabled or fails, return a short deterministic answer using the top retrieved record.

Example:

```txt
Based on the retrieved source for [marja], the ruling states: “[exact or lightly displayed ruling_text]”
```

Do not remove this fallback.

The demo must not depend on external AI being available.

---

# API Response Changes

Preserve the current response shape as much as possible.

Add optional metadata:

```json
{
  "answer_mode": "ai" | "deterministic_fallback" | "not_found",
  "ai_provider": "openai" | "ollama" | "mock" | "none",
  "ai_model": "model-name-or-null"
}
```

Do not break frontend rendering.

If adding fields would break tests, make them optional.

---

# Compare All AI Logic

Current Compare All retrieval is correct because it retrieves separately per marja.

Keep that.

For each marja:

```txt
if retrieval status is not_found:
  answer = Not Found
  sources = []
else:
  answer = AI-generated source-constrained answer
  sources = backend-generated citations
```

Then return comparison summary.

For the MVP, comparison_summary can remain deterministic and safe:

```txt
"Yaqeen only compares rulings that were found in the verified dataset. Missing entries are marked Not Found."
```

Do not ask the AI to compare all maraji together unless there is a separate strict comparison prompt using only already generated per-marja answers.

---

# Optional Streaming

The PRD says token streaming is desirable if feasible.

Implement streaming only if the current frontend/API structure makes it easy.

Priority order:
1. Non-streaming AI answer works.
2. Tests pass.
3. Demo stable.
4. Streaming.

If streaming is easy, add:

```txt
POST /api/ask/stream
```

or adapt existing endpoint without breaking current API.

If streaming is not implemented, document:

```txt
AI answer generation is implemented; token streaming remains future work.
```

Do not risk the demo for streaming.

---

# Tests Required

Add tests with mock AI provider.

Test cases:

## AI provider tests

1. Mock provider returns answer.
2. Missing provider falls back to deterministic answer.
3. Provider error falls back to deterministic answer.
4. AI output does not affect backend-generated citations.

## API tests

1. Found single-marja answer can return `answer_mode: "ai"` with mock provider.
2. AI disabled returns `answer_mode: "deterministic_fallback"`.
3. Not Found does not call AI.
4. Compare All calls answer generation separately per found marja.
5. Invalid marja still returns 400.
6. Empty question still returns 400.
7. Every response includes disclaimer.
8. Sources still come from dataset metadata.

Do not rely on real OpenAI calls in tests.

---

# Safety Invariants

Do not break these:

1. Retrieval happens before AI.
2. Selected marja filters retrieval before search.
3. Compare All retrieves separately per marja.
4. Not Found remains valid.
5. Sources come from backend metadata.
6. AI never creates citations.
7. AI never sees unverified records.
8. `needs_review` and `deprecated` are excluded.
9. App works without AI env vars.
10. Build/test/lint pass.

---

# Implementation Order

Follow this order exactly:

## Step 1: Inspect current answer path

Find where `/api/ask` currently creates the answer.

Identify:
- retrieval function
- response formatter
- source card data structure
- compare all formatter
- existing tests

Do not modify yet.

## Step 2: Add AI types and prompt

Create:
- `src/lib/ai/types.ts`
- `src/lib/ai/prompt.ts`

No behavior change yet.

## Step 3: Add mock provider

Create:
- `src/lib/ai/mock-provider.ts`
- `src/lib/ai/provider.ts`

Make tests use mock provider.

## Step 4: Add generateAnswer function

Create:
- `src/lib/ai/generate-answer.ts`

It should accept:

```ts
{
  question: string;
  marjaId: string;
  marjaName: string;
  retrievedRecords: RetrievedRuling[];
}
```

It should return:

```ts
{
  answer: string;
  answer_mode: "ai" | "deterministic_fallback" | "not_found";
  ai_provider: string | null;
  ai_model: string | null;
}
```

## Step 5: Wire into /api/ask

Replace direct deterministic answer generation with:

```txt
retrieval → generateAnswer → response formatter
```

But keep deterministic fallback inside `generateAnswer`.

## Step 6: Add OpenAI provider

Implement OpenAI provider if feasible.

If dependency installation is needed, keep it minimal.

Do not expose API key.

## Step 7: Add tests

Mock provider only.

Run:
- npm test
- npm run build
- npm run lint

Fix failures.

## Step 8: Update docs

Update README or implementation notes:

```txt
AI layer:
- Retrieval-first
- Source-constrained prompt
- Backend citations
- Deterministic fallback
- Optional OpenAI/Ollama provider through env vars
```

---

# Acceptance Criteria

You are done when:

1. Actual AI answer generation exists behind the API.
2. AI is source-constrained by prompt.
3. AI is only called after retrieval.
4. Not Found does not call AI.
5. Citations still come from backend metadata.
6. App works with AI disabled.
7. App can use mock provider in tests.
8. App can use OpenAI or Ollama if env vars are configured.
9. Compare All keeps separate per-marja generation.
10. Tests pass.
11. Build passes.
12. Lint passes.
13. Docs mention how to enable AI.

---

# Final Report

At the end, report:

```txt
AI implementation complete.

Added:
- files changed
- provider(s) implemented
- env vars added
- tests added

Behavior:
- AI enabled path:
- fallback path:
- Not Found path:
- Compare All path:

Commands run:
- npm test
- npm run build
- npm run lint

Remaining:
- streaming yes/no
- local model yes/no
- semantic embeddings yes/no
```

---

# Final Reminder

The goal is not “make the AI sound smart.”

The goal is:

```txt
retrieved verified source → constrained AI answer → backend citation → safe fallback
```

For religious AI, the model must be weaker than the source.
