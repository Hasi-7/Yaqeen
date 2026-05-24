import { loadRulings } from "../src/lib/data";
import { retrieveRulings } from "../src/lib/retriever";

async function main() {
  delete process.env.YAQEEN_EMBEDDINGS_ENABLED;
  const { records } = await loadRulings();

  const cases = [
    { q: "What is khums obligatory on?", marja: "shirazi" as const, expect: "shirazi_khums_001" },
    { q: "Who can be followed in taqlid?", marja: "sistani" as const, expect: "sistani_taqlid_002" },
    { q: "When is tayammum required?", marja: "shirazi" as const, expect: "shirazi_tayammum_001" },
    { q: "Is taqlid based only on reason?", marja: "khamenei" as const, expect: "khamenei_taqlid_q1" },
  ];

  let failures = 0;
  for (const c of cases) {
    const results = retrieveRulings(records, c.q, c.marja);
    const found = results.some((r) => r.record.id === c.expect);
    const topId = results[0]?.record.id ?? "none";
    console.log(`${found ? "PASS" : "FAIL"} "${c.q}" (${c.marja}) → ${topId}`);
    if (!found) failures++;
  }

  if (failures > 0) process.exitCode = 1;
}

main().catch((err) => { console.error(err); process.exitCode = 1; });
