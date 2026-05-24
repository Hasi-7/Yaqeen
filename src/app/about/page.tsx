import Link from "next/link";
import { ArrowRight, BookMarked, Database, Scale, ShieldCheck, Smartphone } from "lucide-react";
import { SiteNav } from "@/components/SiteNav";

const VALUES = [
  {
    title: "Trustworthy",
    text: "Every ruling should be sourced directly from verified marja literature with transparent citations and scholarly integrity.",
  },
  {
    title: "Accessible",
    text: "Guidance should be fast, intuitive, and mobile-friendly, tailored to the user’s selected marja and everyday questions.",
  },
  {
    title: "Practical",
    text: "AI should simplify fiqh access responsibly while remaining scalable, feasible, and community-centered.",
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
              To modernize access to Islamic guidance, Yaqeen combines verified source records, transparent citations, and a user experience designed around the marja a person follows.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div className="rounded-md bg-[#12332d] p-6 text-white shadow-sm">
            <h2 className="text-2xl font-semibold">The question Yaqeen answers</h2>
            <p className="mt-4 text-lg leading-8 text-[#eef8f5]">
              How can we provide Shias with trustworthy, accessible, and practical access to Islamic rulings while maintaining scholarly authenticity and transparency in the age of AI?
            </p>
          </div>
          <div className="grid gap-4">
            {VALUES.map((value, index) => (
              <article key={value.title} className="rounded-md border border-dashed border-[#2f6259] bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-md bg-[#e7f4ef] text-[#0f766e]">
                    {index === 0 ? <ShieldCheck size={20} /> : index === 1 ? <Smartphone size={20} /> : <Scale size={20} />}
                  </div>
                  <h3 className="text-xl font-semibold text-[#17201b]">{value.title}</h3>
                </div>
                <p className="mt-2 text-sm leading-6 text-[#536159]">{value.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#d9d6ca] bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
          <Principle icon={Scale} title="Personalized" text="Users select their marja so rulings are tailored to the scholar they follow." />
          <Principle icon={Database} title="Verified" text="The dataset carries source metadata, verification status, and citation labels." />
          <Principle icon={ShieldCheck} title="Transparent" text="Answers show citations or refuse when a verified source is unavailable." />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-semibold text-[#10221d]">Roadmap</h2>
          <p className="mt-4 text-base leading-7 text-[#536159]">
            Next steps include expanding the verified dataset, improving retrieval evaluation, adding review workflows, and preparing a public dataset structure that community tools can build on responsibly.
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
