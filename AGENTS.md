# Project Agent Notes

## Project

Name: Yaqeen

Goal: Build a hackathon MVP for a source-grounded Shia marja ruling assistant. Users select a marja, ask a fiqh question, and receive a short answer with citations from verified sources. The MVP supports Sayyid Ali al-Sistani, Sayyid Ali Khamenei, Sayyid Sadiq Shirazi, and a "Compare All" mode.

Status: Hackathon MVP. Prioritize a reliable demo path over broad architecture, full ingestion, or production hardening.

## Stack

Frontend: Next.js + TypeScript + Tailwind CSS

Backend: Next.js API routes

Database: Curated JSON dataset for MVP; planned production path is Postgres + pgvector

AI/model: Retrieval-augmented generation over verified ruling records. Use a strict source-only prompt. Local model is preferred long-term; for the hackathon, use whichever model is already working fastest.

Deployment: Vercel preferred for MVP

## Commands

Install:
```bash
npm install
```

Run:
```bash
npm run dev
```

Test:
```bash
npm test
```

Lint:
```bash
npm run lint
```

Build:
```bash
npm run build
```

## Architecture

Key files:
- `PRD.md` — product requirements and MVP scope
- `AGENTS.md` — project operating notes for coding agents
- `context/current-task.md` — current active task; read this before acting
- `data/rulings.json` — canonical MVP dataset of verified ruling records
- `src/lib/retriever.ts` — deterministic keyword retrieval logic
- `src/lib/retrieval/hybrid-search.ts` — optional vector retrieval with keyword fallback
- `src/lib/ai/prompt.ts` — strict source-only system prompt
- `src/lib/citations.ts` — citation formatting from database metadata; do not let the model invent citations
- `src/lib/ruling-schema.ts` — runtime dataset validation
- `src/app/api/ask/route.ts` — main API endpoint for user questions
- `src/components/YaqeenApp.tsx` — main UI, marja selector, source cards, and comparison output

Important patterns:
- The structured rulings dataset is the source of truth.
- Vector search or semantic retrieval is only an access layer, not the source of truth. Keyword fallback must remain available.
- Always filter by `marja_id` before retrieval in single-marja mode.
- In "Compare All" mode, run retrieval separately for each marja. Do not retrieve all sources together and ask the model to compare.
- If no sufficiently relevant verified source is found, return `Not Found in the current verified dataset`.
- Citations must come from stored metadata, not model-generated text.
- Answers should be short, direct, and practical.
- Always include the disclaimer: this tool retrieves rulings from published sources using AI and is not a replacement for contacting the user's marja office.
- Do not add unsupported religious reasoning, personal opinions, or cross-marja assumptions.
- Prioritize demo reliability over breadth. A small accurate dataset is better than a large unreliable one.

## Rules

- Follow global Claude Code/OpenCode rules.
- Read `context/current-task.md` before acting.
- Do not change architecture without explaining why.
- Prioritize the current task over broad refactors.
- For hackathons, prioritize demo path.
- For portfolio projects, produce resume evidence.
- Do not hallucinate religious rulings, citations, page numbers, ruling numbers, URLs, or marja opinions.
- Do not answer from model knowledge when retrieval fails.
- Do not merge or blend rulings between maraji.
- Do not store user questions as training data.
- Keep changes small, reviewable, and aligned with the MVP.
