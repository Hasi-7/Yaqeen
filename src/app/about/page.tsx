import Link from "next/link";
import { ArrowRight, BookMarked, Database, Scale, ShieldCheck } from "lucide-react";
import { SiteNav } from "@/components/SiteNav";

const VALUES = [
  {
    title: "Traceability",
    text: "Every answer should point back to a stored source record and citation.",
  },
  {
    title: "Restraint",
    text: "When verified data is missing, Yaqeen should refuse gracefully instead of filling the gap.",
  },
  {
    title: "Separation",
    text: "Marja-specific rulings stay separate unless Compare All displays them side by side.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#f7f6f1] text-[#17201b]">
      <SiteNav />

      <section className="border-b border-[#d9d6ca] bg-[#12332d] text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-sm text-[#cce8de]">
              <BookMarked size={16} aria-hidden="true" />
              About Yaqeen
            </div>
            <h1 className="text-4xl font-semibold sm:text-5xl">A source-first assistant for marja-specific rulings.</h1>
            <p className="mt-5 text-base leading-7 text-[#dbe9e5]">
              Yaqeen is a hackathon MVP exploring a safer pattern for religious AI: make the verified dataset the product, and use AI only as the interface.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h2 className="text-3xl font-semibold text-[#10221d]">Why it exists</h2>
            <p className="mt-4 text-base leading-7 text-[#536159]">
              Finding practical rulings can mean searching separate websites, PDFs, books, and Q&amp;A archives. Generic AI can sound confident while inventing details. Yaqeen is designed around the opposite behavior: cite, separate, and refuse when needed.
            </p>
            <p className="mt-4 text-base leading-7 text-[#536159]">
              The MVP supports Sayyid Ali al-Sistani, Sayyid Ali Khamenei, Sayyid Sadiq Shirazi, and a Compare All mode for side-by-side verified results.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {VALUES.map((value) => (
              <article key={value.title} className="rounded-md border border-[#d9d6ca] bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-[#17201b]">{value.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#536159]">{value.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#d9d6ca] bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
          <Principle icon={Scale} title="Marja-specific" text="Filter first, retrieve second, answer last." />
          <Principle icon={Database} title="Dataset-led" text="Structured records are the source of truth." />
          <Principle icon={ShieldCheck} title="Safety-aware" text="Not Found is a successful protected state." />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-semibold text-[#10221d]">Roadmap</h2>
          <p className="mt-4 text-base leading-7 text-[#536159]">
            The current build is intentionally narrow for the hackathon. Next steps are a larger verified dataset, better retrieval, review workflows, and eventually a public open dataset that other community tools can build on.
          </p>
          <Link
            href="/ask"
            className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-md bg-[#0f766e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0d5f59]"
          >
            Try Yaqeen
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}

function Principle({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Scale;
  title: string;
  text: string;
}) {
  return (
    <article>
      <div className="mb-4 flex size-10 items-center justify-center rounded-md bg-[#e7f4ef] text-[#0f766e]">
        <Icon size={20} aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-[#17201b]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#536159]">{text}</p>
    </article>
  );
}
