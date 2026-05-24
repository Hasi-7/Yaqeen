# Yaqeen

Source-backed rulings from your marja.

Yaqeen is a hackathon MVP for a retrieval-based Shia marja ruling assistant. The app lets a user select a marja, ask a fiqh question, and receive either a short cited answer from verified records or a safe Not Found response.

## Current Build

This branch includes the Team Member 2 and 3 work:

- Next.js App Router frontend
- Marja selector
- Question input
- Suggested questions
- Source cards
- Compare All table
- `POST /api/ask` endpoint
- Safe empty-dataset handling
- Local AI adapter hook for Ollama-compatible chat endpoints

The canonical dataset is expected at:

```text
data/rulings.json
```

Until that file is added, the app intentionally returns Not Found rather than answering from model knowledge.

## Local AI

The API is ready for a local AI service. Copy `.env.example` to `.env.local` and set:

```text
LOCAL_AI_MODEL=your-local-model-name
LOCAL_AI_URL=http://localhost:11434/api/chat
```

If `LOCAL_AI_MODEL` is empty, the API falls back to a deterministic source-text summary once verified records are available.

## Commands

```bash
npm install
npm run dev
npm run lint
npm run build
```

The API contract is:

```text
POST /api/ask
```

```json
{
  "question": "What breaks wudhu?",
  "marja_id": "sistani"
}
```

Use `"all"` for Compare All mode.
