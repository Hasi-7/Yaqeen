import { NextResponse } from "next/server";
import { compareAllRulings, generateSingleAnswer } from "@/lib/answer";
import { isMarjaId } from "@/lib/marja";

type AskRequestBody = {
  question?: unknown;
  marja?: unknown;
  marja_id?: unknown;
};

export async function POST(request: Request) {
  let body: AskRequestBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const question = typeof body.question === "string" ? body.question.trim() : "";
  const marja = body.marja ?? body.marja_id;

  if (!question) {
    return NextResponse.json({ error: "Question is required." }, { status: 400 });
  }

  if (marja === "all") {
    return NextResponse.json(compareAllRulings(question));
  }

  if (!isMarjaId(marja)) {
    return NextResponse.json({ error: "Invalid marja. Use sistani, khamenei, shirazi, or all." }, { status: 400 });
  }

  return NextResponse.json(generateSingleAnswer(question, marja));
}
