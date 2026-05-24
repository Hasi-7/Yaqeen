import { NextResponse } from "next/server";
import { generateAnswer } from "@/lib/ai/generate-answer";
import { dedupeCitations } from "@/lib/citations";
import { loadRulings } from "@/lib/data";
import { MARAJI, MARJA_ORDER } from "@/lib/maraji";
import { hybridSearchRulings } from "@/lib/retrieval/hybrid-search";
import {
  DISCLAIMER,
  NOT_FOUND_MESSAGE,
  type AskMarjaId,
  type AskResponse,
  type MarjaId,
} from "@/lib/types";

type AskRequest = {
  question?: unknown;
  marja?: unknown;
  marja_id?: unknown;
};

const MAX_QUESTION_LENGTH = 500;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as AskRequest | null;
  const question = typeof body?.question === "string" ? body.question.trim() : "";
  const requestedMarja = body?.marja_id ?? body?.marja;
  const marjaId = typeof requestedMarja === "string" ? requestedMarja : "";

  if (!question || !isAskMarjaId(marjaId)) {
    return NextResponse.json(
      {
        error: "Request must include a question and marja_id of sistani, khamenei, shirazi, or all.",
      },
      { status: 400 },
    );
  }

  if (question.length > MAX_QUESTION_LENGTH) {
    return NextResponse.json(
      { error: `Question must be ${MAX_QUESTION_LENGTH} characters or fewer.` },
      { status: 400 },
    );
  }

  const { records, datasetLoaded } = await loadRulings();

  if (marjaId === "all") {
    const response = await answerCompareAll(question, records, datasetLoaded);
    return NextResponse.json(response);
  }

  const response = await answerSingle(question, marjaId, records, datasetLoaded);
  return NextResponse.json(response);
}

async function answerSingle(
  question: string,
  marjaId: MarjaId,
  records: Awaited<ReturnType<typeof loadRulings>>["records"],
  datasetLoaded: boolean,
): Promise<AskResponse> {
  const matches = await hybridSearchRulings(records, question, marjaId);
  const matchedRecords = matches.map((match) => match.record);

  if (matchedRecords.length === 0) {
    return {
      status: "not_found",
      mode: "single",
      answer: NOT_FOUND_MESSAGE,
      sources: [],
      disclaimer: DISCLAIMER,
      answer_mode: "not_found",
      ai_provider: "none",
      ai_model: null,
      fallback_reason: null,
      diagnostics: {
        datasetLoaded,
        recordCount: records.length,
        localAiMode: "skipped_no_sources",
      },
    };
  }

  const generated = await generateAnswer({
    question,
    marjaId,
    marjaName: MARAJI[marjaId].name,
    retrievedRecords: matches,
  });

  return {
    status: "found",
    mode: "single",
    answer: generated.answer,
    sources: dedupeCitations(matchedRecords),
    disclaimer: DISCLAIMER,
    answer_mode: generated.answer_mode,
    ai_provider: generated.ai_provider,
    ai_model: generated.ai_model,
    fallback_reason: generated.fallback_reason,
    diagnostics: {
      datasetLoaded,
      recordCount: records.length,
      localAiMode: generated.answer_mode,
    },
  };
}

async function answerCompareAll(
  question: string,
  records: Awaited<ReturnType<typeof loadRulings>>["records"],
  datasetLoaded: boolean,
): Promise<AskResponse> {
  const retrievals = await Promise.all(
    MARJA_ORDER.map(async (marjaId) => ({
      marjaId,
      matches: await hybridSearchRulings(records, question, marjaId),
    })),
  );

  const results = await Promise.all(
    retrievals.map(async ({ marjaId, matches }) => {
      const matchedRecords = matches.map((match) => match.record);

      if (matchedRecords.length === 0) {
        return {
          marja_id: marjaId,
          marja_name: MARAJI[marjaId].name,
          status: "not_found" as const,
          answer: "Not Found in the current verified dataset.",
          sources: [],
          answer_mode: "not_found" as const,
          ai_provider: "none" as const,
          ai_model: null,
          fallback_reason: null,
        };
      }

      const generated = await generateAnswer({
        question,
        marjaId,
        marjaName: MARAJI[marjaId].name,
        retrievedRecords: matches,
      });
      return {
        marja_id: marjaId,
        marja_name: MARAJI[marjaId].name,
        status: "found" as const,
        answer: generated.answer,
        sources: dedupeCitations(matchedRecords),
        answer_mode: generated.answer_mode,
        ai_provider: generated.ai_provider,
        ai_model: generated.ai_model,
        fallback_reason: generated.fallback_reason,
      };
    }),
  );

  const foundCount = results.filter((result) => result.status === "found").length;
  const foundResults = results.filter((result) => result.status === "found");
  const responseAnswerMode = summarizeAnswerMode(foundResults.map((result) => result.answer_mode));
  const responseProviders = new Set(foundResults.map((result) => result.ai_provider));
  const responseModels = new Set(foundResults.map((result) => result.ai_model).filter(Boolean));

  return {
    status: foundCount > 0 ? "found" : "not_found",
    mode: "compare_all",
    results,
    comparison_summary:
      foundCount > 1
        ? "Review each marja's cited source separately. Differences should only be stated where the retrieved sources directly support them."
        : "Not enough verified sources were found to summarize a supported difference.",
    disclaimer: DISCLAIMER,
    answer_mode: responseAnswerMode,
    ai_provider: responseProviders.size === 1 ? foundResults[0]?.ai_provider ?? "none" : null,
    ai_model: responseModels.size === 1 ? foundResults[0]?.ai_model ?? null : null,
    diagnostics: {
      datasetLoaded,
      recordCount: records.length,
      localAiMode: foundCount > 0 ? responseAnswerMode : "skipped_no_sources",
    },
  };
}

function summarizeAnswerMode(modes: Array<"ai" | "deterministic_fallback" | "not_found" | undefined>) {
  const foundModes = modes.filter(Boolean);

  if (foundModes.length === 0) {
    return "not_found";
  }

  if (foundModes.includes("deterministic_fallback")) {
    return "deterministic_fallback";
  }

  if (foundModes.includes("not_found")) {
    return "not_found";
  }

  return "ai";
}

function isAskMarjaId(value: string): value is AskMarjaId {
  return value === "all" || MARJA_ORDER.includes(value as MarjaId);
}
