import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Database,
  HelpCircle,
  MessageSquareText,
  Scale,
  ShieldCheck,
} from "lucide-react";
import { SiteNav } from "@/components/SiteNav";

const STEPS = [
  {
    title: "Choose a marja",
    text: "Select Sistani, Khamenei, Sadiq Shirazi, or Compare All before asking.",
  },
  {
    title: "Ask one focused question",
    text: "Specific practical questions are easier to match against a verified ruling record.",
  },
  {
    title: "Check the sources",
    text: "Found answers include citations generated from stored metadata, not the model.",
  },
  {
    title: "Use Not Found properly",
    text: "If no verified source is available, Yaqeen refuses instead of guessing.",
  },
];

const FAQS = [
  {
    question: "Why does Yaqeen say Not Found?",
    answer:
      "The verified dataset may not contain a direct source for that question. This is intentional safety behavior, not a failure of the interface.",
  },
  {
    question: "Can Yaqeen answer from general Islamic knowledge?",
    answer:
      "No. The app is designed to answer only from retrieved source records. Outside knowledge should not be used for rulings.",
  },
  {
    question: "How does Compare All work?",
    answer:
      "The backend retrieves separately for each marja and then displays each result side by side. It should not retrieve all sources together and ask the model to compare.",
  },
  {
    question: "Where does local AI fit in?",
    answer:
      "The local model can summarize retrieved records, but citations and eligibility stay controlled by the backend.",
  },
];

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-[#f7f6f1] text-[#17201b]">
      <SiteNav />

      <section className="border-b border-[#d9d6ca] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#b9d8ce] bg-[#e7f4ef] px-3 py-1 text-sm font-medium text-[#0f5f54]">
              <HelpCircle size={16} aria-hidden="true" />
              Help center
            </div>
            <h1 className="text-4xl font-semibold text-[#10221d] sm:text-5xl">Use Yaqeen safely and clearly.</h1>
            <p className="mt-4 text-base leading-7 text-[#536159]">
              Yaqeen is built for source-backed retrieval. Use it to find cited rulings, compare available sources, and recognize when official follow-up is needed.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <aside className="rounded-md border border-[#d9d6ca] bg-[#12332d] p-6 text-white shadow-lg shadow-[#12332d]/15">
          <ShieldCheck className="mb-4 text-[#8ee0cf]" size={28} aria-hidden="true" />
          <h2 className="text-2xl font-semibold">Safety rules</h2>
          <div className="mt-5 space-y-3">
            {[
              "Treat Not Found as a protected result, not a system error.",
              "Do not remove source citations from found answers.",
              "Do not blend rulings between maraji.",
              "Do not answer from memory when retrieval fails.",
            ].map((rule) => (
              <div key={rule} className="flex items-start gap-3 text-sm leading-6 text-[#eef8f5]">
                <CheckCircle2 className="mt-0.5 shrink-0 text-[#8ee0cf]" size={17} aria-hidden="true" />
                <span>{rule}</span>
              </div>
            ))}
          </div>
        </aside>

        <div className="grid gap-4 sm:grid-cols-2">
          {STEPS.map((step, index) => (
            <article key={step.title} className="rounded-md border border-[#d9d6ca] bg-white p-5 shadow-sm">
              <div className="mb-4 flex size-10 items-center justify-center rounded-md bg-[#e7f4ef] text-[#0f766e]">
                {index === 0 ? <Scale size={20} /> : index === 1 ? <MessageSquareText size={20} /> : index === 2 ? <Database size={20} /> : <AlertTriangle size={20} />}
              </div>
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#536159]">{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold text-[#10221d]">Common questions</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {FAQS.map((faq) => (
            <article key={faq.question} className="rounded-md border border-[#d9d6ca] bg-white p-5 shadow-sm">
              <h3 className="text-base font-semibold text-[#17201b]">{faq.question}</h3>
              <p className="mt-2 text-sm leading-6 text-[#536159]">{faq.answer}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-md border border-[#d9d6ca] bg-white p-5 shadow-sm sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-semibold text-[#10221d]">Ready to test the assistant?</h2>
            <p className="mt-1 text-sm leading-6 text-[#536159]">Start with the suggested questions to see cited answers, comparisons, and safe refusal behavior.</p>
          </div>
          <Link
            href="/ask"
            className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[#0f766e] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0d5f59]"
          >
            Open app
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
