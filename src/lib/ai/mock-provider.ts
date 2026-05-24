import type { AICompletionInput, AICompletionResult, AIProvider } from "./types";

export class MockAIProvider implements AIProvider {
  constructor(private readonly response = "Mock AI answer from retrieved records.") {}

  async complete(input: AICompletionInput): Promise<AICompletionResult> {
    void input;
    if (this.response === "__throw__") {
      throw new Error("Mock AI provider failure");
    }
    if (this.response === "__abort__") {
      const error = new DOMException("Mock AbortError", "AbortError");
      throw error;
    }

    return {
      text: this.response,
      provider: "mock",
      model: "mock-model",
    };
  }
}
