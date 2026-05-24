# PRD: Yaqeen MVP

## 1. Product Name

**Yaqeen**

## 2. Product Summary

Yaqeen is a web-based, source-grounded AI assistant that helps Shia Muslims retrieve practical fiqh rulings from the marja they follow. For the hackathon MVP, Yaqeen will support three maraji:

- Sayyid Ali al-Sistani
- Sayyid Ali Khamenei
- Sayyid Sadiq Shirazi

Users can select one marja or choose **Compare All** to see side-by-side rulings where verified sources exist.

Yaqeen is not a general religious chatbot. It is a structured rulings database with a retrieval-based AI interface. The assistant may only answer from verified source records. If the system cannot find a relevant verified source, it must return **Not Found** and direct the user to official channels.

## 3. MVP Goal

Build a working web app prototype that demonstrates:

1. Marja-specific ruling retrieval.
2. Source-backed answers.
3. Side-by-side comparison across three maraji.
4. Refusal when no verified source exists.
5. A credible open dataset architecture for future community use.

The MVP should be optimized for a hackathon demo, not full production completeness.

## 4. Problem Statement

Finding rulings from the marja a person follows is fragmented and difficult. Users often need to search through separate websites, PDFs, books, or Q&A pages. Existing AI tools can produce fluent answers, but may hallucinate, blend opinions, or fail to cite exact sources.

For religious rulings, this is high-risk. A user needs to know:

- Which marja the ruling came from.
- Where the ruling was published.
- Whether the answer is directly supported by an official source.
- Whether other maraji differ on the issue.
- What to do when no published answer is found.

Yaqeen solves this by grounding every answer in a structured dataset of official rulings and citations.

## 5. Target Users

### Primary Users

Shia Muslims who follow a marja and want a quick, source-backed ruling.

### Secondary Users

People comparing rulings across maraji, including students, youth, community organizers, educators, and researchers.

### Tertiary Users

Developers and community institutions who may use the open dataset or technical architecture to build future Shia tools.

## 6. Core Value Proposition

**Yaqeen gives users confidence, not just answers.**

The system retrieves official rulings, cites exact sources, compares maraji when requested, and refuses to answer when no verified source exists.

## 7. MVP Scope

### In Scope

The hackathon MVP will include:

- Web app interface.
- Marja selector:
  - Sistani
  - Khamenei
  - Sadiq Shirazi
  - Compare All
- Chat-style question input.
- Token-streamed answer output, if feasible within the build window.
- Short, plain-language answer.
- Source citations for every answer.
- Side-by-side comparison table for Compare All.
- Not Found state when no verified source exists.
- Disclaimer on every response.
- Suggested official follow-up path.
- Curated MVP dataset of 30-50 verified records.
- Retrieval-based architecture using structured records and semantic search.

### Out of Scope

The MVP will not include:

- User accounts.
- Full multilingual support.
- Full ingestion of all risalah books.
- Scholar dashboard.
- Mobile app.
- Voice input/output.
- Payment system.
- Automated scraping at scale.
- Full local model deployment unless already available.
- Real-time official office integration.
- Legal/religious certification.

## 8. Supported Sources for MVP

The MVP dataset will use only official or directly published sources from the maraji or their offices.

Supported source types:

- Islamic Laws / risalah books published by the marja or official office.
- Official Q&A pages.
- PDFs published by official offices.

The MVP should avoid secondary sources unless clearly labeled and excluded from verified answer generation.

## 9. MVP Dataset Strategy

### Dataset Principle

The database is the product. The AI is only the access layer.

The source of truth should not be the vector database. The source of truth should be a structured rulings dataset. The vector index only helps retrieve the right records.

### MVP Dataset Size

Target: **30-50 verified records**.

Suggested split:

- 15-20 Sistani records
- 10-15 Khamenei records
- 10-15 Sadiq Shirazi records

If time is limited, a smaller dataset with accurate citations is better than a larger dataset with weak verification.

### Recommended MVP Topics

Prioritize common fiqh questions likely to appear in demos:

- Wudhu
- Ghusl
- Prayer timing
- Qiblah uncertainty
- Fasting while traveling
- Breaking the fast accidentally
- Khums
- Music
- Hijab
- Najis/purity
- Marriage
- Following a marja
- Friday prayer
- Congregational prayer
- Moon sighting

## 10. MVP Data Schema

For the hackathon, use a single JSON file such as:

```text
/data/rulings.json
```

Each record should follow this structure:

```json
{
  "id": "sistani_prayer_001",
  "marja_id": "sistani",
  "marja_name": "Sayyid Ali al-Sistani",
  "source_type": "official_qa",
  "source_title": "Sistani.org Q&A",
  "official_url": "https://www.sistani.org/english/qa/",
  "topic": "Prayer",
  "subtopic": "Prayer Times",
  "question_text": "When does the time for Fajr prayer begin?",
  "ruling_text": "Exact official ruling text goes here.",
  "chapter_title": "Prayer",
  "section_title": "Prayer Times",
  "ruling_number": null,
  "page_number": null,
  "language": "en",
  "tags": ["prayer", "fajr", "time"],
  "citation_label": "Sistani.org Q&A > Prayer > Prayer Times",
  "verification_status": "verified_demo",
  "confidence_level": "high"
}
```

### Required Fields

| Field | Required | Purpose |
|---|---:|---|
| `id` | Yes | Unique record identifier |
| `marja_id` | Yes | Prevents cross-marja contamination |
| `marja_name` | Yes | Display name in UI |
| `source_type` | Yes | Book, Q&A, PDF, etc. |
| `source_title` | Yes | Name of source |
| `official_url` | Preferred | Link to official source when available |
| `topic` | Yes | Main classification |
| `ruling_text` | Yes | Ground-truth ruling text |
| `citation_label` | Yes | Human-readable citation |
| `verification_status` | Yes | Controls whether record can be used |
| `confidence_level` | Yes | Helps determine answer eligibility |

## 11. Verification Status

Use the following statuses:

| Status | Meaning | Used in MVP Answers? |
|---|---|---:|
| `draft` | Entered but not checked | No |
| `reviewed` | Checked by team | Optional |
| `verified_demo` | Manually checked against official source for hackathon | Yes |
| `verified` | Checked against official source for production | Yes |
| `scholar_verified` | Checked by qualified reviewer | Yes |
| `needs_review` | Unclear or incomplete | No |
| `deprecated` | Old or replaced source | No |

For the MVP, retrieval should only use:

- `verified_demo`
- `verified`
- `scholar_verified`

## 12. Technical Architecture

### Recommended Hackathon Stack

Frontend:

- Next.js
- Tailwind CSS

Backend:

- Next.js API routes

Data:

- JSON rulings dataset
- Local embeddings file or lightweight vector store

Retrieval:

- Chroma, FAISS, or simple in-memory vector search
- Keyword fallback if semantic search is not ready

LLM:

- Local model if already running reliably
- Hosted model fallback if local setup is too slow

Preferred local model direction:

- Gemma-style small local model for future privacy-first deployment

### Production Direction

For the long-term product:

- Postgres + pgvector
- Structured canonical database
- Public OpenDataset repo
- API access layer
- Optional local/private model mode

## 13. Retrieval Design

### Single Marja Flow

When the user selects one marja:

1. Receive user question.
2. Filter records by selected `marja_id`.
3. Filter records by approved `verification_status`.
4. Search only within that marja's records.
5. Retrieve top 3-5 records.
6. If retrieval score is below threshold, return Not Found.
7. If retrieval is strong, pass retrieved records to answer generator.
8. Generate short answer using only retrieved records.
9. Display citations from database metadata.

### Compare All Flow

When the user selects Compare All:

1. Receive user question.
2. Run separate retrieval for Sistani.
3. Run separate retrieval for Khamenei.
4. Run separate retrieval for Sadiq Shirazi.
5. Generate one answer per marja using only that marja's retrieved sources.
6. Mark a marja as Not Found if no source is retrieved.
7. Display side-by-side comparison.
8. Summarize differences only where the sources support a comparison.

Important rule:

**Do not retrieve all maraji together and ask the model to compare. Retrieval must happen separately per marja.**

## 14. Hallucination Prevention Requirements

Yaqeen must reduce hallucinations through architecture, not only prompting.

Required controls:

1. **Marja filter before retrieval**  
   The selected marja determines the search space.

2. **Verification filter before retrieval**  
   Draft or unreviewed data must not be used in answers.

3. **Similarity threshold**  
   Weak matches should return Not Found.

4. **Source-only generation**  
   The model may only use retrieved context.

5. **Backend-generated citations**  
   The model must not invent ruling numbers, page numbers, URLs, or source titles.

6. **Not Found as valid answer**  
   Refusal is a successful safety behavior.

7. **No blending between maraji**  
   Rulings must remain separate unless explicitly shown in Compare All mode.

8. **No unsupported agreement claims**  
   The system cannot say maraji agree unless verified sources support that.

## 15. System Prompt

Use a strict prompt similar to the following:

```text
You are Yaqeen, a retrieval-based assistant for Shia marja rulings.

You may only answer using the retrieved source records provided to you.
Do not use outside knowledge.
Do not invent rulings, ruling numbers, page numbers, chapter names, URLs, or marja opinions.
If the retrieved sources do not directly answer the user's question, say: "Not Found in the current verified dataset."
Keep the answer short, practical, and plain.
Always include source citations from the provided citation metadata.
Always include the disclaimer.
When appropriate, suggest consulting the marja's official Q&A platform, official office, or local representative.
```

## 16. Response Format

### Single Marja Response

The answer should include:

1. Direct answer.
2. Source list.
3. Follow-up path.
4. Disclaimer.

Example:

```text
Answer:
According to Sayyid Ali al-Sistani, [short answer based only on retrieved source].

Sources:
- Islamic Laws, Prayer, ruling 742
- Sistani.org Q&A > Prayer > Prayer Times

Need more detail?
Consult the official Q&A platform or a local representative of Sayyid al-Sistani.

Disclaimer:
This tool retrieves rulings from published sources using AI and is not a replacement for contacting your marja's office.
```

### Compare All Response

The answer should include:

| Marja | Answer | Source |
|---|---|---|
| Sistani | Short answer or Not Found | Citation or Not Found |
| Khamenei | Short answer or Not Found | Citation or Not Found |
| Sadiq Shirazi | Short answer or Not Found | Citation or Not Found |

Then include:

- Key difference, if supported.
- Follow-up path.
- Disclaimer.

## 17. UI Requirements

### Main Page

The MVP web app should include:

- Product name: Yaqeen
- Short tagline: “Source-backed rulings from your marja.”
- Marja selector
- Question input box
- Submit button
- Suggested questions
- Response area
- Source cards
- Disclaimer text

### Marja Selector

Options:

- Sayyid Ali al-Sistani
- Sayyid Ali Khamenei
- Sayyid Sadiq Shirazi
- Compare All

### Suggested Questions

Show 5-8 example questions that are guaranteed to work with the MVP dataset.

Examples:

- When does Fajr time begin?
- What breaks wudhu?
- What is the ruling on fasting while traveling?
- Is khums required on savings?
- What should I do if I am unsure about qiblah?

## 18. API Contract

### Endpoint

```text
POST /api/ask
```

### Request

```json
{
  "question": "What breaks wudhu?",
  "marja_id": "sistani"
}
```

For Compare All:

```json
{
  "question": "What breaks wudhu?",
  "marja_id": "all"
}
```

### Response: Found

```json
{
  "status": "found",
  "mode": "single",
  "answer": "Short answer text.",
  "sources": [
    {
      "marja_name": "Sayyid Ali al-Sistani",
      "source_title": "Islamic Laws",
      "chapter_title": "Wudhu",
      "ruling_number": "123",
      "page_number": null,
      "url": "https://...",
      "citation_label": "Islamic Laws, Wudhu, ruling 123"
    }
  ],
  "disclaimer": "This tool retrieves rulings from published sources using AI and is not a replacement for contacting your marja's office."
}
```

### Response: Not Found

```json
{
  "status": "not_found",
  "mode": "single",
  "answer": "Not Found in the current verified dataset. Please consult the marja's official Q&A platform, official office, or a local representative.",
  "sources": [],
  "disclaimer": "This tool retrieves rulings from published sources using AI and is not a replacement for contacting your marja's office."
}
```

### Response: Compare All

```json
{
  "status": "found",
  "mode": "compare_all",
  "results": [
    {
      "marja_id": "sistani",
      "marja_name": "Sayyid Ali al-Sistani",
      "status": "found",
      "answer": "Short answer.",
      "sources": []
    },
    {
      "marja_id": "khamenei",
      "marja_name": "Sayyid Ali Khamenei",
      "status": "not_found",
      "answer": "Not Found in the current verified dataset.",
      "sources": []
    },
    {
      "marja_id": "shirazi",
      "marja_name": "Sayyid Sadiq Shirazi",
      "status": "found",
      "answer": "Short answer.",
      "sources": []
    }
  ],
  "comparison_summary": "Only state differences that are directly supported by retrieved sources.",
  "disclaimer": "This tool retrieves rulings from published sources using AI and is not a replacement for contacting your marja's office."
}
```

## 19. Team Plan

### Team Member 1: Dataset + AI Retrieval

Responsibilities:

- Create `rulings.json`.
- Add 30-50 verified records.
- Build retrieval function.
- Add marja filtering.
- Add Not Found threshold.
- Create answer-generation prompt.
- Test retrieval accuracy.

Deliverables:

- `data/rulings.json`
- `lib/retrieveRulings.ts` or equivalent
- Working source-grounded answer generation

### Team Member 2: Frontend

Responsibilities:

- Build landing page.
- Build marja selector.
- Build chat input.
- Build response display.
- Build source cards.
- Build compare table.
- Add suggested questions.
- Polish UI for demo.

Deliverables:

- Usable Yaqeen web interface
- Demo-ready visual polish

### Team Member 3: Backend + Integration + Deployment

Responsibilities:

- Create `/api/ask` endpoint.
- Connect UI to retrieval.
- Connect retrieval to LLM.
- Implement streaming if feasible.
- Handle Not Found states.
- Deploy app.
- Prepare backup demo flow.

Deliverables:

- End-to-end working app
- Deployment link
- Demo script support

## 20. 5-Hour Build Plan

### Hour 0-1: Setup and Scope Lock

- Finalize 10-15 demo questions.
- Create GitHub repo.
- Set up Next.js app.
- Create `rulings.json` schema.
- Assign source-gathering tasks.

### Hour 1-2: Dataset and UI Skeleton

- Add first 15-20 verified records.
- Build marja selector.
- Build question input.
- Build basic API endpoint.
- Implement basic keyword retrieval as fallback.

### Hour 2-3: Retrieval and Generation

- Add semantic retrieval if feasible.
- Add strict system prompt.
- Add citation metadata.
- Implement single-marja answer flow.
- Implement Not Found behavior.

### Hour 3-4: Compare All and Polish

- Implement separate retrieval per marja.
- Build comparison table.
- Add source cards.
- Add disclaimer.
- Add official follow-up text.

### Hour 4-5: Testing and Demo Prep

- Test 10-15 known questions.
- Fix weak dataset entries.
- Prepare demo script.
- Create fallback screenshots or recording.
- Deploy final version.
- Prepare pitch around trust, citations, and open dataset.

## 21. MVP Acceptance Criteria

The MVP is complete if:

1. User can select one of three maraji.
2. User can select Compare All.
3. User can ask a question.
4. The app returns a short answer from verified dataset records.
5. The app shows citations for found answers.
6. The app returns Not Found when no verified source exists.
7. The app does not invent citations.
8. Compare All shows separate results per marja.
9. Every response includes the disclaimer.
10. The demo can successfully answer at least 10 prepared questions.

## 22. Success Metrics

### Hackathon Success Metrics

- 10-15 demo questions answered correctly.
- 100% of demo answers include citations or Not Found.
- 0 invented citations.
- Compare All works for at least 3 demo questions.
- App is deployed and usable.
- Dataset architecture is clearly explainable to judges.

### Product MVP Success Metrics

- 50 common fiqh questions benchmarked.
- 95%+ manual evaluation accuracy.
- Multiple maraji supported.
- All generated answers trace back to official sources.
- Dataset is structured for future open release.

## 23. Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Dataset too small | App cannot answer many questions | Use prepared suggested questions for demo |
| Retrieval returns wrong marja | Serious trust failure | Filter by marja before search |
| AI invents citations | Serious trust failure | Backend displays citations from metadata only |
| Local model setup takes too long | Demo failure | Use hosted model fallback for hackathon |
| Source metadata incomplete | Weak credibility | Prioritize fewer records with complete citations |
| Compare All blends opinions | Religious accuracy issue | Run separate retrieval per marja |
| Weak match produces answer | Hallucination risk | Use Not Found threshold |

## 24. Disclaimer Requirement

Every answer must include:

```text
This tool retrieves rulings from published sources using AI and is not a replacement for contacting your marja's office.
```

When no answer is found, include:

```text
Not Found in the current verified dataset. Please consult the marja's official Q&A platform, official office, or a local representative.
```

## 25. Competitive Positioning

### Existing Alternative

- Marja.ai

### Yaqeen Differentiation

Yaqeen is positioned as a transparent, open-dataset, source-first assistant rather than a generic chatbot.

| Capability | Yaqeen MVP |
|---|---:|
| Marja selector | Yes |
| Compare All mode | Yes |
| Exact source citations | Yes |
| Not Found refusal | Yes |
| Open dataset direction | Yes |
| Retrieval-first architecture | Yes |
| Local/private AI roadmap | Yes |

Core positioning line:

```text
Marja.ai is a chatbot. Yaqeen is an open verification layer for marja-specific rulings.
```

## 26. Demo Narrative

### Hook

Every Shia Muslim follows a marja, but finding the exact ruling from that marja is harder than it should be.

### Problem

Official sources are fragmented, PDFs are hard to search, and generic AI can hallucinate religious answers.

### Solution

Yaqeen lets a user select their marja, ask a question, and receive a short answer backed by official source citations.

### Differentiator

Yaqeen can compare multiple maraji side by side and clearly says Not Found when it cannot verify an answer.

### Technical Insight

The database is the product. The AI is only the interface.

### Closing Line

Yaqeen gives users confidence, not just answers.

## 27. Future Roadmap

### Phase 1: Hackathon MVP

- 3 maraji
- English only
- 30-50 verified records
- Web app
- RAG prototype
- Compare All

### Phase 2: Community MVP

- 500+ records
- Better ingestion pipeline
- Evaluation dashboard
- Feedback/report issue button
- Public dataset schema
- Admin review workflow

### Phase 3: OpenDataset Release

- GitHub repository
- Versioned data
- Contribution guidelines
- Source provenance policy
- Community review process

### Phase 4: Production Safety

- Scholar or advanced student review
- Official office outreach
- Local representative directory
- Multilingual support
- Privacy-first local model option

### Phase 5: Infrastructure Layer

- Public API
- OpenRAG SDK for Shia content
- Browser extension
- WhatsApp bot
- Expanded dataset beyond fiqh

## 28. Final MVP Definition

Yaqeen MVP is a web-based, source-grounded marja ruling assistant that allows users to select Sistani, Khamenei, Sadiq Shirazi, or Compare All; ask a fiqh question; receive a short answer backed by verified source citations; and see Not Found when no verified source exists.

The MVP succeeds by proving one principle:

```text
For religious AI, the safest answer is the one you can trace.
```
