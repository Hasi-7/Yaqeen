import { compareAllRulings, generateSingleAnswer } from "../lib/answer";
import type { MarjaId } from "../lib/types";

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
  { name: "compare all not found", question: "Can I trade cryptocurrency options?", marja: "all", expectFoundExactly: 0 }
];

let failures = 0;

for (const test of tests) {
  if (test.marja === "all") {
    const response = compareAllRulings(test.question);
    const foundCount = response.results.filter((result) => result.status === "found").length;
    const passed = typeof test.expectFoundExactly === "number"
      ? foundCount === test.expectFoundExactly
      : foundCount >= (test.expectFoundAtLeast ?? 0);
    console.log(`${passed ? "PASS" : "FAIL"} ${test.name}: found ${foundCount}`);
    if (!passed) failures += 1;
    continue;
  }

  const response = generateSingleAnswer(test.question, test.marja);
  const passed = response.status === test.expectStatus && (response.status === "not_found" || response.sources.length > 0);
  console.log(`${passed ? "PASS" : "FAIL"} ${test.name}: ${response.status}`);
  if (!passed) failures += 1;
}

if (failures > 0) {
  process.exitCode = 1;
}
