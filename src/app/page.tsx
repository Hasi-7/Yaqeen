import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Database,
  Layers3,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { QuranRevealIntro } from "@/components/QuranRevealIntro";
import { SiteNav } from "@/components/SiteNav";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f6f1] text-[#17201b]">
      <QuranRevealIntro />
      <SiteNav />

      <section className="relative min-h-[720px] overflow-hidden border-b border-[#d9d6ca]">
        <Image
          src="/yaqeen-hero.png"
          alt="A calm study desk with books, notes, and a laptop for source-backed research."
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(247,246,241,0.98)_0%,rgba(247,246,241,0.88)_36%,rgba(247,246,241,0.26)_72%,rgba(247,246,241,0.08)_100%)]" />
        <div className="relative mx-auto flex min-h-[720px] max-w-7xl items-center px-4 py-28 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#b9d8ce] bg-[#e7f4ef]/90 px-3 py-1 text-sm font-medium text-[#0f5f54]">
              <ShieldCheck size={16} aria-hidden="true" />
              Source-grounded marja rulings
            </div>
            <h1 className="text-5xl font-semibold tracking-normal text-[#10221d] sm:text-6xl lg:text-7xl">
              Yaqeen
            </h1>
            <p className="mt-5 max-w-xl text-xl leading-8 text-[#405047]">
              Ask a fiqh question, select your marja, and receive a short answer backed by verified source records.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/ask"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#0f766e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0d5f59]"
              >
                Open Yaqeen
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link
                href="/about"
                className="inline-flex min-h-12 items-center justify-center rounded-md border border-[#b9c7bf] bg-white/75 px-5 py-3 text-sm font-semibold text-[#17201b] transition hover:border-[#0f766e] hover:bg-white"
              >
                Learn how it works
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#d9d6ca] bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-3 sm:px-6 lg:px-8">
          <ProofPoint label="Maraji" value="3 + Compare All" />
          <ProofPoint label="Answer rule" value="Source-only" />
          <ProofPoint label="Fallback" value="Not Found" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-semibold text-[#10221d] sm:text-4xl">
            Built for confidence, not just convenience.
          </h2>
          <p className="mt-4 text-base leading-7 text-[#536159]">
            Yaqeen treats the rulings dataset as the source of truth. The AI layer helps read and summarize verified records, while citations and safety checks stay controlled by the backend.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <Feature icon={Search} title="Marja-first retrieval" text="Single-marja questions filter by marja before retrieval, preventing accidental mixing of rulings." />
          <Feature icon={Database} title="Verified records" text="Only approved dataset statuses are eligible for answers; draft or missing data returns Not Found." />
          <Feature icon={Layers3} title="Compare All" text="Each marja is retrieved separately, then shown side by side so unsupported agreement claims do not slip in." />
        </div>
      </section>

      <section className="bg-[#12332d] text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-sm text-[#cce8de]">
              <Sparkles size={16} aria-hidden="true" />
              Demo-ready flow
            </div>
            <h2 className="text-3xl font-semibold sm:text-4xl">A clear path for the hackathon demo.</h2>
            <p className="mt-4 text-base leading-7 text-[#dbe9e5]">
              The current app is designed to work before the final dataset arrives. Once `data/rulings.json` is merged, the same interface starts showing cited answers.
            </p>
          </div>
          <div className="grid gap-3">
            {[
              "Select Sistani, Khamenei, Sadiq Shirazi, or Compare All.",
              "Ask one of the prepared demo questions.",
              "Show citations when verified records exist.",
              "Show Not Found when the dataset cannot support an answer.",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-md border border-white/15 bg-white/8 px-4 py-3">
                <CheckCircle2 className="mt-0.5 shrink-0 text-[#8ee0cf]" size={18} aria-hidden="true" />
                <p className="text-sm leading-6 text-[#eef8f5]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 border-t border-[#d9d6ca] pt-10 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-semibold text-[#10221d]">Try the working assistant interface.</h2>
            <p className="mt-2 text-sm leading-6 text-[#536159]">
              It is already wired to the API and local-AI adapter, with safe empty-dataset behavior.
            </p>
          </div>
          <Link
            href="/ask"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#0f766e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0d5f59]"
          >
            Go to app
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}

function ProofPoint({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-sm uppercase tracking-normal text-[#65736b]">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-[#10221d]">{value}</div>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof BookOpen;
  title: string;
  text: string;
}) {
  return (
    <article className="rounded-md border border-[#d9d6ca] bg-white p-5 shadow-sm">
      <div className="mb-4 flex size-10 items-center justify-center rounded-md bg-[#e7f4ef] text-[#0f766e]">
        <Icon size={20} aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-[#17201b]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#536159]">{text}</p>
    </article>
  );
}
