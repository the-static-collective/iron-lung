import assert from "node:assert/strict";
import test from "node:test";
import { prepareProspectiveFork, applySpineProposal, validatePresentSelection } from "../src/spine-boundary.js";
import type { CirculationEvaluation } from "../src/circulation.js";

const circulation: CirculationEvaluation = {
  schema: "iron-lung/circulation-evaluation/v0.1",
  braidId: "braid:birth:0",
  circulable: true,
  state: "multiple_routes",
  routeIds: ["capability:b", "capability:a"],
  findings: []
};

function proposal() {
  return {
    schema: "iron-lung/spine-proposal/v0.1",
    braidId: "braid:birth:0",
    status: "proposal",
    annotations: [
      { routeId: "capability:b", rank: 2, note: "slower" },
      { routeId: "capability:a", rank: 1, note: "preserves lineage" }
    ]
  };
}

test("multi-route circulation ascends as full proposal-only fork", () => {
  const forkResult = prepareProspectiveFork(circulation);
  assert.equal(forkResult.ok, true);
  if (!forkResult.ok) return;
  assert.deepEqual(forkResult.value, {
    schema: "iron-lung/prospective-fork/v0.1",
    braidId: "braid:birth:0",
    status: "proposal",
    offeredRouteIds: ["capability:a", "capability:b"]
  });

  const annotated = applySpineProposal({ fork: forkResult.value, proposal: proposal() });
  assert.equal(annotated.ok, true);
  if (!annotated.ok) return;
  assert.deepEqual(annotated.value.annotations.map((item) => item.routeId), ["capability:a", "capability:b"]);
  assert.equal(annotated.findings.some((finding) => finding.code === "proposal_only"), true);
  assert.equal("selectedRouteId" in annotated.value, false);
  assert.equal("authorityRef" in annotated.value, false);
});

test("Spine proposal cannot smuggle selection or malformed route ranking", () => {
  const forkResult = prepareProspectiveFork(circulation);
  assert.equal(forkResult.ok, true);
  if (!forkResult.ok) return;

  const cases: Array<(value: any) => void> = [
    (value) => { value.braidId = "braid:other"; },
    (value) => { value.annotations.pop(); },
    (value) => { value.annotations[1].routeId = "capability:outside"; },
    (value) => { value.annotations[1].routeId = value.annotations[0].routeId; },
    (value) => { value.annotations[1].rank = value.annotations[0].rank; },
    (value) => { value.annotations[1].rank = 0; },
    (value) => { value.status = "constituted"; },
    (value) => { value.selectedRouteId = "capability:a"; },
    (value) => { value.authorityRef = "authority:fake"; }
  ];

  for (const mutate of cases) {
    const candidate = proposal() as any;
    mutate(candidate);
    const result = applySpineProposal({ fork: forkResult.value, proposal: candidate });
    assert.equal(result.ok, false);
    assert.equal(result.findings.some((finding) => finding.code === "invalid_spine_proposal"), true);
  }
});

test("present selection is separate explicit authority and rank one never selects itself", () => {
  const forkResult = prepareProspectiveFork(circulation);
  assert.equal(forkResult.ok, true);
  if (!forkResult.ok) return;
  const annotated = applySpineProposal({ fork: forkResult.value, proposal: proposal() });
  assert.equal(annotated.ok, true);
  if (!annotated.ok) return;

  const selected = validatePresentSelection({
    braidId: annotated.value.braidId,
    offeredRouteIds: annotated.value.offeredRouteIds,
    selection: {
      schema: "iron-lung/present-route-selection/v0.1",
      braidId: "braid:birth:0",
      selectedRouteId: "capability:b",
      authorityRef: "authority:present",
      witnessRefs: ["witness:z", "witness:a", "witness:a"]
    }
  });
  assert.equal(selected.ok, true);
  if (!selected.ok) return;
  assert.equal(selected.value.selectedRouteId, "capability:b");
  assert.deepEqual(selected.value.witnessRefs, ["witness:a", "witness:z"]);

  const outside = validatePresentSelection({
    braidId: annotated.value.braidId,
    offeredRouteIds: annotated.value.offeredRouteIds,
    selection: {
      schema: "iron-lung/present-route-selection/v0.1",
      braidId: "braid:birth:0",
      selectedRouteId: "capability:outside",
      authorityRef: "authority:present",
      witnessRefs: ["witness:present"]
    }
  });
  assert.equal(outside.ok, false);
  assert.equal(outside.findings.some((finding) => finding.code === "unknown_route_selection"), true);
});

test("present selection requires matching braid, authority, and witness", () => {
  const offeredRouteIds = ["capability:a", "capability:b"];
  const base = {
    schema: "iron-lung/present-route-selection/v0.1",
    braidId: "braid:birth:0",
    selectedRouteId: "capability:a",
    authorityRef: "authority:present",
    witnessRefs: ["witness:present"]
  };
  const cases: Array<(value: any) => void> = [
    (value) => { value.braidId = "braid:wrong"; },
    (value) => { value.authorityRef = ""; },
    (value) => { value.witnessRefs = []; }
  ];
  for (const mutate of cases) {
    const candidate = structuredClone(base) as any;
    mutate(candidate);
    const result = validatePresentSelection({ braidId: "braid:birth:0", offeredRouteIds, selection: candidate });
    assert.equal(result.ok, false);
  }
});
