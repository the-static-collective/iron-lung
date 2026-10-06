import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { buildCombinatrixField, executeCombinatrix } from "../src/combinatrix.js";
import { replayHeart001 } from "../scripts/combinatrix-heart-001.js";

function fixture() {
  return JSON.parse(readFileSync(new URL("../fixtures/combinatrix-heart-001.json", import.meta.url), "utf8"));
}

test("bounded 2x2 combinatrix preserves four plural candidate worlds", () => {
  const input = fixture();
  const field = buildCombinatrixField(input);
  assert.equal(field.authority, "none");
  assert.equal(field.selection, "NONE");
  assert.deepEqual(field.candidates.map((c) => [c.candidateId, c.rank, c.disposition]), [
    ["C1", 1, "requires_warrant"],
    ["C2", 2, "refused"],
    ["C3", 3, "unresolved"],
    ["C4", 4, "requires_warrant"],
  ]);
});

test("rank one never selects itself and missing warrant blocks consequence", () => {
  const input = fixture();
  input.selection.selectedRouteId = "C1";
  input.warrantRefs = [];
  assert.throws(() => executeCombinatrix(input), /missing warrant refs: warrant:W1/);
});

test("explicitly refused candidate cannot cross even with present authority", () => {
  const input = fixture();
  input.selection.selectedRouteId = "C2";
  assert.throws(() => executeCombinatrix(input), /candidate refused by rule:R2/);
});

test("unresolved candidate remains unresolved instead of being guessed through", () => {
  const input = fixture();
  input.selection.selectedRouteId = "C3";
  assert.throws(() => executeCombinatrix(input), /candidate unresolved pending witness:H3/);
});

test("external admission may select rank four and emits immutable descendant plus residue", () => {
  const input = fixture();
  const before = structuredClone(input.braid);
  const result = executeCombinatrix(input);

  assert.deepEqual(input.braid, before);
  assert.equal(result.receipt.selectedCandidateId, "C4");
  assert.equal(result.receipt.selectedCandidateRank, 4);
  assert.equal(result.descendant.id, "braid:heart-001:B1");
  assert.equal(result.descendant.parentId, "braid:heart-001:B0");
  assert.deepEqual(result.descendant.strands.authority, input.braid.strands.authority);
  assert.deepEqual(result.receipt.residue.map((r) => [r.candidateId, r.disposition]), [
    ["C1", "requires_warrant"],
    ["C2", "refused"],
    ["C3", "unresolved"],
  ]);
});

test("B1 recirculates from descendant state and terminates with no candidate field", () => {
  const result = replayHeart001(fixture());
  assert.equal(result.recirculatedField.braidId, "braid:heart-001:B1");
  assert.deepEqual(result.recirculatedField.gapIds, []);
  assert.deepEqual(result.recirculatedField.candidates, []);
  assert.throws(() => executeCombinatrix({
    ...fixture(),
    braid: result.descendant,
    gaps: [],
    fragments: [],
    policies: [],
    selection: {
      ...fixture().selection,
      braidId: result.descendant.id,
    },
  }), /no candidate field exists; no Heart beat is available/);
});

test("authority is not a generative gap surface", () => {
  const input = fixture();
  input.gaps.push({ gapId: "gap:authority:0", strand: "authority" });
  assert.throws(() => buildCombinatrixField(input));
});

test("candidate policies must cover the bounded Cartesian product exactly once", () => {
  const input = fixture();
  input.policies.pop();
  assert.throws(() => buildCombinatrixField(input), /complete bounded combinatrix/);
});

test("deterministic replay returns the same field, descendant, and receipt", () => {
  const a = replayHeart001(fixture());
  const b = replayHeart001(fixture());
  assert.deepEqual(a, b);
});
