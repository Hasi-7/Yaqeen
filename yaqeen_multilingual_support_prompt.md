# Add Multilingual Query Translation + Same-Language Answers to Yaqeen

You are extending Yaqeen so users can ask fiqh questions in languages other than English and receive answers in the same language.

Yaqeen currently has:
- `data/rulings.json` as the exact-source English dataset
- `/api/ask`
- marja-specific retrieval
- Compare All retrieval
- AI provider layer
- deterministic fallback
- backend-generated citations
- source cards
- Not Found behavior

Your task is to add multilingual support safely.

---

## Core Principle

Do not modify `ruling_text` in `data/rulings.json`.

The dataset remains exact-source wording.

Translation is runtime-only.

Architecture:

```txt
user question in any supported language
  → detect language
  → translate question to English for retrieval
  → retrieve verified English source records
  → generate answer in original user language using retrieved records only
  → attach backend citations
```

---

## Supported Languages for MVP

Support at least:

```txt
English
Arabic
Urdu
Farsi/Persian
French
```

If language detection is uncertain, default to English.

---

## Required Environment Support

Use the existing AI provider layer. Do not add a separate translation API unless needed.

The same provider can perform:

1. language detection
2. query translation
3. answer generation

Preserve support for:

- anthropic
- openai
- ollama
- mock
- none

If AI provider is unavailable, fall back to English keyword retrieval using the original query and deterministic English answer.

---

## Files to Inspect First

Read:

```txt
src/app/api/ask/route.ts
src/lib/ai/*
src/lib/retrieval/*
src/lib/types.ts
src/components/YaqeenApp.tsx
data/rulings.json
README.md
package.json
```

Do not rewrite the architecture. Patch the existing pipeline.

---

## Add New Module

Create:

```txt
src/lib/ai/language.ts
```

or similar.

Implement:

```ts
export type LanguageInfo = {
  detected_language: string; // ISO-like code: en, ar, ur, fa, fr, unknown
  language_name: string;
  retrieval_query: string;
  original_question: string;
  confidence: "high" | "medium" | "low";
};
```

Implement:

```ts
normalizeQuestionForRetrieval(question: string): Promise<LanguageInfo>
```

Behavior:

- If question appears English, return it unchanged.
- If non-English and AI provider is available, ask provider to translate the question to English.
- Keep the original question.
- Return detected language.
- If translation fails, return original question and `detected_language: "unknown"`.

---

## Language Detection / Translation Prompt

Use a strict JSON prompt.

System:

```txt
You convert user questions into English retrieval queries for a source-grounded Shia fiqh assistant.

Return only valid JSON.
Do not answer the religious question.
Do not provide a ruling.
Do not add explanation.
Only detect the language and translate the user's question into a concise English search query.
Preserve religious terms such as wudhu, ghusl, khums, zakat, qiblah, najis, fasting, prayer, marja, taqlid, hijab, music, marriage.
```

User:

```txt
Question:
"{question}"

Return JSON in this exact shape:
{
  "detected_language": "en|ar|ur|fa|fr|unknown",
  "language_name": "English|Arabic|Urdu|Farsi|French|Unknown",
  "retrieval_query": "English query for retrieval",
  "confidence": "high|medium|low"
}
```

Validate the JSON. If invalid, fall back safely.

---

## API Flow Change

Patch `/api/ask`.

Current:

```txt
question → retrieval → answer
```

New:

```txt
question
  → normalizeQuestionForRetrieval(question)
  → retrieval using languageInfo.retrieval_query
  → answer generation using original question + detected language + retrieved records
```

Important:

- Retrieval uses English `retrieval_query`.
- The response answer should be in the original detected language where possible.
- Citations remain backend-generated and do not need translation.
- Source card metadata can remain English for MVP.

---

## Answer Generation Change

Update `generateAnswer(...)` to accept optional language info:

```ts
{
  question: string;
  retrievalQuery: string;
  answerLanguage: string;
  detectedLanguage: string;
  marjaId: string;
  marjaName: string;
  retrievedRecords: RetrievedRuling[];
}
```

Update the answer prompt:

```txt
Original user question:
{original question}

English retrieval query:
{retrieval query}

Answer language:
{language name}

Retrieved source records:
...

Task:
Write a short, practical answer in {language name}.
Use only the retrieved source records.
Do not use outside knowledge.
Do not invent citations.
Do not include a separate source list; the backend will attach citations.
If the retrieved sources do not answer the question, say the Not Found message in {language name}.
```

---

## Deterministic Fallback

If AI is unavailable:

- keep existing deterministic fallback.
- It may be English only.
- Set:

```json
"answer_language": "en",
"translation_mode": "fallback_english"
```

If AI is available but answer generation fails:

- deterministic fallback is acceptable.
- Do not attempt unsafe translation unless using the source-constrained provider.

---

## Not Found Message Translation

If AI provider is available, translate Not Found into user language.

If unavailable, use English fallback:

```txt
Not Found in the current verified dataset. Please consult the marja's official Q&A platform, official office, or a local representative.
```

For MVP, hardcode these translations if faster.

Arabic:

```txt
لم يتم العثور على جواب في قاعدة البيانات الموثقة الحالية. يُرجى الرجوع إلى القنوات الرسمية للمرجع أو ممثله المحلي.
```

Urdu:

```txt
موجودہ تصدیق شدہ ڈیٹاسیٹ میں جواب نہیں ملا۔ براہِ کرم مرجع کے سرکاری ذرائع یا مقامی نمائندے سے رجوع کریں۔
```

Farsi:

```txt
در مجموعه دادهٔ تأییدشدهٔ فعلی پاسخی یافت نشد. لطفاً به راه‌های رسمی دفتر مرجع یا نمایندهٔ محلی مراجعه کنید.
```

French:

```txt
Aucune réponse n’a été trouvée dans l’ensemble de données vérifié actuel. Veuillez consulter les canaux officiels du marja ou un représentant local.
```

---

## Disclaimer Translation

Add localized disclaimers.

English:

```txt
This tool retrieves rulings from published sources using AI and is not a replacement for contacting your marja's office.
```

Arabic:

```txt
تسترجع هذه الأداة الأحكام من مصادر منشورة باستخدام الذكاء الاصطناعي، وهي ليست بديلاً عن التواصل مع مكتب المرجع.
```

Urdu:

```txt
یہ ٹول شائع شدہ ذرائع سے AI کے ذریعے احکام تلاش کرتا ہے، اور یہ آپ کے مرجع کے دفتر سے رابطہ کرنے کا متبادل نہیں ہے۔
```

Farsi:

```txt
این ابزار با استفاده از هوش مصنوعی احکام را از منابع منتشرشده بازیابی می‌کند و جایگزین تماس با دفتر مرجع شما نیست.
```

French:

```txt
Cet outil récupère des avis juridiques depuis des sources publiées à l’aide de l’IA et ne remplace pas le contact avec le bureau de votre marja.
```

Use detected language to choose the disclaimer.

---

## Response Shape

Add optional fields:

```json
{
  "detected_language": "ur",
  "answer_language": "ur",
  "retrieval_query": "What breaks wudhu?",
  "translation_mode": "ai_translated_query"
}
```

For Compare All, include these top-level fields too.

Each marja result may also include:

```json
{
  "answer_language": "ur"
}
```

---

## Frontend Changes

Update `YaqeenApp.tsx` to show small metadata:

```txt
Language: Urdu
Retrieval query: What breaks wudhu?
```

Make it subtle, not prominent.

Ensure Arabic, Urdu, and Farsi render properly:

- Use normal Unicode.
- Use `dir="auto"` on the question input and answer containers.

Example:

```tsx
<div dir="auto">{answer}</div>
```

---

## Tests

Add tests with mock provider:

1. English question returns the same retrieval query.
2. Urdu question gets translated retrieval query.
3. Retrieval uses translated English query.
4. Answer generation receives answer language.
5. Not Found uses localized message.
6. Disclaimer localizes.
7. Compare All uses one translated query but separate retrieval per marja.
8. If translation fails, app falls back safely.

Do not call real Anthropic/OpenAI/Ollama in automated tests.

---

## Manual Test Examples

Urdu:

```txt
وضو کن چیزوں سے ٹوٹتا ہے؟
```

Expected:

- `detected_language: ur`
- `retrieval_query: What breaks wudhu?`
- answer in Urdu if AI provider is available
- sources still shown from backend

Arabic:

```txt
ما الذي يبطل الوضوء؟
```

Farsi:

```txt
چه چیزهایی وضو را باطل می‌کند؟
```

French:

```txt
Qu’est-ce qui annule le wudhu ?
```

---

## Safety Invariants

Do not break:

1. Retrieval before generation.
2. Marja filtering before retrieval.
3. Compare All separate per marja.
4. Citations from backend only.
5. No AI answer without retrieved records.
6. Not Found when no verified source.
7. `data/rulings.json` exact source wording unchanged.
8. Deterministic fallback remains.
9. App works without AI provider.

---

## Commands

Run:

```bash
npm test
npm run build
npm run lint
```

---

## Final Report

Report:

```txt
Multilingual support complete.

Files changed:
-

Language handling:
- detection:
- translation:
- supported languages:
- fallback behavior:

API:
- new fields:
- retrieval query:
- answer language:

Frontend:
- dir=auto:
- language metadata:

Tests:
- npm test:
- npm run build:
- npm run lint:

Manual examples:
- Urdu:
- Arabic:
- Farsi:
- French:

Remaining risks:
-
```
