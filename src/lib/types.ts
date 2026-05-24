export const DISCLAIMER =
  "This tool retrieves rulings from published sources using AI and is not a replacement for contacting your marja's office.";

export const NOT_FOUND_MESSAGE =
  "Not Found in the current verified dataset. Please consult the marja's official Q&A platform, official office, or a local representative.";

export const NOT_FOUND_MESSAGES: Record<string, string> = {
  en: NOT_FOUND_MESSAGE,
  ar: "لم يتم العثور على جواب في قاعدة البيانات الموثقة الحالية. يُرجى الرجوع إلى القنوات الرسمية للمرجع أو ممثله المحلي.",
  ur: "موجودہ تصدیق شدہ ڈیٹاسیٹ میں جواب نہیں ملا۔ براہِ کرم مرجع کے سرکاری ذرائع یا مقامی نمائندے سے رجوع کریں۔",
  fa: "در مجموعه دادهٔ تأییدشدهٔ فعلی پاسخی یافت نشد. لطفاً به راه‌های رسمی دفتر مرجع یا نمایندهٔ محلی مراجعه کنید.",
  fr: "Aucune réponse n'a été trouvée dans l'ensemble de données vérifié actuel. Veuillez consulter les canaux officiels du marja ou un représentant local.",
};

export const DISCLAIMERS: Record<string, string> = {
  en: DISCLAIMER,
  ar: "تسترجع هذه الأداة الأحكام من مصادر منشورة باستخدام الذكاء الاصطناعي، وهي ليست بديلاً عن التواصل مع مكتب المرجع.",
  ur: "یہ ٹول شائع شدہ ذرائع سے AI کے ذریعے احکام تلاش کرتا ہے، اور یہ آپ کے مرجع کے دفتر سے رابطہ کرنے کا متبادل نہیں ہے۔",
  fa: "این ابزار با استفاده از هوش مصنوعی احکام را از منابع منتشرشده بازیابی می‌کند و جایگزین تماس با دفتر مرجع شما نیست.",
  fr: "Cet outil récupère des avis juridiques depuis des sources publiées à l'aide de l'IA et ne remplace pas le contact avec le bureau de votre marja.",
};

export function getLocalizedNotFound(lang: string): string {
  return NOT_FOUND_MESSAGES[lang] ?? NOT_FOUND_MESSAGE;
}

export function getLocalizedDisclaimer(lang: string): string {
  return DISCLAIMERS[lang] ?? DISCLAIMER;
}

export const APPROVED_VERIFICATION_STATUSES = [
  "verified_demo",
  "verified",
  "scholar_verified",
] as const;

export const ALL_VERIFICATION_STATUSES = [
  "verified_demo",
  "verified",
  "scholar_verified",
  "needs_review",
  "deprecated",
] as const;

export const CONFIDENCE_LEVELS = ["high", "medium", "low"] as const;

export type MarjaId = "sistani" | "khamenei" | "shirazi";
export type AskMarjaId = MarjaId | "all";
export type VerificationStatus = (typeof ALL_VERIFICATION_STATUSES)[number];
export type ConfidenceLevel = (typeof CONFIDENCE_LEVELS)[number];

export type RulingRecord = {
  id: string;
  marja_id: MarjaId;
  marja_name: string;
  source_type: string;
  source_title: string;
  official_url?: string | null;
  topic: string;
  subtopic?: string | null;
  question_text?: string | null;
  ruling_text: string;
  chapter_title?: string | null;
  section_title?: string | null;
  ruling_number?: string | null;
  page_number?: string | null;
  language?: string | null;
  tags?: string[];
  citation_label: string;
  verification_status: VerificationStatus;
  confidence_level: ConfidenceLevel;
};

export type SourceCitation = {
  marja_name: string;
  source_title: string;
  chapter_title?: string | null;
  ruling_number?: string | null;
  page_number?: string | null;
  url?: string | null;
  citation_label: string;
};

export type SingleAskResponse = {
  status: "found" | "not_found";
  mode: "single";
  answer: string;
  sources: SourceCitation[];
  disclaimer: string;
  answer_mode?: "ai" | "deterministic_fallback" | "not_found";
  ai_provider?: "openai" | "ollama" | "mock" | "none" | null;
  ai_model?: string | null;
  fallback_reason?: string | null;
  detected_language?: string | null;
  answer_language?: string | null;
  retrieval_query?: string | null;
  translation_mode?: string | null;
  diagnostics?: ResponseDiagnostics;
};

export type CompareResult = {
  marja_id: MarjaId;
  marja_name: string;
  status: "found" | "not_found";
  answer: string;
  sources: SourceCitation[];
  answer_mode?: "ai" | "deterministic_fallback" | "not_found";
  ai_provider?: "openai" | "ollama" | "mock" | "none" | null;
  ai_model?: string | null;
  fallback_reason?: string | null;
  answer_language?: string | null;
};

export type CompareAskResponse = {
  status: "found" | "not_found";
  mode: "compare_all";
  results: CompareResult[];
  comparison_summary: string;
  disclaimer: string;
  answer_mode?: "ai" | "deterministic_fallback" | "not_found";
  ai_provider?: "openai" | "ollama" | "mock" | "none" | null;
  ai_model?: string | null;
  fallback_reason?: string | null;
  detected_language?: string | null;
  answer_language?: string | null;
  retrieval_query?: string | null;
  translation_mode?: string | null;
  diagnostics?: ResponseDiagnostics;
};

export type AskResponse = SingleAskResponse | CompareAskResponse;

export type ResponseDiagnostics = {
  datasetLoaded: boolean;
  recordCount: number;
  localAiMode: "ai" | "deterministic_fallback" | "not_found" | "skipped_no_sources";
};
