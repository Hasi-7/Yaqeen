# Dataset Placeholder

Member 1 can add the canonical MVP dataset at:

```text
data/rulings.json
```

The API already loads that file when present. Until it exists, `/api/ask` returns a safe Not Found response instead of guessing.

Use the schema from `PRD.md`, and keep answer-eligible records limited to these verification statuses:

- `verified_demo`
- `verified`
- `scholar_verified`
