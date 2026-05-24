export type MarjaId = "sistani" | "khamenei" | "shirazi";
export type AskMarja = MarjaId | "all";

export type VerificationStatus = "verified_demo" | "verified" | "needs_review" | "deprecated";

export type RulingRecord = {
  id: string;
  marja_id: MarjaId;
  marja_name: string;
  source_type: string;
  source_title: string;
  official_url?: string | null;
  topic: string;
  subtopic?: string | null;
  question_text: string;
  ruling_text: string;
  chapter_title?: string | null;
  section_title?: string | null;
  ruling_number?: string | null;
  page_number?: string | null;
  language: string;
  tags: string[];
  citation_label: string;
  verification_status: VerificationStatus;
  confidence_level: "high" | "medium" | "low";
};

export type RetrievedRuling = RulingRecord & {
  score: number;
};

export type SourceCitation = {
  marja_id: MarjaId;
  marja_name: string;
  source_title: string;
  source_type: string;
  citation_label: string;
  official_url?: string | null;
  ruling_number?: string | null;
  page_number?: string | null;
};

export type SingleAskResponse = {
  mode: "single";
  question: string;
  marja: MarjaId;
  status: "found" | "not_found";
  answer: string;
  sources: SourceCitation[];
  follow_up: string;
  disclaimer: string;
};

export type CompareResult = {
  marja_id: MarjaId;
  marja_name: string;
  status: "found" | "not_found";
  answer: string;
  sources: SourceCitation[];
};

export type CompareAskResponse = {
  mode: "compare";
  question: string;
  results: CompareResult[];
  comparison_summary: string;
  disclaimer: string;
};
