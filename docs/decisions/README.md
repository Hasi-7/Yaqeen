# Decision Records

This folder tracks architecture and product decisions that affect implementation.

## Current Decisions

### MVP Data Source

The MVP uses `data/rulings.json` as the canonical verified dataset. Retrieval is only an access layer; it must not become the source of truth.

Reason: the hackathon demo needs reliable, reviewable answers with controlled citations more than broad coverage.

### Retrieval Strategy

The current implementation uses deterministic keyword/domain retrieval instead of vector search.

Reason: deterministic retrieval is easier to test, easier to fail closed, and safer for a source-grounded religious ruling assistant during MVP development.

### Compare All Mode

Compare All runs retrieval separately for each marja.

Reason: mixing all maraji in one retrieval pass risks blending opinions or attributing one marja's ruling to another.

### Citations

Citations are generated from stored metadata in backend code, not by the answer generator.

Reason: model-generated citations can hallucinate URLs, ruling numbers, pages, or source titles.

### Unknown Answers

When no sufficiently relevant verified record exists, the API returns `Not Found in the current verified dataset`.

Reason: failing closed is safer than answering from general model knowledge.
