import { loadRulings } from "../src/lib/data";
import { MARJA_ORDER } from "../src/lib/maraji";
import { hybridSearchRulings } from "../src/lib/retrieval/hybrid-search";
import type { MarjaId } from "../src/lib/types";

type TestCase =
  | { name: string; question: string; marja: MarjaId; expectStatus: "found" | "not_found" }
  | { name: string; question: string; marja: "all"; expectFoundAtLeast?: number; expectFoundExactly?: number };

const tests: TestCase[] = [
  { name: "single found wudhu", question: "What breaks wudhu?", marja: "sistani", expectStatus: "found" },
  { name: "single found fajr", question: "When does Fajr prayer begin?", marja: "shirazi", expectStatus: "found" },
  { name: "single found travel fasting", question: "Can I fast while traveling?", marja: "khamenei", expectStatus: "found" },
  { name: "single not found", question: "Can I trade cryptocurrency options?", marja: "sistani", expectStatus: "not_found" },
  { name: "unsupported prayer rakats not found", question: "How many rakats is dhuhr prayer?", marja: "sistani", expectStatus: "not_found" },
  { name: "unsupported travel prayer not found", question: "Can I pray while traveling?", marja: "sistani", expectStatus: "not_found" },
  { name: "unsupported dog najis not found", question: "Is dog najis?", marja: "shirazi", expectStatus: "not_found" },
  { name: "travelling spelling works", question: "Can I fast while travelling?", marja: "shirazi", expectStatus: "found" },
  { name: "compare mixed or found", question: "What breaks wudhu?", marja: "all", expectFoundAtLeast: 2 },
  { name: "compare all not found", question: "Can I trade cryptocurrency options?", marja: "all", expectFoundExactly: 0 },
];

async function main() {
  delete process.env.YAQEEN_EMBEDDINGS_ENABLED;
  const { records } = await loadRulings();
  let failures = 0;

  for (const test of tests) {
    if (test.marja === "all") {
      const results = await Promise.all(MARJA_ORDER.map((marjaId) => hybridSearchRulings(records, test.question, marjaId)));
      const foundCount = results.filter((matches) => matches.length > 0).length;
      const passed = typeof test.expectFoundExactly === "number"
        ? foundCount === test.expectFoundExactly
        : foundCount >= (test.expectFoundAtLeast ?? 0);
      console.log(`${passed ? "PASS" : "FAIL"} ${test.name}: found ${foundCount}`);
      if (!passed) failures += 1;
      continue;
    }

    const matches = await hybridSearchRulings(records, test.question, test.marja);
    const status = matches.length > 0 ? "found" : "not_found";
    const passed = status === test.expectStatus;
    console.log(`${passed ? "PASS" : "FAIL"} ${test.name}: ${status}`);
    if (!passed) failures += 1;
  }

  if (failures > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
