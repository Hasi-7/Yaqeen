import assert from "node:assert/strict";
import rulings from "../data/rulings.json";
import { POST } from "../src/app/api/ask/route";
import type { AskResponse } from "../src/lib/types";

const citationLabels = new Set((rulings as Array<{ citation_label: string }>).map((record) => record.citation_label));

async function main() {
  process.env.YAQEEN_AI_ENABLED = "false";
  delete process.env.YAQEEN_EMBEDDINGS_ENABLED;

  await testSingleFound();
  await testNotFound();
  await testCompareAll();
  await testInvalidMarja();
  await testEmptyQuestion();

  console.log("PASS API route tests");
}

async function testSingleFound() {
  const payload = await ask({ question: "What breaks wudhu?", marja_id: "sistani" });
  assert.equal(payload.mode, "single");
  assert.equal(payload.status, "found");
  assert.ok(payload.sources.length > 0);
  assert.ok(payload.disclaimer);
  assert.ok(payload.sources.every((source) => citationLabels.has(source.citation_label)));
}

async function testNotFound() {
  const payload = await ask({ question: "Can I trade cryptocurrency options?", marja_id: "sistani" });
  assert.equal(payload.mode, "single");
  assert.equal(payload.status, "not_found");
  assert.match(payload.answer, /Not Found/);
  assert.deepEqual(payload.sources, []);
  assert.ok(payload.disclaimer);
}

async function testCompareAll() {
  const payload = await ask({ question: "What breaks wudhu?", marja_id: "all" });
  assert.equal(payload.mode, "compare_all");

  if (payload.mode !== "compare_all") {
    throw new Error("Expected compare_all response");
  }

  assert.equal(payload.results.length, 3);
  assert.ok(payload.disclaimer);
  assert.ok(payload.results.every((result) => result.status === "not_found" || result.sources.every((source) => citationLabels.has(source.citation_label))));
}

async function testInvalidMarja() {
  const response = await rawAsk({ question: "What breaks wudhu?", marja_id: "invalid" });
  assert.equal(response.status, 400);
}

async function testEmptyQuestion() {
  const response = await rawAsk({ question: "", marja_id: "sistani" });
  assert.equal(response.status, 400);
}

async function ask(body: Record<string, unknown>): Promise<AskResponse> {
  const response = await rawAsk(body);
  assert.equal(response.status, 200);
  return (await response.json()) as AskResponse;
}

async function rawAsk(body: Record<string, unknown>): Promise<Response> {
  return POST(new Request("http://localhost/api/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
