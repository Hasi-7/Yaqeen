import { MockAIProvider } from "./mock-provider";
import type { AICompletionInput, AICompletionResult, AIProvider } from "./types";

const DEFAULT_OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_OLLAMA_BASE_URL = "http://localhost:11434";
const DEFAULT_OLLAMA_TIMEOUT_MS = 60_000;
const OPENAI_TIMEOUT_MS = 12_000;
const OLLAMA_NUM_PREDICT = 180;

export function ollamaTimeoutMs(): number {
  const parsed = parseInt(process.env.OLLAMA_TIMEOUT_MS ?? "", 10);
  return isNaN(parsed) ? DEFAULT_OLLAMA_TIMEOUT_MS : parsed;
}

export function getAIProvider(): AIProvider | null {
  if (process.env.YAQEEN_AI_ENABLED !== "true") {
    return null;
  }

  const provider = process.env.YAQEEN_AI_PROVIDER ?? "none";

  if (provider === "mock") {
    return new MockAIProvider(process.env.YAQEEN_MOCK_AI_RESPONSE);
  }

  if (provider === "openai" && process.env.OPENAI_API_KEY && process.env.YAQEEN_AI_MODEL) {
    return new OpenAIProvider(process.env.OPENAI_API_KEY, process.env.YAQEEN_AI_MODEL);
  }

  if (provider === "ollama" && process.env.YAQEEN_AI_MODEL) {
    return new OllamaProvider(
      process.env.YAQEEN_AI_MODEL,
      process.env.OLLAMA_BASE_URL ?? DEFAULT_OLLAMA_BASE_URL,
    );
  }

  return null;
}

class OpenAIProvider implements AIProvider {
  constructor(
    private readonly apiKey: string,
    private readonly model: string,
  ) {}

  async complete(input: AICompletionInput): Promise<AICompletionResult> {
    const response = await fetchWithTimeout(
      DEFAULT_OPENAI_URL,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          messages: input.messages,
          temperature: input.temperature ?? 0,
          max_tokens: input.maxTokens ?? 350,
        }),
      },
      OPENAI_TIMEOUT_MS,
    );

    if (!response.ok) {
      throw new Error(`OpenAI request failed with ${response.status}`);
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    return {
      text: payload.choices?.[0]?.message?.content?.trim() ?? "",
      provider: "openai",
      model: this.model,
    };
  }
}

class OllamaProvider implements AIProvider {
  constructor(
    private readonly model: string,
    private readonly baseUrl: string,
  ) {}

  async complete(input: AICompletionInput): Promise<AICompletionResult> {
    const response = await fetchWithTimeout(
      `${this.baseUrl.replace(/\/$/, "")}/api/chat`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          stream: false,
          messages: input.messages,
          options: {
            temperature: 0,
            num_predict: OLLAMA_NUM_PREDICT,
          },
        }),
      },
      ollamaTimeoutMs(),
    );

    if (!response.ok) {
      throw new Error(`Ollama request failed with ${response.status}`);
    }

    const payload = (await response.json()) as {
      message?: { content?: string };
      response?: string;
    };

    return {
      text: payload.message?.content?.trim() || payload.response?.trim() || "",
      provider: "ollama",
      model: this.model,
    };
  }
}

async function fetchWithTimeout(input: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}
