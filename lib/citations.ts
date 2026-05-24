import type { RetrievedRuling, RulingRecord, SourceCitation } from "./types";

export function toCitation(record: RulingRecord | RetrievedRuling): SourceCitation {
  return {
    marja_id: record.marja_id,
    marja_name: record.marja_name,
    source_title: record.source_title,
    source_type: record.source_type,
    citation_label: record.citation_label,
    official_url: record.official_url ?? null,
    ruling_number: record.ruling_number ?? null,
    page_number: record.page_number ?? null
  };
}
