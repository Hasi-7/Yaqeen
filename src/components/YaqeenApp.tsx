"use client";

import {
  AlertCircle,
  ArrowUp,
  BookOpen,
  CheckCircle2,
  Loader2,
  Scale,
  Search,
  ShieldCheck,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import type {
  AskMarjaId,
  AskResponse,
  CompareAskResponse,
  ResponseDiagnostics,
  SingleAskResponse,
} from "@/lib/types";
import { SiteNav } from "./SiteNav";

const MARJA_OPTIONS: Array<{ id: AskMarjaId; label: string; helper: string }> = [
  {
    id: "sistani",
    label: "Sistani",
    helper: "Sayyid Ali al-Sistani",
  },
  {
    id: "khamenei",
    label: "Khamenei",
    helper: "Sayyid Ali Khamenei",
  },
  {
    id: "shirazi",
    label: "Sadiq Shirazi",
    helper: "Sayyid Sadiq Shirazi",
  },
  {
    id: "all",
    label: "Compare All",
    helper: "Separate retrieval per marja",
  },
];

const SUGGESTED_QUESTIONS = [
  "What breaks wudhu?",
  "When does Fajr prayer begin?",
  "Can I fast while traveling?",
  "Is Friday prayer wajib?",
  "Can I pray in a place where forbidden music is played?",
  "What are examples of inherently najis things?",
];

export function YaqeenApp() {
  const [marjaId, setMarjaId] = useState<AskMarjaId>("sistani");
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState<AskResponse | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const selectedLabel = useMemo(
    () => MARJA_OPTIONS.find((option) => option.id === marjaId)?.label ?? "Sistani",
    [marjaId],
  );

  async function submitQuestion(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || isLoading) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await fetch("/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: trimmedQuestion,
          marja_id: marjaId,
        }),
      });

      const payload = (await result.json()) as AskResponse | { error?: string };

      if (!result.ok) {
        throw new Error(isErrorPayload(payload) ? payload.error : "Unable to ask Yaqeen right now.");
      }

      if (isErrorPayload(payload)) {
        throw new Error(payload.error);
      }

      setResponse(payload as AskResponse);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to ask Yaqeen right now.");
    } finally {
      setIsLoading(false);
    }
  }

  function selectSuggestedQuestion(suggestion: string) {
    setQuestion(suggestion);
    setResponse(null);
    setError("");
  }

  return (
    <main className="min-h-screen bg-[#f7f6f1] text-[#17201b]">
      <SiteNav />
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-[#d9d6ca] pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#b9d8ce] bg-[#e7f4ef] px-3 py-1 text-sm font-medium text-[#0f5f54]">
              <ShieldCheck size={16} aria-hidden="true" />
              Source-grounded MVP
            </div>
            <h1 className="text-4xl font-semibold tracking-normal text-[#10221d] sm:text-5xl">
              Yaqeen
            </h1>
            <p className="mt-2 max-w-2xl text-base leading-7 text-[#536159]">
              Source-backed rulings from your marja.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 rounded-md border border-[#d9d6ca] bg-white/70 p-3 text-sm text-[#536159] shadow-sm">
            <Metric label="Mode" value={selectedLabel} />
            <Metric label="Data" value={response?.diagnostics?.datasetLoaded ? "Loaded" : "Pending"} />
            <Metric label="AI" value={formatAiMode(response?.diagnostics?.localAiMode)} />
          </div>
        </header>

        <section className="grid flex-1 gap-6 py-6 lg:grid-cols-[390px_1fr]">
          <aside className="space-y-5">
            <section className="rounded-md border border-[#d9d6ca] bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-normal text-[#536159]">
                <Scale size={16} aria-hidden="true" />
                Marja
              </div>
              <div className="grid gap-2">
                {MARJA_OPTIONS.map((option) => {
                  const selected = option.id === marjaId;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setMarjaId(option.id)}
                      className={`flex min-h-16 items-center justify-between rounded-md border px-3 py-3 text-left transition ${
                        selected
                          ? "border-[#0f766e] bg-[#e7f4ef] text-[#0f3f39]"
                          : "border-[#e5e1d6] bg-[#fbfaf6] text-[#17201b] hover:border-[#b8c9c0]"
                      }`}
                      aria-pressed={selected}
                    >
                      <span>
                        <span className="block text-sm font-semibold">{option.label}</span>
                        <span className="mt-1 block text-xs text-[#65736b]">{option.helper}</span>
                      </span>
                      {selected ? <CheckCircle2 size={18} aria-hidden="true" /> : null}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-md border border-[#d9d6ca] bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-normal text-[#536159]">
                <Search size={16} aria-hidden="true" />
                Suggested Questions
              </div>
              <div className="grid gap-2">
                {SUGGESTED_QUESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => selectSuggestedQuestion(suggestion)}
                    className="rounded-md border border-[#e5e1d6] bg-[#fbfaf6] px-3 py-2 text-left text-sm leading-5 text-[#27342e] transition hover:border-[#0f766e] hover:bg-[#eef8f4]"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </section>
          </aside>

          <section className="flex min-h-[620px] flex-col rounded-md border border-[#d9d6ca] bg-white shadow-sm">
            <form onSubmit={submitQuestion} className="border-b border-[#e4e0d6] p-4">
              <label htmlFor="question" className="mb-2 block text-sm font-semibold text-[#2c3832]">
                Ask a fiqh question
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <textarea
                  id="question"
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder="Example: What breaks wudhu?"
                  className="min-h-28 flex-1 resize-none rounded-md border border-[#d9d6ca] bg-[#fbfaf6] px-3 py-3 text-base leading-6 outline-none transition placeholder:text-[#8b938d] focus:border-[#0f766e] focus:ring-3 focus:ring-[#0f766e]/15"
                />
                <button
                  type="submit"
                  disabled={!question.trim() || isLoading}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#0f766e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0d5f59] disabled:cursor-not-allowed disabled:bg-[#9fb8b3] sm:self-end"
                  title="Ask Yaqeen"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={18} aria-hidden="true" /> : <ArrowUp size={18} aria-hidden="true" />}
                  Ask
                </button>
              </div>
            </form>

            <div className="flex flex-1 flex-col p-4">
              {error ? <ErrorMessage message={error} /> : null}
              {isLoading ? <LoadingState /> : null}
              {!isLoading && !response && !error ? <EmptyState /> : null}
              {!isLoading && response?.mode === "single" ? <SingleResponse response={response} /> : null}
              {!isLoading && response?.mode === "compare_all" ? <CompareResponse response={response} /> : null}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-xs uppercase tracking-normal text-[#6b756f]">{label}</div>
      <div className="truncate text-sm font-semibold text-[#1c2923]">{value}</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-md bg-[#e7f4ef] text-[#0f766e]">
          <BookOpen size={24} aria-hidden="true" />
        </div>
        <h2 className="text-xl font-semibold text-[#17201b]">Ready for verified sources</h2>
        <p className="mt-2 text-sm leading-6 text-[#5d6a63]">
          The interface and API are wired. Until the curated dataset is merged, questions will safely return Not Found.
        </p>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-1 items-center justify-center text-[#536159]">
      <div className="inline-flex items-center gap-3 rounded-md border border-[#d9d6ca] bg-[#fbfaf6] px-4 py-3 text-sm">
        <Loader2 className="animate-spin text-[#0f766e]" size={18} aria-hidden="true" />
        Retrieving verified records
      </div>
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="mb-4 flex items-start gap-3 rounded-md border border-[#efc0b8] bg-[#fff1ee] px-4 py-3 text-sm text-[#8b2f21]">
      <AlertCircle size={18} aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}

function SingleResponse({ response }: { response: SingleAskResponse }) {
  const found = response.status === "found";

  return (
    <article className="space-y-4">
      <div className={`rounded-md border p-4 ${found ? "border-[#b9d8ce] bg-[#f3fbf8]" : "border-[#e8d5ad] bg-[#fff8e8]"}`}>
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="text-sm font-semibold uppercase tracking-normal text-[#536159]">
            {found ? "Answer" : "Not Found"}
          </div>
          <AnswerModeBadge mode={response.answer_mode} provider={response.ai_provider} model={response.ai_model} />
        </div>
        <p className="text-base leading-7 text-[#1b2923]">{response.answer}</p>
      </div>

      <SourceCards sources={response.sources} />
      <FollowUpPath />
      <Disclaimer text={response.disclaimer} />
    </article>
  );
}

function CompareResponse({ response }: { response: CompareAskResponse }) {
  return (
    <article className="space-y-4">
      <div className="overflow-x-auto rounded-md border border-[#d9d6ca]">
        <div className="grid min-w-[720px] grid-cols-[170px_1fr_220px] bg-[#eef4f0] text-sm font-semibold text-[#27342e]">
          <div className="border-r border-[#d9d6ca] px-3 py-3">Marja</div>
          <div className="border-r border-[#d9d6ca] px-3 py-3">Answer</div>
          <div className="px-3 py-3">Source</div>
        </div>
        {response.results.map((result) => (
          <div
            key={result.marja_id}
            className="grid min-w-[720px] grid-cols-[170px_1fr_220px] border-t border-[#e4e0d6] text-sm"
          >
            <div className="border-r border-[#e4e0d6] px-3 py-3 font-semibold text-[#17201b]">
              <span className="block">{result.marja_name}</span>
              <AnswerModeBadge mode={result.answer_mode} provider={result.ai_provider} model={result.ai_model} compact />
            </div>
            <div className="border-r border-[#e4e0d6] px-3 py-3 leading-6 text-[#27342e]">
              {result.answer}
            </div>
            <div className="px-3 py-3 leading-6 text-[#536159]">
              {result.sources[0]?.citation_label ?? "Not Found"}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-md border border-[#d9d6ca] bg-[#fbfaf6] p-4">
        <div className="mb-1 text-sm font-semibold uppercase tracking-normal text-[#536159]">
          Comparison
        </div>
        <p className="text-sm leading-6 text-[#27342e]">{response.comparison_summary}</p>
      </div>

      <FollowUpPath />
      <Disclaimer text={response.disclaimer} />
    </article>
  );
}

type AnswerModeProp = "ai" | "deterministic_fallback" | "not_found" | undefined;
type AiProviderProp = "openai" | "ollama" | "mock" | "none" | null | undefined;

function AnswerModeBadge({
  mode,
  provider,
  model,
  compact = false,
}: {
  mode: AnswerModeProp;
  provider: AiProviderProp;
  model?: string | null;
  compact?: boolean;
}) {
  if (!mode) return null;

  const modeLabel =
    mode === "ai" ? "AI answer" : mode === "deterministic_fallback" ? "Source fallback" : "Not Found";
  const providerStr = provider && provider !== "none" ? provider : null;
  const parts = [modeLabel, providerStr, model ?? null].filter(Boolean);
  const text = `Generated with: ${parts.join(" · ")}`;

  const colorClass =
    mode === "ai"
      ? "bg-[#e7f4ef] text-[#0f5f54] border-[#b9d8ce]"
      : mode === "deterministic_fallback"
        ? "bg-[#eef2ff] text-[#2d4088] border-[#c0ceef]"
        : "bg-[#fff8e8] text-[#8b6a1a] border-[#e8d5ad]";

  if (compact) {
    return (
      <span className={`mt-1 inline-block rounded border px-1.5 py-0.5 text-xs font-medium ${colorClass}`}>
        {modeLabel}
      </span>
    );
  }

  return (
    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${colorClass}`}>
      {text}
    </span>
  );
}

function SourceCards({ sources }: { sources: SingleAskResponse["sources"] }) {
  if (sources.length === 0) {
    return null;
  }

  return (
    <section className="grid gap-3 sm:grid-cols-2">
      {sources.map((source) => (
        <a
          key={`${source.marja_name}-${source.citation_label}`}
          href={source.url ?? undefined}
          target={source.url ? "_blank" : undefined}
          rel={source.url ? "noreferrer" : undefined}
          className="rounded-md border border-[#d9d6ca] bg-white p-4 text-sm shadow-sm transition hover:border-[#0f766e]"
        >
          <div className="mb-2 flex items-center gap-2 font-semibold text-[#17201b]">
            <BookOpen size={16} aria-hidden="true" />
            {source.source_title}
          </div>
          <p className="leading-6 text-[#536159]">{source.citation_label}</p>
        </a>
      ))}
    </section>
  );
}

function Disclaimer({ text }: { text: string }) {
  return (
    <div className="rounded-md border border-[#d9d6ca] bg-[#fbfaf6] px-4 py-3 text-sm leading-6 text-[#536159]">
      {text}
    </div>
  );
}

function FollowUpPath() {
  return (
    <div className="rounded-md border border-[#d9d6ca] bg-white px-4 py-3 text-sm leading-6 text-[#536159]">
      Need more detail? Consult the marja&apos;s official Q&amp;A platform, official office, or a local representative.
    </div>
  );
}

function formatAiMode(mode: ResponseDiagnostics["localAiMode"] | undefined) {
  if (!mode) {
    return "Waiting";
  }

  const labels = {
    ai: "AI",
    deterministic_fallback: "Fallback",
    not_found: "Skipped",
    skipped_no_sources: "Skipped",
  };

  return labels[mode];
}

function isErrorPayload(payload: AskResponse | { error?: string }): payload is { error: string } {
  return "error" in payload && typeof payload.error === "string";
}
