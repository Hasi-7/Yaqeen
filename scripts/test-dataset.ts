import assert from "node:assert/strict";
import rulings from "../data/rulings.json";
import { validateRulingRecord, validateRulingRecords } from "../src/lib/ruling-schema";
import { APPROVED_VERIFICATION_STATUSES, type RulingRecord } from "../src/lib/types";

const records = validateRulingRecords(rulings);
assert.equal(records.length, 12);
assert.ok(records.every((record) => record.verification_status === "verified_demo"));

const invalidRecord = {
  ...(records[0] as RulingRecord),
  tags: "wudhu",
};

assert.throws(() => validateRulingRecord(invalidRecord), /tags/);
assert.ok(APPROVED_VERIFICATION_STATUSES.includes("verified_demo"));
assert.ok(APPROVED_VERIFICATION_STATUSES.includes("verified"));
assert.ok(APPROVED_VERIFICATION_STATUSES.includes("scholar_verified"));

console.log("PASS dataset schema validation tests");
