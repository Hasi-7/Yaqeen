# Dataset

The canonical MVP dataset is:

```text
data/rulings.json
```

It currently contains 12 exact-source verified demo records. The API validates this file at runtime and retrieves only answer-eligible records.

Answer-eligible statuses:

- `verified_demo`
- `verified`

Non-answer-eligible statuses:

- `needs_review`
- `deprecated`

Background expansion files under `data/expanded/` must stay separate until manually verified. After verification, copy exact-source records into `data/rulings.json` and run:

```bash
npm run test:dataset
npm test
```

Do not change `ruling_text` for display polish. It must preserve exact source wording.
