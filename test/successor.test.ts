import assert from "node:assert/strict";
import test from "node:test";
import { applySuccessor, createInitialCut, sameBody, type SuccessorCutV01 } from "../src/successor.js";

function unwrap<T>(result: { ok: true; value: T } | { ok: false; findings: unknown[] }): T {
  assert.equal(result.ok, true);
  if (!result.ok) throw new Error("expected valid successor result");
  return result.value;
}

function initial<T>(body: T, cutId = "cut:0"): SuccessorCutV01<T> {
  return unwrap(createInitialCut(cutId, body));
}

test("admitted successor changes body and advances exactly one attributable cut", () => {
  const prior = initial({ value: 1 });
  const before = structuredClone(prior);
  const transition = unwrap(applySuccessor({
    prior,
    nextCutId: "cut:1",
    receiptId: "receipt:1",
    eventId: "event:1",
    eventKind: "vary",
    disposition: "admitted",
    nextBody: { value: 2 },
    refs: ["witness:b", "witness:a", "witness:a"],
  }));

  assert.deepEqual(prior, before);
  assert.equal(transition.cut.ordinal, 1);
  assert.equal(transition.cut.parentCutId, "cut:0");
  assert.deepEqual(transition.cut.receiptIds, ["receipt:1"]);
  assert.deepEqual(transition.cut.eventIds, ["event:1"]);
  assert.deepEqual(transition.cut.body, { value: 2 });
  assert.equal(transition.receipt.ordinalBefore, 0);
  assert.equal(transition.receipt.ordinalAfter, 1);
  assert.equal(transition.receipt.bodyChanged, true);
  assert.deepEqual(transition.receipt.refs, ["witness:a", "witness:b"]);
});

test("refusal leaves body equal while history still advances", () => {
  const prior = initial({ value: 1 });
  const transition = unwrap(applySuccessor({
    prior,
    nextCutId: "cut:refused",
    receiptId: "receipt:refused",
    eventId: "event:refused",
    eventKind: "constitute",
    disposition: "refused",
    nextBody: { value: 1 },
  }));

  assert.equal(sameBody(prior, transition.cut), true);
  assert.equal(transition.cut.ordinal, 1);
  assert.notEqual(transition.cut.cutId, prior.cutId);
  assert.deepEqual(transition.cut.receiptIds, ["receipt:refused"]);
  assert.equal(transition.receipt.bodyChanged, false);
});

test("no-op leaves body equal while producing a distinct receipted successor", () => {
  const prior = initial({ status: "stable" });
  const transition = unwrap(applySuccessor({
    prior,
    nextCutId: "cut:noop",
    receiptId: "receipt:noop",
    eventId: "event:noop",
    eventKind: "observe",
    disposition: "no-op",
    nextBody: { status: "stable" },
  }));

  assert.equal(sameBody(prior, transition.cut), true);
  assert.equal(transition.cut.ordinal, prior.ordinal + 1);
  assert.equal(transition.receipt.priorCutId, prior.cutId);
  assert.equal(transition.receipt.nextCutId, transition.cut.cutId);
});

test("four quarter-turn successors return the body but not the historical world", () => {
  const origin = initial({ orientation: 0 });
  let current = origin;

  for (let step = 1; step <= 4; step += 1) {
    const nextOrientation = step % 4;
    current = unwrap(applySuccessor({
      prior: current,
      nextCutId: `cut:rot:${step}`,
      receiptId: `receipt:rot:${step}`,
      eventId: `event:rot:${step}`,
      eventKind: "rotate-quarter",
      disposition: "admitted",
      nextBody: { orientation: nextOrientation },
    })).cut;
  }

  assert.equal(sameBody(origin, current), true);
  assert.equal(origin.ordinal, 0);
  assert.equal(current.ordinal, 4);
  assert.notEqual(current.cutId, origin.cutId);
  assert.deepEqual(current.receiptIds, [
    "receipt:rot:1",
    "receipt:rot:2",
    "receipt:rot:3",
    "receipt:rot:4",
  ]);
});

test("reset may restore an earlier body projection without restoring the earlier world", () => {
  const origin = initial({ mode: "A" });
  const changed = unwrap(applySuccessor({
    prior: origin,
    nextCutId: "cut:changed",
    receiptId: "receipt:changed",
    eventId: "event:changed",
    eventKind: "vary",
    disposition: "admitted",
    nextBody: { mode: "B" },
  })).cut;
  const reset = unwrap(applySuccessor({
    prior: changed,
    nextCutId: "cut:reset",
    receiptId: "receipt:reset",
    eventId: "event:reset",
    eventKind: "reset-body",
    disposition: "admitted",
    nextBody: { mode: "A" },
  })).cut;

  assert.equal(sameBody(origin, reset), true);
  assert.notEqual(origin.cutId, reset.cutId);
  assert.equal(reset.ordinal, 2);
  assert.deepEqual(reset.receiptIds, ["receipt:changed", "receipt:reset"]);
});

test("siblings may share body and ordinal while remaining distinct successor histories", () => {
  const parent = initial({ value: 1 });
  const left = unwrap(applySuccessor({
    prior: parent,
    nextCutId: "cut:left",
    receiptId: "receipt:left",
    eventId: "event:left",
    eventKind: "observe-left",
    disposition: "no-op",
    nextBody: { value: 1 },
  })).cut;
  const right = unwrap(applySuccessor({
    prior: parent,
    nextCutId: "cut:right",
    receiptId: "receipt:right",
    eventId: "event:right",
    eventKind: "observe-right",
    disposition: "no-op",
    nextBody: { value: 1 },
  })).cut;

  assert.equal(left.ordinal, right.ordinal);
  assert.equal(sameBody(left, right), true);
  assert.notEqual(left.cutId, right.cutId);
  assert.notDeepEqual(left.receiptIds, right.receiptIds);
  assert.equal(left.parentCutId, parent.cutId);
  assert.equal(right.parentCutId, parent.cutId);
});

test("invalid successor inputs are refused as domain findings", () => {
  const prior = initial({ value: 1 });
  const valid = {
    prior,
    nextCutId: "cut:1",
    receiptId: "receipt:1",
    eventId: "event:1",
    eventKind: "vary",
    disposition: "admitted" as const,
    nextBody: { value: 2 },
  };

  const invalidCases = [
    { ...valid, nextCutId: prior.cutId },
    { ...valid, nextCutId: "" },
    { ...valid, receiptId: "" },
    { ...valid, eventId: "" },
    { ...valid, eventKind: "" },
  ];

  for (const candidate of invalidCases) {
    const result = applySuccessor(candidate);
    assert.equal(result.ok, false);
    if (result.ok) continue;
    assert.equal(result.findings.some((finding) => finding.code === "invalid_successor"), true);
  }

  const first = unwrap(applySuccessor(valid)).cut;
  const duplicateEvent = applySuccessor({
    prior: first,
    nextCutId: "cut:2",
    receiptId: "receipt:2",
    eventId: "event:1",
    eventKind: "vary",
    disposition: "admitted",
    nextBody: { value: 3 },
  });
  assert.equal(duplicateEvent.ok, false);
  if (!duplicateEvent.ok) {
    assert.equal(duplicateEvent.findings.some((finding) => finding.code === "duplicate_successor_event"), true);
  }

  const duplicateReceipt = applySuccessor({
    prior: first,
    nextCutId: "cut:2b",
    receiptId: "receipt:1",
    eventId: "event:2b",
    eventKind: "vary",
    disposition: "admitted",
    nextBody: { value: 3 },
  });
  assert.equal(duplicateReceipt.ok, false);
  if (!duplicateReceipt.ok) {
    assert.equal(duplicateReceipt.findings.some((finding) => finding.code === "duplicate_successor_event"), true);
  }
});
