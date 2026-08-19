import assert from "node:assert/strict";
import test from "node:test";
import { validateBraid } from "../src/braid.js";
import { evaluateAssimilation, type AssimilationPolicyV01 } from "../src/assimilation.js";

function braid(lineage = "intact", authority = "intact") {
  const result = validateBraid({
    schema: "iron-lung/braid/v0.1",
    id: `braid:${lineage}:${authority}`,
    strands: {
      substance: { condition: "intact", claim: { kind: "refs", refs: ["repo:iron-lung"] } },
      lineage: { condition: lineage, claim: { kind: "refs", refs: ["origin:conversation"] } },
      authority: { condition: authority, claim: { kind: "refs", refs: ["authority:human"] } }
    }
  });
  assert.equal(result.ok, true);
  if (!result.ok) throw new Error("invalid braid fixture");
  return result.value;
}

function policy(): AssimilationPolicyV01 {
  return {
    schema: "iron-lung/assimilation-policy/v0.1",
    policyId: "policy:first-breath",
    acceptableConditions: {
      substance: ["intact"],
      lineage: ["intact"],
      authority: ["intact"]
    },
    requiredWitnessRefs: ["witness:repair", "witness:approval"]
  };
}

test("circulable damage remains blocked from assimilation", () => {
  const result = evaluateAssimilation({
    braid: braid("broken", "intact"),
    policy: policy(),
    suppliedWitnessRefs: ["witness:approval", "witness:repair"]
  });
  assert.equal(result.state, "blocked");
  assert.equal(result.eligible, false);
  assert.equal(result.findings.some((finding) => finding.code === "assimilation_blocked"), true);
});

test("assimilation requires every declared witness", () => {
  const result = evaluateAssimilation({
    braid: braid(),
    policy: policy(),
    suppliedWitnessRefs: ["witness:approval"]
  });
  assert.equal(result.state, "blocked");
  assert.equal(result.findings.some((finding) => finding.code === "missing_witness"), true);
});

test("all-intact repaired braid with witnesses becomes structurally assimilable", () => {
  const source = braid();
  const before = structuredClone(source);
  const result = evaluateAssimilation({
    braid: source,
    policy: policy(),
    suppliedWitnessRefs: ["witness:repair", "witness:approval", "witness:approval"]
  });
  assert.deepEqual(source, before);
  assert.deepEqual(result, {
    schema: "iron-lung/assimilation-evaluation/v0.1",
    braidId: source.id,
    state: "assimilable",
    eligible: true,
    findings: []
  });
});

test("authority must be intact even when a loose policy says refused is acceptable", () => {
  const loose = policy();
  loose.acceptableConditions.authority = ["intact", "refused"];
  const result = evaluateAssimilation({
    braid: braid("intact", "refused"),
    policy: loose,
    suppliedWitnessRefs: ["witness:approval", "witness:repair"]
  });
  assert.equal(result.state, "blocked");
  assert.equal(result.eligible, false);
  assert.equal(result.findings.some((finding) => finding.code === "assimilation_blocked"), true);
});
