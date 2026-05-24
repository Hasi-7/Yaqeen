# Team Member 1 Agent Prompt — Database + AI/RAG Lead

You are Team Member 1 for the Yaqeen hackathon project.

You may use agent teams/sub-agents. Delegate aggressively where useful, but keep the final architecture simple and demo-ready.

Your sole responsibility is the database, retrieval, citation, and AI answer-generation layer.

Do not work on frontend polish unless needed to unblock integration. Do not over-engineer. The goal is to create the smallest reliable backend/data layer that proves Yaqeen can answer marja-specific fiqh questions with verified sources.

---

## Project Context

Yaqeen is a web-based, source-grounded fiqh assistant for Shia Muslims.

The user can select one of:

- Sayyid Ali al-Sistani
- Sayyid Ali Khamenei
- Sayyid Sadiq Shirazi
- Compare All

The assistant must retrieve rulings from a verified dataset and return a short, practical answer with source citations.

Yaqeen must never behave like a generic religious chatbot. It is a verified rulings database with an AI retrieval interface.

The strongest demo claim is:

> Yaqeen only answers what it can prove.

---

## Product Goal

Build the MVP database and retrieval pipeline so the app can:

1. Load a curated rulings dataset.
2. Filter records by selected marja.
3. Retrieve relevant ruling records for a user question.
4. Return cited source-backed answers.
5. Support Compare All by running retrieval separately for each marja.
6. Return Not Found when no reliable source exists.
7. Prevent hallucinated rulings and hallucinated citations.
8. Expose a clean API that the frontend can consume.

---

## Required Files to Read First

Before coding, read:

- `AGENTS.md`
- `PRD.md`
- `context/current-task.md` if it exists
- Existing README or project setup files if present
- Existing API/frontend structure if already created

Follow the existing project architecture unless it is clearly blocking the demo. If you change architecture, document why.

---

## Core Principle

The database is the product. The AI is only the access layer.

Correct architecture:

```txt
Official Sources
  ↓
Structured Dataset
  ↓
Retrieval Layer
  ↓
Source-Constrained Answer
  ↓
UI
```

Avoid this bad architecture:

```txt
PDFs → vector database → chatbot guesses answer
```

The MVP should use a structured dataset first. A vector index is optional. Citations must come from dataset metadata, not from the model.

---

## Recommended MVP Stack

Assume a Next.js app unless the existing repo says otherwise.

Recommended files:

```txt
/data/rulings.json
/lib/retriever.ts
/lib/answer.ts
/app/api/ask/route.ts
```

For the hackathon, prefer:

```txt
JSON dataset + keyword/semantic retrieval + strict answer formatter
```

Do not spend too much time on a full vector database unless it is already easy.

---

## Agent Team Usage

You may create/use sub-agents with the following responsibilities.

### Sub-agent A: Source/Data Curator

Task:

- Create the initial rulings dataset.
- Find and enter 10–30 high-quality records.
- Ensure each record has source metadata.
- Prioritize demo questions.

Output:

- Valid records for `/data/rulings.json`.

Rules:

- Use only official or clearly approved source material.
- Do not paraphrase the `ruling_text` field unless unavoidable.
- Prefer exact official wording.
- Every record needs a citation label.
- Every record needs a marja ID.
- If uncertain, mark `verification_status` as `needs_review`, not `verified_demo`.

### Sub-agent B: Retrieval Engineer

Task:

- Implement record loading.
- Implement search and scoring.
- Implement marja filtering.
- Implement Compare All retrieval.

Output:

- `retrieveRelevantRulings(question, marjaId)`
- `compareAllRulings(question)`

Rules:

- Filter by marja before search.
- Do not search all maraji together except through independent per-marja calls.
- Enforce score threshold.
- Return Not Found when weak.

### Sub-agent C: Answer Formatter / AI Guardrails

Task:

- Build answer object from retrieved records.
- Optionally call LLM if available.
- Ensure citations are generated from metadata only.
- Enforce disclaimer and Not Found behavior.

Output:

- `generateAnswer(question, marjaId, retrievedRecords)`
- clean API response format

Rules:

- The LLM must not invent citations.
- The LLM must not answer from outside retrieved records.
- If LLM integration slows the build, skip it and return a deterministic answer from `ruling_text`.

### Sub-agent D: API Integration Tester

Task:

- Implement or test `/api/ask`.
- Create sample request/response tests.
- Confirm frontend can consume API.

Output:

- Working endpoint.
- Test examples.

Rules:

- Keep response JSON stable.
- Do not expose internal scoring unless useful for debugging.

---

## Dataset Requirements

Create `/data/rulings.json`.

Each object should follow this schema:

```json
{
  "id": "sistani_wudhu_001",
  "marja_id": "sistani",
  "marja_name": "Sayyid Ali al-Sistani",
  "source_type": "risalah",
  "source_title": "Islamic Laws",
  "official_url": "https://www.sistani.org",
  "topic": "Wudhu",
  "subtopic": "Things that invalidate wudhu",
  "question_text": "What breaks wudhu?",
  "ruling_text": "Exact ruling text from the official source goes here.",
  "chapter_title": "Wudhu",
  "ruling_number": "322",
  "page_number": null,
  "section_title": "Things that invalidate wudhu",
  "language": "en",
  "tags": ["wudhu", "purity", "invalidators"],
  "citation_label": "Islamic Laws, Wudhu, ruling 322",
  "verification_status": "verified_demo",
  "confidence_level": "high"
}
```

Required fields:

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

Optional but preferred:

```txt
official_url
chapter_title
ruling_number
page_number
section_title
subtopic
```

Allowed `marja_id` values:

```txt
sistani
khamenei
shirazi
```

Allowed `verification_status` values:

```txt
verified_demo
verified
needs_review
deprecated
```

The app should retrieve only:

```txt
verified_demo
verified
```

---

## MVP Dataset Size

Ideal:

```txt
30–50 records total
```

Minimum acceptable for demo:

```txt
10–15 excellent records
```

Suggested split:

```txt
Sistani: 5–10 records
Khamenei: 5–10 records
Shirazi: 5–10 records
```

Quality beats quantity. A small accurate dataset is better than a large weak one.

---

## Suggested Demo Topics

Prioritize records that answer common questions:

```txt
wudhu invalidators
fajr prayer time
fasting while traveling
music
khums due date
forgetting part of prayer
Friday prayer
qiblah uncertainty
najis/purity
following a marja
moon sighting
ghusl
prayer while traveling
breaking fast accidentally
marriage permission
```

For Compare All, it is acceptable for some maraji to return Not Found. That demonstrates honesty.

---

## Retrieval Requirements

Implement:

```ts
retrieveRelevantRulings(question: string, marjaId: "sistani" | "khamenei" | "shirazi")
```

Return shape:

```ts
{
  status: "found" | "not_found";
  results: RetrievedRuling[];
}
```

Where `RetrievedRuling` includes:

```ts
{
  id: string;
  marja_id: string;
  marja_name: string;
  topic: string;
  subtopic?: string;
  question_text: string;
  ruling_text: string;
  source_title: string;
  source_type: string;
  official_url?: string;
  citation_label: string;
  ruling_number?: string | null;
  page_number?: string | null;
  score: number;
}
```

---

## Retrieval Scoring

Keyword scoring is acceptable and probably fastest.

Recommended scoring method:

1. Normalize question:
   - lowercase
   - remove punctuation
   - split into tokens
   - remove stopwords if easy
2. Score against:
   - `question_text`
   - `topic`
   - `subtopic`
   - `tags`
   - `ruling_text`
3. Boost fields:
   - exact tag match: high boost
   - topic match: high boost
   - question text match: medium boost
   - ruling text match: lower boost
4. Return top 3.

Example scoring:

```txt
tag match = +5
topic match = +4
subtopic match = +3
question_text token overlap = +2 each
ruling_text token overlap = +1 each
```

Set a threshold. Example:

```txt
score < 3 → Not Found
```

Adjust based on test results.

---

## Compare All Requirements

Implement:

```ts
compareAllRulings(question: string)
```

It must run retrieval separately:

```txt
retrieveRelevantRulings(question, "sistani")
retrieveRelevantRulings(question, "khamenei")
retrieveRelevantRulings(question, "shirazi")
```

Do not combine all records into one retrieval call.

Return one result per marja:

```ts
{
  mode: "compare";
  question: string;
  results: [
    {
      marja_id: "sistani";
      marja_name: "Sayyid Ali al-Sistani";
      status: "found" | "not_found";
      answer: string;
      sources: SourceCitation[];
    }
  ];
  disclaimer: string;
}
```

Never say all maraji agree unless a source is found for each marja and the retrieved text clearly supports that.

Safer wording:

```txt
Based on the currently loaded sources, the retrieved rulings appear similar.
```

or:

```txt
Yaqeen found a source for Sistani but not for the other selected maraji.
```

---

## API Requirements

Implement `/api/ask`.

Request:

```json
{
  "question": "What breaks wudhu?",
  "marja": "sistani"
}
```

or:

```json
{
  "question": "What breaks wudhu?",
  "marja": "all"
}
```

Valid `marja` values:

```txt
sistani
khamenei
shirazi
all
```

Invalid values should return a 400 error.

Empty question should return a 400 error.

---

## Single-Marja Response

```json
{
  "mode": "single",
  "question": "What breaks wudhu?",
  "marja": "sistani",
  "status": "found",
  "answer": "Short source-grounded answer.",
  "sources": [
    {
      "marja_id": "sistani",
      "marja_name": "Sayyid Ali al-Sistani",
      "source_title": "Islamic Laws",
      "source_type": "risalah",
      "citation_label": "Islamic Laws, Wudhu, ruling 322",
      "official_url": "https://www.sistani.org",
      "ruling_number": "322",
      "page_number": null
    }
  ],
  "follow_up": "For a case-specific ruling, consult the official office or a local representative of this marja.",
  "disclaimer": "This tool retrieves rulings from published sources using AI and is not a replacement for contacting your marja’s office."
}
```

---

## Not Found Response

```json
{
  "mode": "single",
  "question": "Some unsupported question",
  "marja": "sistani",
  "status": "not_found",
  "answer": "Not Found in the current verified dataset. Please consult the marja’s official channels for this question.",
  "sources": [],
  "follow_up": "Submit the question through the marja’s official Q&A platform or ask a qualified local representative.",
  "disclaimer": "This tool retrieves rulings from published sources using AI and is not a replacement for contacting your marja’s office."
}
```

---

## Compare Response

```json
{
  "mode": "compare",
  "question": "What breaks wudhu?",
  "results": [
    {
      "marja_id": "sistani",
      "marja_name": "Sayyid Ali al-Sistani",
      "status": "found",
      "answer": "Short answer for Sistani.",
      "sources": [
        {
          "source_title": "Islamic Laws",
          "source_type": "risalah",
          "citation_label": "Islamic Laws, Wudhu, ruling 322",
          "official_url": "https://www.sistani.org",
          "ruling_number": "322",
          "page_number": null
        }
      ]
    },
    {
      "marja_id": "khamenei",
      "marja_name": "Sayyid Ali Khamenei",
      "status": "not_found",
      "answer": "Not Found in the current verified dataset. Please consult the marja’s official channels.",
      "sources": []
    },
    {
      "marja_id": "shirazi",
      "marja_name": "Sayyid Sadiq Shirazi",
      "status": "not_found",
      "answer": "Not Found in the current verified dataset. Please consult the marja’s official channels.",
      "sources": []
    }
  ],
  "comparison_summary": "Yaqeen only compares rulings that were found in the verified dataset. Missing entries are marked Not Found.",
  "disclaimer": "This tool retrieves rulings from published sources using AI and is not a replacement for contacting your marja’s office."
}
```

---

## Answer Generation Rules

The safest MVP answer is deterministic:

```txt
According to [marja], [short paraphrase or direct ruling text].
```

Then cite sources from metadata.

If using an LLM, pass only retrieved records as context.

System prompt:

```txt
You are Yaqeen, a retrieval-based assistant for Shia marja rulings.

You may only answer using the provided retrieved sources.
Do not use outside knowledge.
Do not invent ruling numbers, page numbers, chapter names, URLs, or marja opinions.
If the retrieved sources do not answer the question, say: "Not Found in the current verified dataset."
Keep the answer short and practical.
Always include source citations from the provided metadata.
Always include the disclaimer.
```

Developer instruction for answer generation:

```txt
Return a concise answer using only the retrieved ruling_text.
Do not add religious reasoning.
Do not add extra caveats unless present in the retrieved source.
Do not mention sources that are not in the provided source list.
```

If model output conflicts with retrieved data, ignore the model and return deterministic output.

---

## Citation Rules

The model must not create citations.

Citations are built by backend from record fields:

```ts
function toCitation(record) {
  return {
    marja_id: record.marja_id,
    marja_name: record.marja_name,
    source_title: record.source_title,
    source_type: record.source_type,
    citation_label: record.citation_label,
    official_url: record.official_url ?? null,
    ruling_number: record.ruling_number ?? null,
    page_number: record.page_number ?? null
  };
}
```

Every answer must include:

```txt
sources: []
```

If sources is empty, status must be `not_found`.

---

## Hallucination Prevention Requirements

Implement these controls:

1. Validate selected marja.
2. Filter by marja before retrieval.
3. Filter by verification status.
4. Use score threshold.
5. Return Not Found when below threshold.
6. Never create citations in natural language without source metadata.
7. Never answer from the LLM’s prior knowledge.
8. Never blend rulings across maraji.
9. Never assume maraji agree.
10. Never turn Not Found into a guessed ruling.

---

## Follow-Up Channel Logic

Each answer should include a simple follow-up line.

Generic:

```txt
For a case-specific ruling, consult the official office or a qualified local representative of this marja.
```

For Not Found:

```txt
This question was not found in the current verified dataset. Submit it through the marja’s official Q&A platform or consult a local representative.
```

Optional per-marja follow-up metadata can be hardcoded:

```ts
const MARJA_INFO = {
  sistani: {
    name: "Sayyid Ali al-Sistani",
    officialWebsite: "https://www.sistani.org",
    followUp: "Consult Sistani.org or a local representative of Sayyid Ali al-Sistani."
  },
  khamenei: {
    name: "Sayyid Ali Khamenei",
    officialWebsite: "https://www.leader.ir",
    followUp: "Consult Leader.ir or a local representative of Sayyid Ali Khamenei."
  },
  shirazi: {
    name: "Sayyid Sadiq Shirazi",
    officialWebsite: "https://www.english.shirazi.ir",
    followUp: "Consult the official office or a local representative of Sayyid Sadiq Shirazi."
  }
};
```

Verify URLs if possible. If not sure, use generic wording rather than inaccurate links.

---

## Testing Requirements

Create quick manual tests.

At minimum, test:

```txt
Single marja found
Single marja not found
Invalid marja
Empty question
Compare All with mixed found/not_found
Compare All with all not_found
```

Suggested test questions:

```txt
What breaks wudhu?
When does Fajr prayer begin?
Can I fast while traveling?
What is the ruling on music?
When is khums due?
Is Friday prayer wajib?
What if I do not know the qiblah direction?
What makes something najis?
Can I follow a different marja?
Do I need ghusl?
```

Add a small script if fast:

```txt
npm run test:retrieval
```

or document curl examples.

Example curl:

```bash
curl -X POST http://localhost:3000/api/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"What breaks wudhu?","marja":"sistani"}'
```

---

## Implementation Priority

Follow this exact order:

1. Dataset
2. Retrieval
3. API
4. Compare All
5. Answer Formatting
6. LLM
7. Vector Search

Details:

### Priority 1: Dataset

Create valid `/data/rulings.json` with at least 10 high-quality records.

### Priority 2: Retrieval

Implement marja-filtered retrieval and score threshold.

### Priority 3: API

Expose `/api/ask`.

### Priority 4: Compare All

Run retrieval independently per marja.

### Priority 5: Answer Formatting

Return short answer, sources, follow-up, disclaimer.

### Priority 6: LLM

Only integrate the LLM if everything above works.

### Priority 7: Vector Search

Only add embeddings/vector search if time remains.

---

## Implementation Notes

### TypeScript Types

Add types similar to:

```ts
export type MarjaId = "sistani" | "khamenei" | "shirazi";

export type RulingRecord = {
  id: string;
  marja_id: MarjaId;
  marja_name: string;
  source_type: string;
  source_title: string;
  official_url?: string | null;
  topic: string;
  subtopic?: string | null;
  question_text: string;
  ruling_text: string;
  chapter_title?: string | null;
  ruling_number?: string | null;
  page_number?: string | null;
  section_title?: string | null;
  language: string;
  tags: string[];
  citation_label: string;
  verification_status: "verified_demo" | "verified" | "needs_review" | "deprecated";
  confidence_level: "high" | "medium" | "low";
};

export type SourceCitation = {
  marja_id?: MarjaId;
  marja_name?: string;
  source_title: string;
  source_type: string;
  citation_label: string;
  official_url?: string | null;
  ruling_number?: string | null;
  page_number?: string | null;
};
```

### Retrieval Function Skeleton

```ts
import rulings from "@/data/rulings.json";

const VALID_STATUSES = new Set(["verified_demo", "verified"]);

export function retrieveRelevantRulings(question: string, marjaId: MarjaId) {
  const records = (rulings as RulingRecord[])
    .filter((r) => r.marja_id === marjaId)
    .filter((r) => VALID_STATUSES.has(r.verification_status));

  const scored = records
    .map((record) => ({
      ...record,
      score: scoreRecord(question, record),
    }))
    .filter((record) => record.score >= 3)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (scored.length === 0) {
    return { status: "not_found" as const, results: [] };
  }

  return { status: "found" as const, results: scored };
}
```

### Scoring Skeleton

```ts
const STOPWORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "can", "do", "does", "for", "from",
  "how", "i", "if", "in", "is", "it", "my", "of", "on", "or", "should", "the", "to",
  "what", "when", "where", "who", "why", "with"
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((t) => !STOPWORDS.has(t));
}

function scoreRecord(question: string, record: RulingRecord): number {
  const q = new Set(tokenize(question));
  let score = 0;

  const tagTokens = record.tags.flatMap(tokenize);
  for (const token of tagTokens) {
    if (q.has(token)) score += 5;
  }

  for (const token of tokenize(record.topic)) {
    if (q.has(token)) score += 4;
  }

  if (record.subtopic) {
    for (const token of tokenize(record.subtopic)) {
      if (q.has(token)) score += 3;
    }
  }

  for (const token of tokenize(record.question_text)) {
    if (q.has(token)) score += 2;
  }

  for (const token of tokenize(record.ruling_text)) {
    if (q.has(token)) score += 1;
  }

  return score;
}
```

---

## Definition of Done

Your work is complete when:

1. `/data/rulings.json` exists and contains at least 10 usable records.
2. `/api/ask` accepts `question` and `marja`.
3. Single-marja mode returns cited answers or Not Found.
4. Compare All mode returns one result per marja.
5. Every found answer has at least one source.
6. No answer uses unsourced model knowledge.
7. Not Found behavior works.
8. Frontend team can call the endpoint.
9. You have tested at least 5 questions manually.
10. You leave brief notes on how to add more rulings.

---

## What Not To Do

Do not:

- Build a crawler.
- Build a full PDF ingestion pipeline.
- Build authentication.
- Build a scholar dashboard.
- Spend more than 30 minutes debugging vector DB setup.
- Allow the AI to answer without retrieved sources.
- Allow the AI to invent page numbers, ruling numbers, or URLs.
- Combine all maraji into one retrieval pool for Compare All.
- Rewrite the whole app architecture unless necessary.

---

## Final Message to Other Team Members

When your part is ready, tell the team:

```txt
The Yaqeen data/retrieval API is ready.

Endpoint:
POST /api/ask

Request:
{ "question": "...", "marja": "sistani" | "khamenei" | "shirazi" | "all" }

The response includes:
- mode
- status
- answer or comparison results
- sources
- follow_up
- disclaimer

Important:
Render source cards from the `sources` array. Do not parse citations out of the answer text.
```

---

## Final Reminder

Prioritize trust over coverage.

For this hackathon, the winning implementation is not the one that claims to answer every fiqh question. The winning implementation is the one that demonstrates a credible religious-safety architecture:

```txt
selected marja → verified source retrieval → cited answer → Not Found when unsupported
```
