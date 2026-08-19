import assert from "node:assert/strict";
import test from "node:test";
import { validateBraid } from "../src/braid.js";
import { validateCapabilityRegistration } from "../src/capability.js";
import { applyRepair, type RepairObservationV01 } from "../src/repair.js";
import type { PresentRouteSelectionV01 } from "../src/spine-boundary.js";

const ancestorInput = {
  schema: "iron-lung/braid/v0.1",
  id: "braid:birth:0",
  strands: {
    substance: { condition: "intact", claim: { kind: "refs", refs: ["repo:iron-lung"] } },
    lineage: { condition: "broken", claim: { kind: "refs", refs: ["origin:conversation", "projection:continuity-spine"] } },
    authority: { condition: "intact", claim: { kind: "refs", refs: ["authority:human"] } }
  }
};

const capabilityInput = {
  schema: "iron-lung/capability/v0.1",
  capabilityId: "capability:lineage:repair",
  organId: "organ:lineage",
  accepts: [{ strand: "lineage", conditions: ["broken"] }],
  requires: [
    { strand: "substance", conditions: ["intact"] },
    { strand: "authority", conditions: ["intact"] }
  ],
  mayProduce: [{ strand: "lineage", conditions: ["strained", "intact"] }],
  authorityRef: "authority:capability:lineage",
  witnessRefs: ["witness:capability:lineage"]
};

function ancestor() {
  const result = validateBraid(ancestorInput);
  assert.equal(result.ok, true);
  if (!result.ok) throw new Error("invalid ancestor fixture");
  return result.value;
}

function capability() {
  const result = validateCapabilityRegistration(capabilityInput);
  assert.equal(result.ok, true);
  if (!result.ok) throw new Error("invalid capability fixture");
  return result.value;
}

function selection(): PresentRouteSelectionV01 {
  return {
    schema: "iron-lung/present-route-selection/v0.1",
    braidId: "braid:birth:0",
    selectedRouteId: "capability:lineage:repair",
    authorityRef: "authority:present",
    witnessRefs: ["witness:present"]
  };
}

function observation(): RepairObservationV01 {
  return {
    schema: "iron-lung/repair-observation/v0.1",
    repairId: "repair:lineage:1",
    descendantId: "braid:birth:1",
    ancestorBraidId: "braid:birth:0",
    capabilityId: "capability:lineage:repair",
    strand: "lineage",
    result: {
      condition: "intact",
      claim: {
        kind: "refs",
        refs: ["origin:conversation", "projection:continuity-spine", "issue:iron-lung:1"]
      }
    },
    authorityRef: "authority:repair:lineage",
    witnessRefs: ["witness:repair:lineage"]
  };
}

test("lineage repair emits an immutable descendant and changes only the selected strand", () => {
  const source = ancestor();
  const before = structuredClone(source);
  const result = applyRepair({ ancestor: source, capability: capability(), selection: selection(), observation: observation() });
  assert.equal(result.ok, true);
  assert.deepEqual(source, before);
  if (!result.ok) return;
  assert.equal(result.value.id, "braid:birth:1");
  assert.equal(result.value.parentId, "braid:birth:0");
  assert.deepEqual(result.value.strands.substance, source.strands.substance);
  assert.deepEqual(result.value.strands.authority, source.strands.authority);
  assert.equal(result.value.strands.lineage.condition, "intact");
  assert.deepEqual(result.value.strands.lineage.claim, {
    kind: "refs",
    refs: ["issue:iron-lung:1", "origin:conversation", "projection:continuity-spine"]
  });
});

test("repair refuses identifier, selection, scope, output, witness, and lineage violations", () => {
  const mutateCases: Array<{ code: string; mutate: (parts: any) => void }> = [
    { code: "repair_scope_violation", mutate: ({ observation }: any) => { observation.ancestorBraidId = "braid:wrong"; } },
    { code: "unknown_route_selection", mutate: ({ selection }: any) => { selection.selectedRouteId = "capability:other"; } },
    { code: "unknown_route_selection", mutate: ({ observation }: any) => { observation.capabilityId = "capability:other"; } },
    { code: "repair_scope_violation", mutate: ({ observation }: any) => { observation.strand = "substance"; } },
    { code: "repair_scope_violation", mutate: ({ observation }: any) => { observation.result.condition = "refused"; } },
    { code: "missing_witness", mutate: ({ observation }: any) => { observation.witnessRefs = []; } },
    { code: "repair_scope_violation", mutate: ({ observation }: any) => { observation.descendantId = "braid:birth:0"; } },
    { code: "lineage_erasure", mutate: ({ observation }: any) => { observation.result.claim.refs = ["origin:conversation"]; } }
  ];

  for (const entry of mutateCases) {
    const parts = { ancestor: ancestor(), capability: capability(), selection: selection(), observation: observation() as any };
    entry.mutate(parts);
    const result = applyRepair(parts);
    assert.equal(result.ok, false);
    assert.equal(result.findings.some((finding) => finding.code === entry.code), true, entry.code);
  }
});

test("authority repair requires explicit change reference carried in the resulting authority strand", () => {
  const authorityCapabilityResult = validateCapabilityRegistration({
    schema: "iron-lung/capability/v0.1",
    capabilityId: "capability:authority:repair",
    organId: "organ:authority",
    accepts: [{ strand: "authority", conditions: ["refused"] }],
    requires: [{ strand: "substance", conditions: ["intact"] }],
    mayProduce: [{ strand: "authority", conditions: ["intact"] }],
    authorityRef: "authority:capability:authority",
    witnessRefs: ["witness:capability:authority"]
  });
  assert.equal(authorityCapabilityResult.ok, true);
  if (!authorityCapabilityResult.ok) return;

  const authorityAncestorResult = validateBraid({
    ...ancestorInput,
    strands: {
      ...ancestorInput.strands,
      authority: { condition: "refused", claim: { kind: "refs", refs: ["authority:old"] } }
    }
  });
  assert.equal(authorityAncestorResult.ok, true);
  if (!authorityAncestorResult.ok) return;

  const authoritySelection: PresentRouteSelectionV01 = {
    ...selection(),
    selectedRouteId: "capability:authority:repair"
  };
  const baseObservation = {
    ...observation(),
    capabilityId: "capability:authority:repair",
    strand: "authority",
    result: { condition: "intact", claim: { kind: "refs", refs: ["authority:old", "authority:change:1"] } }
  } as any;

  const missingChangeRef = applyRepair({
    ancestor: authorityAncestorResult.value,
    capability: authorityCapabilityResult.value,
    selection: authoritySelection,
    observation: baseObservation
  });
  assert.equal(missingChangeRef.ok, false);
  assert.equal(missingChangeRef.findings.some((finding) => finding.code === "authority_escalation"), true);

  const allowed = applyRepair({
    ancestor: authorityAncestorResult.value,
    capability: authorityCapabilityResult.value,
    selection: authoritySelection,
    observation: { ...baseObservation, authorityChangeRef: "authority:change:1" }
  });
  assert.equal(allowed.ok, true);
});
