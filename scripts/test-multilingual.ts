import assert from "node:assert/strict";
import { normalizeQuestionForRetrieval } from "../src/lib/ai/language";
import { generateAnswer } from "../src/lib/ai/generate-answer";
import { POST } from "../src/app/api/ask/route";
import { loadRulings } from "../src/lib/data";
import { retrieveRulings } from "../src/lib/retriever";
import { getLocalizedDisclaimer, getLocalizedNotFound, NOT_FOUND_MESSAGE, DISCLAIMER } from "../src/lib/types";
import type { AskResponse, SingleAskResponse, CompareAskResponse } from "../src/lib/types";

type EnvSnapshot = Record<string, string | undefined>;

const ENV_KEYS = [
  "YAQEEN_AI_ENABLED",
  "YAQEEN_AI_PROVIDER",
  "YAQEEN_AI_MODEL",
  "YAQEEN_MOCK_AI_RESPONSE",
  "YAQEEN_SUPPRESS_AI_ERRORS",
];

const originalEnv = snapshotEnv();

async function main() {
  const { records } = await loadRulings();
  const retrievedRecords = retrieveRulings(records, "What breaks wudhu?", "sistani");
  assert.ok(retrievedRecords.length > 0, "Expected retrieval fixture to find a Sistani wudhu record.");

  await testEnglishPassthrough();
  await testUrduTranslation();
  await testRetrievalUsesTranslatedQuery();
  await testAnswerGenerationReceivesLanguage(retrievedRecords);
  await testNotFoundUsesLocalizedMessage(retrievedRecords);
  await testDisclaimerLocalizes();
  await testCompareAllUsesOneTranslatedQuery();
  await testTranslationFailureFallsBackSafely();

  restoreEnv(originalEnv);
  console.log("PASS multilingual tests");
}

// 1. English question returns the same retrieval query
async function testEnglishPassthrough() {
  setEnv({
    YAQEEN_AI_ENABLED: "true",
    YAQEEN_AI_PROVIDER: "mock",
    YAQEEN_MOCK_AI_RESPONSE: '{"detected_language":"en","language_name":"English","retrieval_query":"What breaks wudhu?","confidence":"high"}',
  });

  const info = await normalizeQuestionForRetrieval("What breaks wudhu?");
  assert.equal(info.detected_language, "en");
  assert.equal(info.retrieval_query, "What breaks wudhu?");
  assert.ok(
    info.translation_mode === "passthrough" || info.translation_mode === "fallback_english",
    `Expected passthrough or fallback_english, got: ${info.translation_mode}`,
  );
}

// 2. Urdu question gets translated retrieval query
async function testUrduTranslation() {
  setEnv({
    YAQEEN_AI_ENABLED: "true",
    YAQEEN_AI_PROVIDER: "mock",
    YAQEEN_MOCK_AI_RESPONSE: '{"detected_language":"ur","language_name":"Urdu","retrieval_query":"What breaks wudhu?","confidence":"high"}',
  });

  const info = await normalizeQuestionForRetrieval("وضو کن چیزوں سے ٹوٹتا ہے؟");
  assert.equal(info.detected_language, "ur");
  assert.equal(info.language_name, "Urdu");
  assert.equal(info.retrieval_query, "What breaks wudhu?");
  assert.equal(info.translation_mode, "ai_translated_query");
  assert.equal(info.original_question, "وضو کن چیزوں سے ٹوٹتا ہے؟");
}

// 3. Retrieval uses translated English query
async function testRetrievalUsesTranslatedQuery() {
  setEnv({
    YAQEEN_AI_ENABLED: "true",
    YAQEEN_AI_PROVIDER: "mock",
    YAQEEN_MOCK_AI_RESPONSE: '{"detected_language":"ur","language_name":"Urdu","retrieval_query":"What breaks wudhu?","confidence":"high"}',
  });

  const response = await ask({ question: "وضو کن چیزوں سے ٹوٹتا ہے؟", marja_id: "sistani" });
  const single = response as SingleAskResponse;
  assert.ok(
    single.status === "found" || single.status === "not_found",
    "API should return a valid status",
  );
  assert.equal(single.retrieval_query, "What breaks wudhu?", "retrieval_query should be translated English query");
  assert.equal(single.detected_language, "ur");
}

// 4. Answer generation receives answer language
async function testAnswerGenerationReceivesLanguage(retrievedRecords: ReturnType<typeof retrieveRulings>) {
  setEnv({
    YAQEEN_AI_ENABLED: "true",
    YAQEEN_AI_PROVIDER: "mock",
    YAQEEN_MOCK_AI_RESPONSE: "وضو سات چیزوں سے ٹوٹتا ہے۔",
  });

  const generated = await generateAnswer({
    question: "وضو کن چیزوں سے ٹوٹتا ہے؟",
    retrievalQuery: "What breaks wudhu?",
    answerLanguage: "Urdu",
    detectedLanguage: "ur",
    marjaId: "sistani",
    marjaName: "Sayyid Ali al-Sistani",
    retrievedRecords,
  });

  assert.equal(generated.answer_mode, "ai");
  assert.equal(generated.answer, "وضو سات چیزوں سے ٹوٹتا ہے۔");
}

// 5. Not Found uses localized message
async function testNotFoundUsesLocalizedMessage(retrievedRecords: ReturnType<typeof retrieveRulings>) {
  setEnv({
    YAQEEN_AI_ENABLED: "true",
    YAQEEN_AI_PROVIDER: "mock",
    YAQEEN_MOCK_AI_RESPONSE: "Not Found in the current verified dataset.",
  });

  const generated = await generateAnswer({
    question: "وضو کن چیزوں سے ٹوٹتا ہے؟",
    retrievalQuery: "What breaks wudhu?",
    answerLanguage: "Urdu",
    detectedLanguage: "ur",
    marjaId: "sistani",
    marjaName: "Sayyid Ali al-Sistani",
    retrievedRecords,
  });

  // Should return the Urdu not-found message, not English
  assert.equal(generated.answer_mode, "not_found");
  assert.equal(generated.answer, getLocalizedNotFound("ur"));
  assert.notEqual(generated.answer, NOT_FOUND_MESSAGE);

  // Hardcoded not-found messages
  assert.ok(getLocalizedNotFound("ar").includes("لم يتم"), "Arabic not-found should include Arabic text");
  assert.ok(getLocalizedNotFound("fa").includes("پاسخی یافت"), "Farsi not-found should include Farsi text");
  assert.ok(getLocalizedNotFound("fr").includes("Aucune"), "French not-found should start with French text");
  assert.equal(getLocalizedNotFound("en"), NOT_FOUND_MESSAGE);
  assert.equal(getLocalizedNotFound("unknown"), NOT_FOUND_MESSAGE);
}

// 6. Disclaimer localizes
async function testDisclaimerLocalizes() {
  assert.equal(getLocalizedDisclaimer("en"), DISCLAIMER);
  assert.ok(getLocalizedDisclaimer("ar").includes("الذكاء الاصطناعي"), "Arabic disclaimer should include Arabic text");
  assert.ok(getLocalizedDisclaimer("ur").includes("AI"), "Urdu disclaimer should include AI term");
  assert.ok(getLocalizedDisclaimer("fa").includes("هوش مصنوعی"), "Farsi disclaimer should include Farsi text");
  assert.ok(getLocalizedDisclaimer("fr").includes("IA"), "French disclaimer should include IA term");
  assert.equal(getLocalizedDisclaimer("unknown"), DISCLAIMER, "Unknown language should fall back to English");
}

// 7. Compare All uses one translated query but separate retrieval per marja
async function testCompareAllUsesOneTranslatedQuery() {
  setEnv({
    YAQEEN_AI_ENABLED: "true",
    YAQEEN_AI_PROVIDER: "mock",
    YAQEEN_MOCK_AI_RESPONSE: '{"detected_language":"ar","language_name":"Arabic","retrieval_query":"What breaks wudhu?","confidence":"high"}',
  });

  const response = (await ask({ question: "ما الذي يبطل الوضوء؟", marja_id: "all" })) as CompareAskResponse;
  assert.equal(response.mode, "compare_all");
  assert.equal(response.detected_language, "ar");
  assert.equal(response.retrieval_query, "What breaks wudhu?");
  assert.equal(response.translation_mode, "ai_translated_query");
  assert.ok(Array.isArray(response.results), "Compare all should have results array");
  assert.ok(response.results.length > 0, "Compare all should have at least one result");
  // Each result should have an answer_language
  for (const result of response.results) {
    assert.equal(result.answer_language, "ar", "Each marja result should have answer_language");
  }
}

// 8. If translation fails, app falls back safely (AI unavailable)
async function testTranslationFailureFallsBackSafely() {
  setEnv({
    YAQEEN_AI_ENABLED: "false",
    YAQEEN_AI_PROVIDER: undefined,
    YAQEEN_MOCK_AI_RESPONSE: undefined,
  });

  // normalizeQuestionForRetrieval should return English fallback
  const info = await normalizeQuestionForRetrieval("وضو کن چیزوں سے ٹوٹتا ہے؟");
  assert.equal(info.detected_language, "en");
  assert.equal(info.retrieval_query, "وضو کن چیزوں سے ٹوٹتا ہے؟");
  assert.equal(info.translation_mode, "fallback_english");

  // Full API call should also succeed without error
  const response = await ask({ question: "What breaks wudhu?", marja_id: "sistani" });
  assert.ok(response.status === "found" || response.status === "not_found");
}

async function ask(body: Record<string, unknown>): Promise<AskResponse> {
  const response = await POST(
    new Request("http://localhost/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
  assert.equal(response.status, 200);
  return (await response.json()) as AskResponse;
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
