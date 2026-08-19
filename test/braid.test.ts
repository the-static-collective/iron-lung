import assert from "node:assert/strict";
import test from "node:test";
import { validateBraid } from "../src/braid.js";

const base = {
  schema: "iron-lung/braid/v0.1",
  id: "braid:birth:0",
  strands: {
    substance: { condition: "intact", claim: { kind: "refs", refs: ["repo:iron-lung"] } },
    lineage: { condition: "broken", claim: { kind: "refs", refs: ["origin:conversation"] } },
    authority: { condition: "refused", claim: { kind: "none" } }
  }
} as const;

test("requires exactly substance, lineage, and authority strands", () => {
  const missing = structuredClone(base) as Record<string, unknown>;
  delete (missing.strands as Record<string, unknown>).lineage;
  const missingResult = validateBraid(missing);
  assert.equal(missingResult.ok, false);
  assert.equal(missingResult.findings.some((finding) => finding.code === "missing_strand"), true);

  const extra = structuredClone(base) as Record<string, unknown>;
  (extra.strands as Record<string, unknown>).memory = {
    condition: "intact",
    claim: { kind: "none" }
  };
  const extraResult = validateBraid(extra);
  assert.equal(extraResult.ok, false);
  assert.equal(extraResult.findings.some((finding) => finding.code === "invalid_braid"), true);
});

test("preserves explicit unknown, refused, broken, and none without dropping strands", () => {
  const candidate = structuredClone(base) as any;
  candidate.strands.substance = { condition: "unknown", claim: { kind: "none" } };
  candidate.strands.lineage = { condition: "broken", claim: { kind: "refs", refs: ["z", "a", "a"] } };
  candidate.strands.authority = { condition: "refused", claim: { kind: "none" } };
  const result = validateBraid(candidate);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.deepEqual(Object.keys(result.value.strands), ["substance", "lineage", "authority"]);
  assert.deepEqual(result.value.strands.lineage.claim, { kind: "refs", refs: ["a", "z"] });
});

test("returns a fresh normalized braid and never mutates the input", () => {
  const candidate = structuredClone(base) as any;
  candidate.strands.substance.claim.refs = ["b", "a"];
  const before = structuredClone(candidate);
  const result = validateBraid(candidate);
  assert.equal(result.ok, true);
  assert.deepEqual(candidate, before);
  if (!result.ok) return;
  assert.notEqual(result.value, candidate);
  assert.deepEqual(result.value.strands.substance.claim, { kind: "refs", refs: ["a", "b"] });
});
