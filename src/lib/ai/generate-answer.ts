import { NOT_FOUND_MESSAGE, type MarjaId } from "@/lib/types";
import type { RetrievedRuling } from "@/lib/retriever";
import { buildSourcePacket, YAQEEN_SYSTEM_PROMPT } from "./prompt";
import { getAIProvider } from "./provider";
import type { AIProviderName, FallbackReason, GeneratedAnswer } from "./types";

type GenerateAnswerInput = {
  question: string;
  marjaId: MarjaId;
  marjaName: string;
  retrievedRecords: RetrievedRuling[];
};

const NOT_FOUND_EXACT = "Not Found in the current verified dataset.";

export async function generateAnswer({
  question,
  marjaName,
  retrievedRecords,
}: GenerateAnswerInput): Promise<GeneratedAnswer> {
  if (retrievedRecords.length === 0) {
    return {
      answer: NOT_FOUND_MESSAGE,
      answer_mode: "not_found",
      ai_provider: "none",
      ai_model: null,
      fallback_reason: null,
    };
  }

  const provider = getAIProvider();

  if (!provider) {
    return fallbackAnswer(marjaName, retrievedRecords, "none", null, "ai_disabled");
  }

  try {
    const records = retrievedRecords.map((match) => match.record);
    const result = await provider.complete({
      messages: [
        { role: "system", content: YAQEEN_SYSTEM_PROMPT },
        {
          role: "user",
          content: buildSourcePacket({ question, marjaName, records }),
        },
      ],
      temperature: 0,
      maxTokens: 350,
    });

    const validatedText = validateAIText(result.text, records.map((record) => ({
      citationLabel: record.citation_label,
      rulingNumber: record.ruling_number ?? null,
      pageNumber: record.page_number ?? null,
      sourceTitle: record.source_title,
    })));

    if (!validatedText) {
      return fallbackAnswer(marjaName, retrievedRecords, result.provider, result.model, "ai_provider_error");
    }

    if (validatedText === NOT_FOUND_EXACT) {
      return {
        answer: NOT_FOUND_EXACT,
        answer_mode: "not_found",
        ai_provider: result.provider,
        ai_model: result.model,
        fallback_reason: null,
      };
    }

    return {
      answer: validatedText,
      answer_mode: "ai",
      ai_provider: result.provider,
      ai_model: result.model,
      fallback_reason: null,
    };
  } catch (error) {
    if (process.env.YAQEEN_SUPPRESS_AI_ERRORS !== "true") {
      console.error("AI answer generation failed", error);
    }
    const providerName = providerNameFromEnv();
    const fallback_reason = classifyError(error, providerName);
    return fallbackAnswer(marjaName, retrievedRecords, providerName, process.env.YAQEEN_AI_MODEL ?? null, fallback_reason);
  }
}

export function deterministicAnswer(marjaName: string, retrievedRecords: RetrievedRuling[]): string {
  const primary = retrievedRecords[0]?.record;

  if (!primary) {
    return NOT_FOUND_MESSAGE;
  }

  return `Based on the retrieved source for ${marjaName}, the ruling states: "${primary.ruling_text}"`;
}

function fallbackAnswer(
  marjaName: string,
  retrievedRecords: RetrievedRuling[],
  provider: AIProviderName | "none" | null,
  model: string | null,
  fallback_reason: FallbackReason,
): GeneratedAnswer {
  return {
    answer: deterministicAnswer(marjaName, retrievedRecords),
    answer_mode: "deterministic_fallback",
    ai_provider: provider,
    ai_model: model,
    fallback_reason,
  };
}

function classifyError(error: unknown, providerName: string): FallbackReason {
  const isAbort = error instanceof Error && error.name === "AbortError";
  if (providerName === "ollama") {
    return isAbort ? "ollama_timeout" : "ollama_unavailable";
  }
  return "ai_provider_error";
}

type CitationMetadata = {
  citationLabel: string;
  rulingNumber: string | null;
  pageNumber: string | null;
  sourceTitle: string;
};

function validateAIText(text: string, metadata: CitationMetadata[]): string | null {
  const trimmed = text.trim();

  if (!trimmed) {
    return null;
  }

  if (/\n\s*sources?\s*:/i.test(trimmed) || /^sources?\s*:/i.test(trimmed)) {
    return null;
  }

  if (/https?:\/\//i.test(trimmed)) {
    return null;
  }

  if (hasCitationLikeText(trimmed, metadata)) {
    return null;
  }

  return trimmed;
}

function hasCitationLikeText(text: string, metadata: CitationMetadata[]): boolean {
  if (/\b(?:ruling|rule|page|p\.|citation|source|sources)\b/i.test(text)) {
    return true;
  }

  const lowerText = text.toLowerCase();
  return metadata.some((item) => {
    const values = [item.citationLabel, item.rulingNumber, item.pageNumber, item.sourceTitle].filter(Boolean);
    return values.some((value) => lowerText.includes(String(value).toLowerCase()));
  });
}

function providerNameFromEnv(): AIProviderName | "none" {
  const provider = process.env.YAQEEN_AI_PROVIDER;
  return provider === "openai" || provider === "ollama" || provider === "mock" ? provider : "none";
}
