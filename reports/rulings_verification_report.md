# Rulings Verification Report

## Summary

Total records: 12
Verified exact: 12
Fixed to exact wording: 11
Needs review: 0
Deprecated: 0
Duplicates: 0
Unsupported: 0
Cross-marja issues: 0

## Source Map

### Sistani

- `pdf_files/english-islamic-laws-4th-edition.pdf` - Islamic Laws, 4th edition, Sayyid Ali al-Sistani

### Khamenei

- `pdf_files/khamenei-islamic-laws.pdf` - Practical Laws of Islam, Sayyid Ali Khamenei

### Shirazi

- `pdf_files/Islamic_Law_2013_Edition by Ayatollah Sayed Sadiq Shirazi.pdf` - Islamic Law, 2013 edition, Sayyid Sadiq Shirazi
- `pdf_files/Vol 1 Islamic_Law_2013_Edition.pdf` - duplicate/split volume source for Acts of Worship
- `pdf_files/Vol 2 Islamic_Law_2013_Edition.pdf` - not used for current records

### Unknown

- None

## Record-by-Record Results

### sistani_wudhu_001

Status: fixed to exact source wording and kept `verified_demo`
Matched source: `english-islamic-laws-4th-edition.pdf`
Matched page: PDF page 70
Matched ruling number: 322
Exact source wording found: yes
Changes made: replaced shortened/paraphrased wudhu invalidators with full ruling text, including istibra, sleep/hearing qualifier, istihadah, janabah, and recommended precaution wording.
Remaining concerns: none

### sistani_prayer_time_001

Status: fixed to exact source wording and kept `verified_demo`
Matched source: `english-islamic-laws-4th-edition.pdf`
Matched page: PDF page 142
Matched ruling number: 728
Exact source wording found: yes
Changes made: restored quoted first/second dawn wording and source footnote marker. Set unsupported generic `section_title` to `null`.
Remaining concerns: source text includes footnote marker `99`.

### sistani_fasting_travel_001

Status: fixed to exact source wording and kept `verified_demo`
Matched source: `english-islamic-laws-4th-edition.pdf`
Matched page: PDF page 283
Matched ruling number: 1690
Exact source wording found: yes
Changes made: restored diacritics, semicolon wording, permitted-limit condition, and kaffarah consequence. Set unsupported generic `section_title` to `null`.
Remaining concerns: none

### sistani_friday_prayer_001

Status: fixed to exact source wording and kept `verified_demo`
Matched source: `english-islamic-laws-4th-edition.pdf`
Matched page: PDF page 139
Matched ruling number: 719
Exact source wording found: yes
Changes made: restored first sentence about two rak'ahs and sermons, Arabic/transliterated terms, footnote marker, and zuhr wording. Set unsupported generic `section_title` to `null`.
Remaining concerns: source text includes footnote marker `92`.

### khamenei_fajr_001

Status: fixed to exact source wording and kept `verified_demo`
Matched source: `khamenei-islamic-laws.pdf`
Matched page: PDF page 97
Matched ruling number: Q350
Exact source wording found: yes
Changes made: restored exact `shar'i` diacritic wording. Updated visible chapter heading to `Prayers Times` and set unsupported `section_title` to `null`.
Remaining concerns: none

### khamenei_friday_prayer_001

Status: exact wording already matched and kept `verified_demo`
Matched source: `khamenei-islamic-laws.pdf`
Matched page: PDF page 167
Matched ruling number: Q602
Exact source wording found: yes
Changes made: none to ruling text.
Remaining concerns: PDF extraction line wrapping/hyphenation was ignored when comparing continuous text.

### khamenei_fasting_travel_001

Status: fixed to exact source wording and kept `verified_demo`
Matched source: `khamenei-islamic-laws.pdf`
Matched page: PDF page 209
Matched ruling number: Q734
Exact source wording found: yes
Changes made: removed question-context paraphrase from `ruling_text` and restored exact answer body with `qada` and `kaffarah` diacritics. Set unsupported `section_title` to `null`.
Remaining concerns: none

### khamenei_music_001

Status: fixed to exact source wording and kept `verified_demo`
Matched source: `khamenei-islamic-laws.pdf`
Matched page: PDF page 106
Matched ruling number: Q383
Exact source wording found: yes
Changes made: removed expanded question-context phrase and restored exact answer body with `haram` and `makruh` diacritics. Updated chapter to visible heading `The Place of Praying` and set unsupported `section_title` to `null`.
Remaining concerns: none

### shirazi_wudhu_001

Status: fixed to exact source wording and kept `verified_demo`
Matched source: `Islamic_Law_2013_Edition by Ayatollah Sayed Sadiq Shirazi.pdf`
Matched page: PDF pages 86-87; printed pages 72-73
Matched ruling number: none visible
Exact source wording found: yes
Changes made: restored exact list wording and source transliteration encoding.
Remaining concerns: source text uses PDF transliteration encoding such as `wod}u'` and `Istih}a>d}ah`.

### shirazi_fajr_001

Status: fixed to exact source wording and kept `verified_demo`
Matched source: `Islamic_Law_2013_Edition by Ayatollah Sayed Sadiq Shirazi.pdf`
Matched page: PDF page 135; printed page 121
Matched ruling number: none visible
Exact source wording found: yes
Changes made: restored exact source wording and transliteration encoding. Corrected `page_number` from `119` to `121`, section title, and citation label.
Remaining concerns: source text uses PDF transliteration encoding such as `S{obh}`, `s}ala>h`, and `adha>n`.

### shirazi_fasting_travel_001

Status: fixed to exact source wording and kept `verified_demo`
Matched source: `Islamic_Law_2013_Edition by Ayatollah Sayed Sadiq Shirazi.pdf`
Matched page: PDF page 273; printed page 259
Matched ruling number: none visible
Exact source wording found: yes
Changes made: restored exact source wording, including hadd al-tarakhus explanation, adhan condition, and kaffarah wording. Set unsupported `section_title` to `null`.
Remaining concerns: source text uses PDF transliteration encoding such as `h}a dd`, `adha>n`, and `kaffa>rah`.

### shirazi_najis_001

Status: fixed to exact source wording and kept `verified_demo`
Matched source: `Islamic_Law_2013_Edition by Ayatollah Sayed Sadiq Shirazi.pdf`
Matched page: PDF page 35; printed page 21
Matched ruling number: none visible
Exact source wording found: yes
Changes made: replaced combined paraphrase with exact source passage covering categories of najasat, urine/faeces, semen, and carcass. Corrected `page_number` from `25` to `21` and citation label.
Remaining concerns: this record still combines multiple adjacent source cases; it is exact text, but future cleanup should split it into narrower records.

## High-Risk Issues

- Previous dataset wording was mostly meaning-level paraphrase, not exact source text.
- Several records now contain source PDF transliteration encodings and footnote markers because the prompt requires exact wording.
- Some user-friendly section titles were set to `null` when not clearly visible in the PDF.
- Shirazi `shirazi_najis_001` remains broad and should eventually be split into separate records for urine/faeces, semen, and carcass.
- No unsupported records, duplicate records, or cross-marja contamination were found in this quick verification.

## Recommended Next Steps

- Have a human reviewer spot-check the updated exact strings directly in the PDFs.
- Decide whether exact PDF transliteration encodings should be preserved in `ruling_text` or moved to a separate `source_excerpt` field with user-friendly display text elsewhere.
- Split broad records into narrower exact-source records, especially `shirazi_najis_001`.
- Add runtime JSON schema validation before increasing dataset size.
