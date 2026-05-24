import { NextResponse } from "next/server";
import { dedupeCitations } from "@/lib/citations";
import { loadRulings } from "@/lib/data";
import { generateAnswerWithLocalAi } from "@/lib/local-ai";
import { MARAJI, MARJA_ORDER } from "@/lib/maraji";
import { retrieveForAllMaraji, retrieveRulings } from "@/lib/retriever";
import {
  DISCLAIMER,
  NOT_FOUND_MESSAGE,
  type AskMarjaId,
  type AskResponse,
  type MarjaId,
  type ResponseDiagnostics,
} from "@/lib/types";

type AskRequest = {
  question?: unknown;
  marja_id?: unknown;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as AskRequest | null;
  const question = typeof body?.question === "string" ? body.question.trim() : "";
  const marjaId = typeof body?.marja_id === "string" ? body.marja_id : "";

  if (!question || !isAskMarjaId(marjaId)) {
    return NextResponse.json(
      {
        error: "Request must include a question and marja_id of sistani, khamenei, shirazi, or all.",
      },
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
  const matches = retrieveRulings(records, question, marjaId);
  const matchedRecords = matches.map((match) => match.record);

  if (matchedRecords.length === 0) {
    return {
      status: "not_found",
      mode: "single",
      answer: NOT_FOUND_MESSAGE,
      sources: [],
      disclaimer: DISCLAIMER,
      diagnostics: {
        datasetLoaded,
        recordCount: records.length,
        localAiMode: "skipped_no_sources",
      },
    };
  }

  const generated = await generateAnswerWithLocalAi(question, matchedRecords);

  return {
    status: "found",
    mode: "single",
    answer: generated.answer,
    sources: dedupeCitations(matchedRecords),
    disclaimer: DISCLAIMER,
    diagnostics: {
      datasetLoaded,
      recordCount: records.length,
      localAiMode: generated.mode,
    },
  };
}

async function answerCompareAll(
  question: string,
  records: Awaited<ReturnType<typeof loadRulings>>["records"],
  datasetLoaded: boolean,
): Promise<AskResponse> {
  let localAiMode: ResponseDiagnostics["localAiMode"] = "skipped_no_sources";
  const retrievals = retrieveForAllMaraji(records, question);

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
        };
      }

      const generated = await generateAnswerWithLocalAi(question, matchedRecords);
      localAiMode = generated.mode;

      return {
        marja_id: marjaId,
        marja_name: MARAJI[marjaId].name,
        status: "found" as const,
        answer: generated.answer,
        sources: dedupeCitations(matchedRecords),
      };
    }),
  );

  const foundCount = results.filter((result) => result.status === "found").length;

  return {
    status: foundCount > 0 ? "found" : "not_found",
    mode: "compare_all",
    results,
    comparison_summary:
      foundCount > 1
        ? "Review each marja's cited source separately. Differences should only be stated where the retrieved sources directly support them."
        : "Not enough verified sources were found to summarize a supported difference.",
    disclaimer: DISCLAIMER,
    diagnostics: {
      datasetLoaded,
      recordCount: records.length,
      localAiMode,
    },
  };
}

function isAskMarjaId(value: string): value is AskMarjaId {
  return value === "all" || MARJA_ORDER.includes(value as MarjaId);
}
