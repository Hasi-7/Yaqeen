import type { RulingRecord, SourceCitation } from "./types";

export function citationFromRecord(record: RulingRecord): SourceCitation {
  return {
    marja_name: record.marja_name,
    source_title: record.source_title,
    chapter_title: record.chapter_title ?? record.topic,
    ruling_number: record.ruling_number ?? null,
    page_number: record.page_number ?? null,
    url: record.official_url ?? null,
    citation_label: record.citation_label,
  };
}

export function dedupeCitations(records: RulingRecord[]): SourceCitation[] {
  const seen = new Set<string>();

  return records
    .map(citationFromRecord)
    .filter((source) => {
      const key = `${source.marja_name}:${source.citation_label}:${source.url ?? ""}`;
      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
}
