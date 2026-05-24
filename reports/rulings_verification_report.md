# Rulings Verification Report

## Scope

- Verified `data/rulings.json` only.
- Excluded `data/expanded/*` from this run.

## Summary

Total records: 12
Verified exact: 12
Fixed to exact wording: 0
Needs review: 0
Deprecated: 0
Duplicates: 0
Unsupported: 0
Cross-marja issues: 0
Metadata fixes in this run: 4

## Source Map

### Sistani

- `pdf_files/english-islamic-laws-4th-edition.pdf` - Islamic Laws, 4th edition, Sayyid Ali al-Sistani

### Khamenei

- `pdf_files/khamenei-islamic-laws.pdf` - Practical Laws of Islam, Sayyid Ali Khamenei

### Shirazi

- `pdf_files/Islamic_Law_2013_Edition by Ayatollah Sayed Sadiq Shirazi.pdf` - Islamic Law, 2013 edition, Sayyid Sadiq Shirazi
- `pdf_files/Vol 1 Islamic_Law_2013_Edition.pdf` - duplicate/split volume source for Acts of Worship
- `pdf_files/Vol 2 Islamic_Law_2013_Edition.pdf` - duplicate/split volume source for later sections

### Unknown

- None

## Record-by-Record Results

### sistani_wudhu_001

Status: exact wording matched and kept `verified_demo`
Matched source: `english-islamic-laws-4th-edition.pdf`
Matched page: PDF page 70
Matched ruling number: 322
Exact source wording found: yes
Changes made: none in this run
Remaining concerns: none

### sistani_prayer_time_001

Status: exact wording matched and kept `verified_demo`
Matched source: `english-islamic-laws-4th-edition.pdf`
Matched page: PDF page 142
Matched ruling number: 728
Exact source wording found: yes
Changes made: none in this run
Remaining concerns: source text includes footnote marker `99`

### sistani_fasting_travel_001

Status: exact wording matched and kept `verified_demo`
Matched source: `english-islamic-laws-4th-edition.pdf`
Matched page: PDF page 283
Matched ruling number: 1690
Exact source wording found: yes
Changes made: none in this run
Remaining concerns: none

### sistani_friday_prayer_001

Status: exact wording matched and kept `verified_demo`
Matched source: `english-islamic-laws-4th-edition.pdf`
Matched page: PDF page 139
Matched ruling number: 719
Exact source wording found: yes
Changes made: none in this run
Remaining concerns: source text includes footnote marker `92`

### khamenei_fajr_001

Status: exact wording matched and kept `verified_demo`
Matched source: `khamenei-islamic-laws.pdf`
Matched page: PDF page 97
Matched ruling number: Q350
Exact source wording found: yes
Changes made: normalized `citation_label` to the visible heading `Prayers Times`
Remaining concerns: none

### khamenei_friday_prayer_001

Status: exact wording matched and kept `verified_demo`
Matched source: `khamenei-islamic-laws.pdf`
Matched page: PDF page 167
Matched ruling number: Q602
Exact source wording found: yes
Changes made: normalized `chapter_title` to `Friday [Jumu’ah] Prayers`, set unsupported `section_title` to `null`, and updated `citation_label`
Remaining concerns: PDF extraction line wrapping/hyphenation was ignored when comparing continuous text

### khamenei_fasting_travel_001

Status: exact wording matched and kept `verified_demo`
Matched source: `khamenei-islamic-laws.pdf`
Matched page: PDF page 209
Matched ruling number: Q734
Exact source wording found: yes
Changes made: normalized `chapter_title` and `citation_label` to `Conditions Under Which Fasting Is Obligatory`
Remaining concerns: none

### khamenei_music_001

Status: exact wording matched and kept `verified_demo`
Matched source: `khamenei-islamic-laws.pdf`
Matched page: PDF page 106
Matched ruling number: Q383
Exact source wording found: yes
Changes made: normalized `citation_label` to the visible heading `The Place of Praying`
Remaining concerns: none

### shirazi_wudhu_001

Status: exact wording matched and kept `verified_demo`
Matched source: `Islamic_Law_2013_Edition by Ayatollah Sayed Sadiq Shirazi.pdf`
Matched page: PDF pages 86-87; printed pages 72-73
Matched ruling number: none visible
Exact source wording found: yes
Changes made: none in this run
Remaining concerns: source text uses PDF transliteration encoding such as `wod}u'` and `Istih}a>d}ah`

### shirazi_fajr_001

Status: exact wording matched and kept `verified_demo`
Matched source: `Islamic_Law_2013_Edition by Ayatollah Sayed Sadiq Shirazi.pdf`
Matched page: PDF page 135; printed page 121
Matched ruling number: none visible
Exact source wording found: yes
Changes made: none in this run
Remaining concerns: source text uses PDF transliteration encoding such as `S{obh}`, `s}ala>h`, and `adha>n`

### shirazi_fasting_travel_001

Status: exact wording matched and kept `verified_demo`
Matched source: `Islamic_Law_2013_Edition by Ayatollah Sayed Sadiq Shirazi.pdf`
Matched page: PDF page 273; printed page 259
Matched ruling number: none visible
Exact source wording found: yes
Changes made: none in this run
Remaining concerns: source text uses PDF transliteration encoding such as `h}a dd`, `adha>n`, and `kaffa>rah`

### shirazi_najis_001

Status: exact wording matched and kept `verified_demo`
Matched source: `Islamic_Law_2013_Edition by Ayatollah Sayed Sadiq Shirazi.pdf`
Matched page: PDF page 35; printed page 21
Matched ruling number: none visible
Exact source wording found: yes
Changes made: none in this run
Remaining concerns: this record still combines multiple adjacent source cases; it is exact text, but future cleanup should split it into narrower records

## High-Risk Issues

- Several records intentionally preserve source transliteration encodings and footnote markers because exact wording is required.
- Shirazi `shirazi_najis_001` remains broad and should eventually be split into separate narrower records.
- No unsupported records, duplicate records, or cross-marja contamination were found in this run.

## Recommended Next Steps

- Have a human reviewer spot-check the updated exact strings directly in the PDFs.
- Decide whether exact PDF transliteration encodings should remain only in `ruling_text` or also be reflected in display metadata.
- Split broad records into narrower exact-source records, especially `shirazi_najis_001`.
- Add runtime JSON schema validation before increasing dataset size.
