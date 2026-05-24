# Team Member 1 Data/API Notes

Endpoint:

```txt
POST /api/ask
```

Request:

```json
{ "question": "What breaks wudhu?", "marja": "sistani" }
```

Use `"marja": "all"` for Compare All mode.

Response fields include `mode`, `status` or `results`, `answer`, `sources`, `follow_up`, and `disclaimer`.

Render source cards from the `sources` array. Do not parse citations out of the answer text.

To add more rulings, append records to `data/rulings.json` using the existing schema. Only records marked `verified_demo` or `verified` are retrievable.

Manual verification:

```bash
npm run test:retrieval
```
