export type AIMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type AICompletionInput = {
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
};

export type AICompletionResult = {
  text: string;
  provider: AIProviderName;
  model: string;
};

export type AIProviderName = "openai" | "ollama" | "mock";

export interface AIProvider {
  complete(input: AICompletionInput): Promise<AICompletionResult>;
}

export type AnswerMode = "ai" | "deterministic_fallback" | "not_found";

export type FallbackReason =
  | "ollama_timeout"
  | "ollama_unavailable"
  | "ai_provider_error"
  | "ai_disabled";

export type GeneratedAnswer = {
  answer: string;
  answer_mode: AnswerMode;
  ai_provider: AIProviderName | "none" | null;
  ai_model: string | null;
  fallback_reason: FallbackReason | null;
};
