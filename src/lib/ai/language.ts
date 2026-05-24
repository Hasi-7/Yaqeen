import { getAIProvider } from "./provider";

export type LanguageInfo = {
  detected_language: string;
  language_name: string;
  retrieval_query: string;
  original_question: string;
  confidence: "high" | "medium" | "low";
};

type TranslationMode = "passthrough" | "ai_translated_query" | "fallback_english";

export type NormalizedQuestion = LanguageInfo & {
  translation_mode: TranslationMode;
};

const DETECTION_SYSTEM_PROMPT = `You convert user questions into English retrieval queries for a source-grounded Shia fiqh assistant.

Return only valid JSON.
Do not answer the religious question.
Do not provide a ruling.
Do not add explanation.
Only detect the language and translate the user's question into a concise English search query.
Preserve religious terms such as wudhu, ghusl, khums, zakat, qiblah, najis, fasting, prayer, marja, taqlid, hijab, music, marriage.`;

export async function normalizeQuestionForRetrieval(question: string): Promise<NormalizedQuestion> {
  const englishFallback: NormalizedQuestion = {
    detected_language: "en",
    language_name: "English",
    retrieval_query: question,
    original_question: question,
    confidence: "low",
    translation_mode: "fallback_english",
  };

  const provider = getAIProvider();
  if (!provider) {
    return englishFallback;
  }

  try {
    const result = await provider.complete({
      messages: [
        { role: "system", content: DETECTION_SYSTEM_PROMPT },
        {
          role: "user",
          content: `Question:\n"${question}"\n\nReturn JSON in this exact shape:\n{\n  "detected_language": "en|ar|ur|fa|fr|unknown",\n  "language_name": "English|Arabic|Urdu|Farsi|French|Unknown",\n  "retrieval_query": "English query for retrieval",\n  "confidence": "high|medium|low"\n}`,
        },
      ],
      temperature: 0,
      maxTokens: 150,
    });

    const parsed = parseLanguageJSON(result.text);
    if (!parsed) {
      return englishFallback;
    }

    const isEnglish = parsed.detected_language === "en" || parsed.detected_language === "unknown";
    return {
      detected_language: parsed.detected_language,
      language_name: parsed.language_name,
      retrieval_query: parsed.retrieval_query || question,
      original_question: question,
      confidence: parsed.confidence,
      translation_mode: isEnglish ? "passthrough" : "ai_translated_query",
    };
  } catch {
    return { ...englishFallback, detected_language: "unknown" };
  }
}

type LanguageJSONResponse = {
  detected_language: string;
  language_name: string;
  retrieval_query: string;
  confidence: "high" | "medium" | "low";
};

function parseLanguageJSON(text: string): LanguageJSONResponse | null {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]) as unknown;
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      typeof (parsed as Record<string, unknown>).detected_language !== "string" ||
      typeof (parsed as Record<string, unknown>).language_name !== "string" ||
      typeof (parsed as Record<string, unknown>).retrieval_query !== "string" ||
      !["high", "medium", "low"].includes(
        (parsed as Record<string, unknown>).confidence as string,
      )
    ) {
      return null;
    }
    return parsed as LanguageJSONResponse;
  } catch {
    return null;
  }
}
