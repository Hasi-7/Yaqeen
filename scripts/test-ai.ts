import assert from "node:assert/strict";
import { generateAnswer } from "../src/lib/ai/generate-answer";
import { POST } from "../src/app/api/ask/route";
import { loadRulings } from "../src/lib/data";
import { retrieveRulings } from "../src/lib/retriever";
import { ollamaTimeoutMs } from "../src/lib/ai/provider";
import type { AskResponse } from "../src/lib/types";

type EnvSnapshot = Record<string, string | undefined>;

const ENV_KEYS = [
  "YAQEEN_AI_ENABLED",
  "YAQEEN_AI_PROVIDER",
  "YAQEEN_AI_MODEL",
  "YAQEEN_MOCK_AI_RESPONSE",
  "YAQEEN_SUPPRESS_AI_ERRORS",
  "OPENAI_API_KEY",
  "OLLAMA_BASE_URL",
  "OLLAMA_TIMEOUT_MS",
];

const originalEnv = snapshotEnv();

async function main() {
  const { records } = await loadRulings();
  const retrievedRecords = retrieveRulings(records, "What breaks wudhu?", "sistani");
  assert.ok(retrievedRecords.length > 0, "Expected retrieval fixture to find a Sistani wudhu record.");

  await testMockProviderReturnsAnswer(retrievedRecords);
  await testMissingProviderFallsBack(retrievedRecords);
  await testProviderErrorFallsBack(retrievedRecords);
  await testSuspiciousCitationFallsBack(retrievedRecords);
  await testAiNotFoundIsPreserved(retrievedRecords);
  await testSupportedCitationTextFallsBack(retrievedRecords);
  await testApiFoundSingleWithMock();
  await testApiDisabledFallback();
  await testNotFoundDoesNotCallAi();
  await testCompareAllUsesSeparateFoundAnswers();
  await testInvalidRequests();
  await testOversizedQuestion();
  await testOllamaTimeoutIsConfigurable();
  await testFallbackReasonAiDisabled(retrievedRecords);
  await testFallbackReasonProviderError(retrievedRecords);
  await testFallbackReasonOllamaTimeout(retrievedRecords);
  await testApiFallbackReasonPresentOnDisabled();
  await testApiFallbackReasonNullOnSuccess();

  restoreEnv(originalEnv);
  console.log("PASS AI/provider/API tests");
}

async function testMockProviderReturnsAnswer(retrievedRecords: ReturnType<typeof retrieveRulings>) {
  setEnv({
    YAQEEN_AI_ENABLED: "true",
    YAQEEN_AI_PROVIDER: "mock",
    YAQEEN_MOCK_AI_RESPONSE: "Mock AI answer.",
  });

  const generated = await generateAnswer({
    question: "What breaks wudhu?",
    marjaId: "sistani",
    marjaName: "Sayyid Ali al-Sistani",
    retrievedRecords,
  });

  assert.equal(generated.answer, "Mock AI answer.");
  assert.equal(generated.answer_mode, "ai");
  assert.equal(generated.ai_provider, "mock");
}

async function testMissingProviderFallsBack(retrievedRecords: ReturnType<typeof retrieveRulings>) {
  setEnv({ YAQEEN_AI_ENABLED: "false", YAQEEN_AI_PROVIDER: undefined, YAQEEN_MOCK_AI_RESPONSE: undefined });

  const generated = await generateAnswer({
    question: "What breaks wudhu?",
    marjaId: "sistani",
    marjaName: "Sayyid Ali al-Sistani",
    retrievedRecords,
  });

  assert.equal(generated.answer_mode, "deterministic_fallback");
  assert.equal(generated.ai_provider, "none");
  assert.match(generated.answer, /Based on the retrieved source/);
}

async function testProviderErrorFallsBack(retrievedRecords: ReturnType<typeof retrieveRulings>) {
  setEnv({
    YAQEEN_AI_ENABLED: "true",
    YAQEEN_AI_PROVIDER: "mock",
    YAQEEN_MOCK_AI_RESPONSE: "__throw__",
    YAQEEN_SUPPRESS_AI_ERRORS: "true",
  });

  const generated = await generateAnswer({
    question: "What breaks wudhu?",
    marjaId: "sistani",
    marjaName: "Sayyid Ali al-Sistani",
    retrievedRecords,
  });

  assert.equal(generated.answer_mode, "deterministic_fallback");
  assert.equal(generated.ai_provider, "mock");
}

async function testSuspiciousCitationFallsBack(retrievedRecords: ReturnType<typeof retrieveRulings>) {
  setEnv({
    YAQEEN_AI_ENABLED: "true",
    YAQEEN_AI_PROVIDER: "mock",
    YAQEEN_MOCK_AI_RESPONSE: "The answer is yes.\n\nSources: made-up source at https://example.com",
  });

  const generated = await generateAnswer({
    question: "What breaks wudhu?",
    marjaId: "sistani",
    marjaName: "Sayyid Ali al-Sistani",
    retrievedRecords,
  });

  assert.equal(generated.answer_mode, "deterministic_fallback");
  assert.doesNotMatch(generated.answer, /Sources:/i);
}

async function testAiNotFoundIsPreserved(retrievedRecords: ReturnType<typeof retrieveRulings>) {
  setEnv({
    YAQEEN_AI_ENABLED: "true",
    YAQEEN_AI_PROVIDER: "mock",
    YAQEEN_MOCK_AI_RESPONSE: "Not Found in the current verified dataset.",
  });

  const generated = await generateAnswer({
    question: "What breaks wudhu?",
    marjaId: "sistani",
    marjaName: "Sayyid Ali al-Sistani",
    retrievedRecords,
  });

  assert.equal(generated.answer, "Not Found in the current verified dataset.");
  assert.equal(generated.answer_mode, "not_found");
}

async function testSupportedCitationTextFallsBack(retrievedRecords: ReturnType<typeof retrieveRulings>) {
  setEnv({
    YAQEEN_AI_ENABLED: "true",
    YAQEEN_AI_PROVIDER: "mock",
    YAQEEN_MOCK_AI_RESPONSE: "According to Islamic Laws, ruling 322, seven things invalidate wudhu.",
  });

  const generated = await generateAnswer({
    question: "What breaks wudhu?",
    marjaId: "sistani",
    marjaName: "Sayyid Ali al-Sistani",
    retrievedRecords,
  });

  assert.equal(generated.answer_mode, "deterministic_fallback");
  assert.doesNotMatch(generated.answer, /^According to Islamic Laws/i);
}

async function testApiFoundSingleWithMock() {
  setEnv({
    YAQEEN_AI_ENABLED: "true",
    YAQEEN_AI_PROVIDER: "mock",
    YAQEEN_MOCK_AI_RESPONSE: "Mock API answer.",
  });

  const payload = await ask({ question: "What breaks wudhu?", marja_id: "sistani" });
  assert.equal(payload.status, "found");
  assert.equal(payload.mode, "single");
  assert.equal(payload.answer, "Mock API answer.");
  assert.equal(payload.answer_mode, "ai");
  assert.equal(payload.ai_provider, "mock");
  assert.ok("sources" in payload && payload.sources.length > 0);
  assert.ok(payload.disclaimer);
}

async function testApiDisabledFallback() {
  setEnv({ YAQEEN_AI_ENABLED: "false", YAQEEN_AI_PROVIDER: undefined, YAQEEN_MOCK_AI_RESPONSE: undefined });

  const payload = await ask({ question: "What breaks wudhu?", marja: "sistani" });
  assert.equal(payload.status, "found");
  assert.equal(payload.answer_mode, "deterministic_fallback");
  assert.equal(payload.ai_provider, "none");
  assert.ok(payload.disclaimer);
}

async function testNotFoundDoesNotCallAi() {
  setEnv({
    YAQEEN_AI_ENABLED: "true",
    YAQEEN_AI_PROVIDER: "mock",
    YAQEEN_MOCK_AI_RESPONSE: "__throw__",
  });

  const payload = await ask({ question: "Can I trade cryptocurrency options?", marja_id: "sistani" });
  assert.equal(payload.status, "not_found");
  assert.equal(payload.answer_mode, "not_found");
  assert.ok("sources" in payload && payload.sources.length === 0);
  assert.ok(payload.disclaimer);
}

async function testCompareAllUsesSeparateFoundAnswers() {
  setEnv({
    YAQEEN_AI_ENABLED: "true",
    YAQEEN_AI_PROVIDER: "mock",
    YAQEEN_MOCK_AI_RESPONSE: "Mock compare answer.",
  });

  const payload = await ask({ question: "What breaks wudhu?", marja_id: "all" });
  assert.equal(payload.mode, "compare_all");

  if (payload.mode !== "compare_all") {
    throw new Error("Expected compare_all response.");
  }

  const foundResults = payload.results.filter((result) => result.status === "found");
  assert.ok(foundResults.length >= 2);
  assert.ok(foundResults.every((result) => result.answer === "Mock compare answer."));
  assert.ok(foundResults.every((result) => result.answer_mode === "ai"));
  assert.ok(foundResults.every((result) => result.sources.length > 0));
  assert.ok(payload.disclaimer);
}

async function testInvalidRequests() {
  const invalidMarja = await rawAsk({ question: "What breaks wudhu?", marja_id: "invalid" });
  assert.equal(invalidMarja.status, 400);

  const emptyQuestion = await rawAsk({ question: "", marja_id: "sistani" });
  assert.equal(emptyQuestion.status, 400);
}

async function testOversizedQuestion() {
  const response = await rawAsk({ question: "x".repeat(501), marja_id: "sistani" });
  assert.equal(response.status, 400);
}

async function testOllamaTimeoutIsConfigurable() {
  setEnv({ OLLAMA_TIMEOUT_MS: "45000" });
  assert.equal(ollamaTimeoutMs(), 45000, "Should read custom timeout from OLLAMA_TIMEOUT_MS");

  setEnv({ OLLAMA_TIMEOUT_MS: undefined });
  assert.equal(ollamaTimeoutMs(), 60000, "Should default to 60000ms when OLLAMA_TIMEOUT_MS is unset");

  setEnv({ OLLAMA_TIMEOUT_MS: "not-a-number" });
  assert.equal(ollamaTimeoutMs(), 60000, "Should default to 60000ms when OLLAMA_TIMEOUT_MS is invalid");
}

async function testFallbackReasonAiDisabled(retrievedRecords: ReturnType<typeof retrieveRulings>) {
  setEnv({ YAQEEN_AI_ENABLED: "false", YAQEEN_AI_PROVIDER: undefined });

  const generated = await generateAnswer({
    question: "What breaks wudhu?",
    marjaId: "sistani",
    marjaName: "Sayyid Ali al-Sistani",
    retrievedRecords,
  });

  assert.equal(generated.answer_mode, "deterministic_fallback");
  assert.equal(generated.fallback_reason, "ai_disabled");
}

async function testFallbackReasonProviderError(retrievedRecords: ReturnType<typeof retrieveRulings>) {
  setEnv({
    YAQEEN_AI_ENABLED: "true",
    YAQEEN_AI_PROVIDER: "mock",
    YAQEEN_MOCK_AI_RESPONSE: "__throw__",
    YAQEEN_SUPPRESS_AI_ERRORS: "true",
  });

  const generated = await generateAnswer({
    question: "What breaks wudhu?",
    marjaId: "sistani",
    marjaName: "Sayyid Ali al-Sistani",
    retrievedRecords,
  });

  assert.equal(generated.answer_mode, "deterministic_fallback");
  assert.equal(generated.fallback_reason, "ai_provider_error");
}

async function testFallbackReasonOllamaTimeout(retrievedRecords: ReturnType<typeof retrieveRulings>) {
  setEnv({
    YAQEEN_AI_ENABLED: "true",
    YAQEEN_AI_PROVIDER: "mock",
    YAQEEN_MOCK_AI_RESPONSE: "__abort__",
    YAQEEN_SUPPRESS_AI_ERRORS: "true",
  });

  const generated = await generateAnswer({
    question: "What breaks wudhu?",
    marjaId: "sistani",
    marjaName: "Sayyid Ali al-Sistani",
    retrievedRecords,
  });

  // Provider is "mock" (not "ollama") so classifyError returns "ai_provider_error"
  // even though the error type is AbortError. This verifies the classification
  // correctly distinguishes between provider identity and error type.
  assert.equal(generated.answer_mode, "deterministic_fallback");
  assert.equal(generated.fallback_reason, "ai_provider_error");
}

async function testApiFallbackReasonPresentOnDisabled() {
  setEnv({ YAQEEN_AI_ENABLED: "false", YAQEEN_AI_PROVIDER: undefined, YAQEEN_MOCK_AI_RESPONSE: undefined });

  const payload = await ask({ question: "What breaks wudhu?", marja_id: "sistani" });
  assert.equal(payload.status, "found");
  assert.equal(payload.answer_mode, "deterministic_fallback");
  assert.ok("fallback_reason" in payload, "API response should include fallback_reason");
  assert.equal(payload.fallback_reason, "ai_disabled");
}

async function testApiFallbackReasonNullOnSuccess() {
  setEnv({
    YAQEEN_AI_ENABLED: "true",
    YAQEEN_AI_PROVIDER: "mock",
    YAQEEN_MOCK_AI_RESPONSE: "Mock AI answer.",
  });

  const payload = await ask({ question: "What breaks wudhu?", marja_id: "sistani" });
  assert.equal(payload.status, "found");
  assert.equal(payload.answer_mode, "ai");
  assert.equal(payload.fallback_reason, null, "fallback_reason should be null on successful AI answer");
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

function snapshotEnv(): EnvSnapshot {
  return Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));
}

function setEnv(values: EnvSnapshot) {
  for (const key of ENV_KEYS) {
    const value = values[key];
    if (typeof value === "undefined") {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}

function restoreEnv(snapshot: EnvSnapshot) {
  setEnv(snapshot);
}

main().catch((error) => {
  restoreEnv(originalEnv);
  console.error(error);
  process.exitCode = 1;
});
