import assert from "node:assert/strict";
import test from "node:test";
import { validateBraid } from "../src/braid.js";
import { evaluateAssimilation, type AssimilationPolicyV01 } from "../src/assimilation.js";
import { validatePneumaAnnotation } from "../src/pneuma.js";

const note = {
  schema: "iron-lung/pneuma/v0.1",
  braidId: "braid:first-breath",
  status: "interpretive",
  hypothesis: "Breath/spirit is an interpretive hypothesis about received possibility.",
  questions: ["What arrived?", "What became possible?", "What arrived?"]
};

test("pneuma accepts interpretive annotation and normalizes questions", () => {
  const result = validatePneumaAnnotation(note);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.value.status, "interpretive");
  assert.deepEqual(result.value.questions, ["What arrived?", "What became possible?"]);
});

test("pneuma cannot claim evidence or smuggle literal authority fields", () => {
  const evidence = validatePneumaAnnotation({ ...note, status: "evidence" });
  assert.equal(evidence.ok, false);
  assert.equal(evidence.findings.some((finding) => finding.code === "invalid_pneuma_annotation"), true);

  const extraEvidence = validatePneumaAnnotation({ ...note, evidenceRef: "evidence:fake" });
  assert.equal(extraEvidence.ok, false);

  const extraAuthority = validatePneumaAnnotation({ ...note, authorityRef: "authority:fake" });
  assert.equal(extraAuthority.ok, false);
});

test("validating pneuma cannot change literal assimilation output", () => {
  const braidResult = validateBraid({
    schema: "iron-lung/braid/v0.1",
    id: "braid:first-breath",
    strands: {
      substance: { condition: "intact", claim: { kind: "refs", refs: ["repo:iron-lung"] } },
      lineage: { condition: "intact", claim: { kind: "refs", refs: ["origin:conversation"] } },
      authority: { condition: "intact", claim: { kind: "refs", refs: ["authority:human"] } }
    }
  });
  assert.equal(braidResult.ok, true);
  if (!braidResult.ok) return;
  const policy: AssimilationPolicyV01 = {
    schema: "iron-lung/assimilation-policy/v0.1",
    policyId: "policy:first-breath",
    acceptableConditions: { substance: ["intact"], lineage: ["intact"], authority: ["intact"] },
    requiredWitnessRefs: ["witness:first-breath"]
  };
  const input = { braid: braidResult.value, policy, suppliedWitnessRefs: ["witness:first-breath"] };
  const before = evaluateAssimilation(input);
  assert.equal(validatePneumaAnnotation(note).ok, true);
  const after = evaluateAssimilation(input);
  assert.deepEqual(after, before);
});
