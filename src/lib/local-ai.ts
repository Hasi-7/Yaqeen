import type { RulingRecord } from "./types";

type LocalAiResult = {
  answer: string;
  mode: "configured" | "not_configured" | "failed";
};

const DEFAULT_LOCAL_AI_URL = "http://localhost:11434/api/chat";

export async function generateAnswerWithLocalAi(
  question: string,
  records: RulingRecord[],
): Promise<LocalAiResult> {
  const model = process.env.LOCAL_AI_MODEL;

  if (!model) {
    return {
      answer: summarizeFromRecords(records),
      mode: "not_configured",
    };
  }

  try {
    const response = await fetch(process.env.LOCAL_AI_URL ?? DEFAULT_LOCAL_AI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        stream: false,
        messages: [
          {
            role: "system",
            content:
              "You are Yaqeen, a retrieval-based assistant for Shia marja rulings. Answer only from the supplied source records. Do not use outside knowledge. Do not invent citations, ruling numbers, page numbers, URLs, or marja opinions. If the records do not directly answer the question, say: Not Found in the current verified dataset. Keep the answer short, practical, and plain.",
          },
          {
            role: "user",
            content: JSON.stringify({
              question,
              source_records: records.map((record) => ({
                marja_name: record.marja_name,
                question_text: record.question_text,
                ruling_text: record.ruling_text,
                citation_label: record.citation_label,
              })),
            }),
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Local AI request failed with ${response.status}`);
    }

    const payload = (await response.json()) as {
      message?: { content?: string };
      response?: string;
    };

    return {
      answer:
        payload.message?.content?.trim() ||
        payload.response?.trim() ||
        summarizeFromRecords(records),
      mode: "configured",
    };
  } catch (error) {
    console.error("Local AI answer generation failed", error);
    return {
      answer: summarizeFromRecords(records),
      mode: "failed",
    };
  }
}

export function summarizeFromRecords(records: RulingRecord[]): string {
  const primary = records[0];

  if (!primary) {
    return "Not Found in the current verified dataset.";
  }

  return `According to ${primary.marja_name}, ${primary.ruling_text}`;
}
