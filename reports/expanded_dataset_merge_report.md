# Expanded Dataset Merge Report

Generated: 2026-05-24T21:02:32.673Z

## Summary

| Metric | Count |
|---|---|
| Core records before | 12 |
| Expanded records found | 19 |
| Eligible expanded records | 19 |
| Merged records | 11 |
| Skipped duplicates | 8 |
| Skipped needs_review/draft/deprecated | 0 |
| Skipped invalid records | 0 |
| Core records after | 23 |

## Files Processed

- data/expanded/khamenei_rulings.json
- data/expanded/shirazi_rulings.json
- data/expanded/sistani_rulings.json

## Merged Records

| id | marja | topic | citation |
|---|---|---|---|
| khamenei_taqlid_q1 | khamenei | Taqlid | Practical Laws of Islam, Q1 |
| khamenei_taqlid_q16 | khamenei | Taqlid | Practical Laws of Islam, Q16 |
| khamenei_purity_q69 | khamenei | Purity | Practical Laws of Islam, Q69 |
| khamenei_purity_q95 | khamenei | Purity | Practical Laws of Islam, Q95 |
| shirazi_wudhu_obligations_001 | shirazi | Wudhu | Islamic Law, Vol. 1, A) Wod}u' |
| shirazi_tayammum_001 | shirazi | Tayammum | Islamic Law, Vol. 1, p. 85 |
| shirazi_khums_001 | shirazi | Khums | Islamic Law, Vol. 1, Chapter One: Khums |
| shirazi_marriage_001 | shirazi | Marriage | Islamic Law, Vol. 2, Marriage |
| sistani_taqlid_002 | sistani | Taqlid | Islamic Laws, ruling 2 |
| sistani_tayammum_684 | sistani | Tayammum | Islamic Laws, ruling 684 |
| sistani_loan_2376 | sistani | Loan | Islamic Laws, ruling 2376 |

## Skipped Duplicates

| expanded_id | existing_id | duplicate_type | reason |
|---|---|---|---|
| khamenei_prayer_q350 | khamenei_fajr_001 | same_source_reference | same marja, source_title, chapter_title, section_title, ruling_number (Q350) |
| khamenei_friday_q602 | khamenei_friday_prayer_001 | same_ruling_text | same marja and normalized ruling_text |
| khamenei_fasting_q734 | khamenei_fasting_travel_001 | same_source_reference | same marja, source_title, chapter_title, section_title, ruling_number (Q734) |
| shirazi_wudhu_invalidators_001 | shirazi_wudhu_001 | same_ruling_text | same marja and normalized ruling_text |
| shirazi_fajr_002 | shirazi_fajr_001 | same_ruling_text | same marja and normalized ruling_text |
| shirazi_fasting_travel_002 | shirazi_fasting_travel_001 | possible_near_duplicate | same marja, same topic, word-set Jaccard similarity 100% (threshold 80%) |
| sistani_wudhu_322 | sistani_wudhu_001 | possible_near_duplicate | same marja, same topic, word-set Jaccard similarity 89% (threshold 80%) |
| sistani_fasting_1690 | sistani_fasting_travel_001 | possible_near_duplicate | same marja, same topic, word-set Jaccard similarity 85% (threshold 80%) |

## Skipped Invalid or Ineligible Records

_None_

## ID Changes

_None_

## Next Review Items

Near duplicates and uncertain records for manual review:

- **shirazi_fasting_travel_002**: same marja, same topic, word-set Jaccard similarity 100% (threshold 80%)
- **sistani_wudhu_322**: same marja, same topic, word-set Jaccard similarity 89% (threshold 80%)
- **sistani_fasting_1690**: same marja, same topic, word-set Jaccard similarity 85% (threshold 80%)
