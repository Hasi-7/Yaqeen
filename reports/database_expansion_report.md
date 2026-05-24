# Database Expansion Report

## Source map

- `english-islamic-laws-4th-edition.pdf` -> Sayyid Ali al-Sistani
- `khamenei-islamic-laws.pdf` -> Sayyid Ali Khamenei
- `Vol 1 Islamic_Law_2013_Edition.pdf` -> Sayyid Sadiq Shirazi, acts of worship and khums
- `Vol 2 Islamic_Law_2013_Edition.pdf` -> Sayyid Sadiq Shirazi, family, social, and economic rulings
- `Islamic_Law_2013_Edition by Ayatollah Sayed Sadiq Shirazi.pdf` -> combined Shirazi edition; treated as a duplicate/alternate source and not used for the final citations because the split volumes were clearer to cite

## Coverage added

- `data/expanded/sistani_rulings.json`: 5 records
- `data/expanded/khamenei_rulings.json`: 7 records
- `data/expanded/shirazi_rulings.json`: 7 records

Topics covered in this pass:

- Taqlid
- Purity / Wudhu
- Tayammum
- Prayer / Fajr / Friday prayer
- Fasting while traveling
- Khums
- Marriage
- Lending najis items

## Validation notes

- `ruling_text` values were copied from local text extractions of the PDFs and kept source-faithful.
- `question_text` values were normalized into search-friendly prompts.
- `official_url` was left `null` in this pass unless the PDF itself clearly established it.
- `page_number` was left `null` whenever the extraction did not make the page boundary fully reliable for that specific record.
- Khamenei records were cited by Q-number because that metadata was consistently verifiable in the source.
- Sistani records were cited by ruling number because that metadata was consistently verifiable in the source.
- Shirazi records used volume-specific source files to avoid ambiguity with the combined edition.

## Known limitations

- The working extraction is OCR/text-conversion based, so additional spot-review against the PDFs is still recommended before merging these records into the primary dataset.
- Some chapter and section labels were simplified to the nearest clearly verifiable heading when the extraction broke formatting across pages.
- This is a first curated expansion pass, not a full-book ingestion.
