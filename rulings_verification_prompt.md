# Yaqeen Rulings Dataset Verification Prompt

You are verifying `rulings.json` against the original source texts in the `pdf_files/` folder.

This task is strict source verification. The JSON file must store the EXACT same wording used in the source texts for the rulings. Do not interpret, summarize, paraphrase, simplify, or explain the rulings inside `ruling_text`.

Your job is to make sure there are no fabricated, incorrect, mismatched, paraphrased, interpreted, or poorly cited rulings in the dataset.

Use 2 to 3 agents/sub-agents if available. Accuracy matters more than speed.

---

## Core Requirement

The field `ruling_text` in `/data/rulings.json` must contain the exact wording from the source text.

Do not:
- interpret the ruling
- summarize the ruling
- paraphrase the ruling
- simplify the ruling
- modernize the wording
- remove conditions
- combine multiple rulings into one unless the source itself combines them
- add your own explanation
- infer what the marja means
- infer missing citation data
- create page numbers, ruling numbers, chapter names, or URLs

Only copy the exact source wording.

If a record cannot be verified exactly against the source PDFs, mark it as:

```json
"verification_status": "needs_review"
```

Do not leave unsupported or paraphrased records as `verified_demo`.

---

## Files to Verify

Verify:

```txt
/data/rulings.json
```

against source files in:

```txt
/pdf_files/
```

Also read these files first if they exist:

```txt
AGENTS.md
PRD.md
context/current-task.md
README.md
```

---

## Verification Standard

A record passes only if this sentence is true:

“A reviewer can open the cited source PDF, go to the recorded page/ruling/section, and see that the dataset’s `ruling_text` matches the source wording exactly.”

If this sentence is not true, the record does not pass.

---

# Agent Team Structure

Use 2 to 3 agents.

If only 2 agents are available, combine Agent 2 and Agent 3.

---

## Agent 1 — Source Matching Agent

Responsibilities:

1. Open `/data/rulings.json`.
2. List all PDFs in `/pdf_files/`.
3. Identify which PDF belongs to which marja.
4. For each record, find the claimed source PDF.
5. Search the source PDF using:
   - ruling number
   - exact phrase from `ruling_text`
   - chapter title
   - section title
   - topic keywords
   - tags
6. Confirm whether the source exists and whether the ruling appears in that source.

For each record, produce:

```txt
record_id:
source_found: yes/no
matched_file:
matched_page:
matched_section:
matched_ruling_number:
exact_text_found: yes/no
notes:
```

Rules for Agent 1:

- Do not use general knowledge.
- Do not use web sources unless explicitly instructed.
- Do not assume a PDF matches because the topic is similar.
- Do not infer a ruling number if it is not visible in the source.
- If the source cannot be found, mark the record as `needs_review`.

---

## Agent 2 — Exact Text Accuracy Agent

Responsibilities:

1. Compare `ruling_text` in `rulings.json` against the source text.
2. Determine whether the dataset wording is:
   - exact source wording
   - not exact but close
   - paraphrased
   - interpreted
   - incomplete
   - unsupported
3. Replace non-exact `ruling_text` with the exact wording from the source.
4. Preserve all conditions, exceptions, and qualifiers exactly as written.
5. Do not rewrite the ruling for clarity.

For each record, produce:

```txt
record_id:
text_accuracy: exact / not_exact / paraphrased / interpreted / incomplete / unsupported
source_excerpt:
dataset_text_before:
dataset_text_after:
changes_made:
remaining_concerns:
```

Rules for Agent 2:

- `ruling_text` must be copied exactly from the PDF/source.
- Do not interpret the source.
- Do not produce a cleaner version.
- Do not remove words like:
  - obligatory precaution
  - recommended precaution
  - based on precaution
  - if he knows
  - if he doubts
  - if it causes harm
  - if there is hardship
  - unless necessary
  - intentionally
  - forgetfully
  - commonly considered
  - obligatory
  - recommended
  - permissible
  - not permissible
- If exact wording cannot be extracted, mark the record as `needs_review`.
- If OCR introduces uncertainty, mark the record as `needs_review`.

---

## Agent 3 — Metadata, Citation, and Safety Agent

Responsibilities:

1. Check metadata consistency.
2. Confirm:
   - `marja_id` matches the source
   - `marja_name` matches the source
   - `source_title` is accurate
   - `source_type` is accurate
   - `chapter_title` is accurate if present
   - `section_title` is accurate if present
   - `ruling_number` is accurate if present
   - `page_number` is accurate if present
   - `citation_label` is accurate
   - `tags` are reasonable
   - `verification_status` is appropriate
3. Check for cross-marja contamination.
4. Check for hallucinated citations.
5. Check for duplicate records.

For each record, produce:

```txt
record_id:
metadata_status: valid / needs_fix / unsupported
citation_status: valid / needs_fix / hallucinated
cross_marja_contamination: yes/no
duplicate: yes/no
recommended_metadata_fix:
```

Rules for Agent 3:

- Do not invent metadata.
- If the PDF does not clearly show a ruling number, set `"ruling_number": null`.
- If the page number cannot be verified, set `"page_number": null`.
- If the section title cannot be verified, set `"section_title": null`.
- If the chapter title cannot be verified, set `"chapter_title": null`.
- If the source is uncertain, set `"verification_status": "needs_review"`.

---

# Required JSON Schema

Each record should have these fields where possible:

```json
{
  "id": "sistani_wudhu_001",
  "marja_id": "sistani",
  "marja_name": "Sayyid Ali al-Sistani",
  "source_type": "risalah",
  "source_title": "Islamic Laws",
  "official_url": null,
  "topic": "Wudhu",
  "subtopic": "Things that invalidate wudhu",
  "question_text": "What breaks wudhu?",
  "ruling_text": "EXACT SOURCE WORDING ONLY",
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

Use this policy:

```txt
verified_demo = exact wording verified by the hackathon team against source PDFs
verified = formal/external verification; do not use unless already established
needs_review = source not found, wording not exact, metadata uncertain, OCR uncertain, or possibly wrong
deprecated = source is outdated or replaced
```

---

# Verification Rules

## Rule 1: Exact wording only

The `ruling_text` field must store the exact source wording.

Bad:

```json
"ruling_text": "Music is haram."
```

Good only if the source literally says that exact sentence.

If the source says something longer or conditional, copy the full exact source wording needed to preserve the ruling.

---

## Rule 2: Source text wins

The PDF source always wins over `rulings.json`.

If `rulings.json` says one thing and the PDF says another, update `rulings.json` to match the PDF exactly.

---

## Rule 3: Do not interpret

Do not add interpretation anywhere in `ruling_text`.

If you need to support search, use `question_text`, `topic`, `subtopic`, and `tags`.

The ruling itself must remain exact.

---

## Rule 4: Do not simplify conditions

Do not remove qualifiers such as:

```txt
obligatory precaution
recommended precaution
if one knows
if one doubts
if it causes harm
unless there is hardship
unless there is necessity
intentionally
forgetfully
commonly considered
based on precaution
```

If a condition appears in the source, it must remain in `ruling_text`.

---

## Rule 5: Do not infer missing citations

Do not invent:

```txt
ruling numbers
page numbers
chapter names
section names
URLs
source titles
```

If the source does not clearly provide the value, use `null`.

---

## Rule 6: No cross-marja contamination

A Sistani record must not cite a Khamenei PDF.

A Khamenei record must not cite a Shirazi PDF.

A Shirazi record must not cite a Sistani PDF.

If contamination is found, set:

```json
"verification_status": "needs_review"
```

and explain it in the report.

---

## Rule 7: Unsupported records must be downgraded

If a record cannot be verified against `pdf_files/`, change:

```json
"verification_status": "verified_demo"
```

to:

```json
"verification_status": "needs_review"
```

Do not delete the record unless it is clearly duplicate or fabricated.

---

## Rule 8: Paraphrased records must be fixed or downgraded

If a record is accurate in meaning but not exact wording:

1. Replace `ruling_text` with the exact source wording if the exact wording is found.
2. If exact wording cannot be found, mark it as `needs_review`.

---

## Rule 9: Duplicates should be flagged

If two records cite the same ruling and answer the same question, either:

- merge them, or
- keep both only if they support different user questions

Flag duplicates in the report.

---

# Expected Workflow

## Step 1: Inspect project files

Read:

```txt
AGENTS.md
PRD.md
/data/rulings.json
```

Then list files in:

```txt
/pdf_files/
```

Create a source map:

```txt
sistani:
- file name(s)

khamenei:
- file name(s)

shirazi:
- file name(s)

unknown:
- file name(s) needing inspection
```

---

## Step 2: Validate JSON structure

Check that `/data/rulings.json` is valid JSON.

Check that each record has the required fields.

If fields are missing:

- fix them only if obvious from the source
- otherwise flag them and set `verification_status` to `needs_review`

---

## Step 3: Verify each record against PDFs

For each record:

1. Identify expected marja.
2. Identify expected source PDF.
3. Search by ruling number if available.
4. Search by exact phrase from `ruling_text`.
5. Search by chapter title or section title.
6. Search by topic keywords.
7. Locate the exact source text.
8. Compare the dataset `ruling_text` to the exact source text.
9. Replace `ruling_text` with exact source wording if needed.
10. Check metadata.
11. Update verification status.

---

## Step 4: Update `/data/rulings.json`

Apply corrections directly.

For each record:

- Fix `ruling_text` to exact source wording.
- Fix incorrect `marja_id`.
- Fix incorrect `marja_name`.
- Fix incorrect `source_title`.
- Fix incorrect `source_type`.
- Fix incorrect `chapter_title`.
- Fix incorrect `section_title`.
- Fix incorrect `ruling_number`.
- Fix incorrect `page_number`.
- Fix incorrect `citation_label`.
- Fix poor tags.
- Downgrade unsupported records to `needs_review`.

Keep verified records as `verified_demo` only when the exact wording was found and matched.

---

## Step 5: Create verification report

Create:

```txt
/reports/rulings_verification_report.md
```

Use this format:

```md
# Rulings Verification Report

## Summary

Total records:
Verified exact:
Fixed to exact wording:
Needs review:
Deprecated:
Duplicates:
Unsupported:
Cross-marja issues:

## Source Map

### Sistani

### Khamenei

### Shirazi

### Unknown

## Record-by-Record Results

### record_id

Status:
Matched source:
Matched page:
Matched ruling number:
Exact source wording found:
Changes made:
Remaining concerns:

## High-Risk Issues

List any:
- unsupported rulings
- paraphrased rulings
- interpreted rulings
- incorrect marja mapping
- missing qualifiers
- hallucinated citations
- duplicate records
- PDF/source mismatch

## Recommended Next Steps

List the next highest-impact corrections.
```

---

# Output Requirements

At the end, provide:

1. Updated `/data/rulings.json`
2. New `/reports/rulings_verification_report.md`
3. Brief terminal summary

Example final summary:

```txt
Verification complete.

Records checked: 32
Verified exact: 24
Fixed to exact wording: 6
Needs review: 8
Duplicates flagged: 2

Updated:
- /data/rulings.json
- /reports/rulings_verification_report.md

Main issue:
Several records were accurate in general meaning but were paraphrased. These were replaced with exact source wording where possible and downgraded where exact wording could not be verified.
```

---

# Strict Safety Requirements

Do not claim a ruling is verified unless exact or clearly copied source text was found in the PDF.

Do not rely on memory or general Islamic knowledge.

Do not use web sources unless explicitly instructed.

Do not allow any agent to “reason out” what the marja probably says.

Do not preserve a citation just because it looks plausible.

Do not preserve paraphrased `ruling_text`.

If uncertain, mark `needs_review`.

---

# Final Instruction

Your final dataset should be source-grounded and exact.

The field `ruling_text` is not for summaries. It is not for explanation. It is not for interpretation.

It must be exact source wording only.
