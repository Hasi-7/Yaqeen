export const DISCLAIMER =
  "This tool retrieves rulings from published sources using AI and is not a replacement for contacting your marja's office.";

export const NOT_FOUND_MESSAGE =
  "Not Found in the current verified dataset. Please consult the marja's official Q&A platform, official office, or a local representative.";

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
  diagnostics?: ResponseDiagnostics;
};

export type AskResponse = SingleAskResponse | CompareAskResponse;

export type ResponseDiagnostics = {
  datasetLoaded: boolean;
  recordCount: number;
  localAiMode: "ai" | "deterministic_fallback" | "not_found" | "skipped_no_sources";
};
