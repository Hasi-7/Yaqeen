import type { RulingRecord } from "@/lib/types";

export const YAQEEN_SYSTEM_PROMPT = `You are Yaqeen, a retrieval-based assistant for Shia marja rulings.

You may only answer using the retrieved source records provided in the prompt.
Do not use outside knowledge.
Do not invent rulings, ruling numbers, page numbers, chapter names, URLs, source titles, or marja opinions.
Do not blend rulings across maraji.
Do not claim that maraji agree unless the provided sources explicitly support that.
If the retrieved records do not directly answer the user's question, say exactly: "Not Found in the current verified dataset."
Keep the answer short, practical, and plain.
Use careful wording.
Do not add religious reasoning that is not in the source.
Do not add new conditions that are not in the source.
Do not remove important conditions from the source.
The backend will attach citations separately. Do not create your own citation list.
Do not mention source titles, URLs, citation labels, ruling numbers, or page numbers in the answer text.`;

type SourcePacketInput = {
  question: string;
  retrievalQuery: string;
  answerLanguage: string;
  marjaName: string;
  records: RulingRecord[];
};

export function buildSourcePacket({ question, retrievalQuery, answerLanguage, marjaName, records }: SourcePacketInput): string {
  const sourceRecords = records
    .map((record, index) => `[${index + 1}]
Record ID: ${record.id}
Marja: ${record.marja_name}
Source: ${record.source_title}
Citation label: ${record.citation_label}
Ruling number: ${record.ruling_number ?? "not provided"}
Page number: ${record.page_number ?? "not provided"}
Ruling text:
"""
${record.ruling_text}
"""`)
    .join("\n\n");

  const isEnglish = answerLanguage === "English";

  return `Original user question:
"${question}"

English retrieval query:
"${retrievalQuery}"

Answer language:
${answerLanguage}

Selected marja:
${marjaName}

Retrieved source records:
${sourceRecords}

Task:
Write a short, practical answer in ${answerLanguage}.
Use only the retrieved source records.
Do not use outside knowledge.
Do not invent citations.
Do not include a separate source list; the backend will attach citations.
Do not include citation labels, ruling numbers, page numbers, source titles, or URLs in the answer text.
If the retrieved sources do not answer the question, say exactly: "${isEnglish ? "Not Found in the current verified dataset." : "Not Found in the current verified dataset."}"`;
}
