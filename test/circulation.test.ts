import assert from "node:assert/strict";
import test from "node:test";
import { validateBraid } from "../src/braid.js";
import { validateCapabilityRegistration } from "../src/capability.js";
import { evaluateCirculation } from "../src/circulation.js";

const braidInput = {
  schema: "iron-lung/braid/v0.1",
  id: "braid:birth:0",
  strands: {
    substance: { condition: "intact", claim: { kind: "refs", refs: ["repo:iron-lung"] } },
    lineage: { condition: "broken", claim: { kind: "refs", refs: ["origin:conversation"] } },
    authority: { condition: "intact", claim: { kind: "refs", refs: ["authority:human"] } }
  }
};

function capability(capabilityId: string, organId = capabilityId) {
  return {
    schema: "iron-lung/capability/v0.1",
    capabilityId,
    organId,
    accepts: [{ strand: "lineage", conditions: ["broken"] }],
    requires: [
      { strand: "substance", conditions: ["intact"] },
      { strand: "authority", conditions: ["intact"] }
    ],
    mayProduce: [{ strand: "lineage", conditions: ["intact", "strained"] }],
    authorityRef: `authority:${capabilityId}`,
    witnessRefs: [`witness:${capabilityId}`]
  };
}

function validBraid() {
  const result = validateBraid(braidInput);
  assert.equal(result.ok, true);
  if (!result.ok) throw new Error("fixture braid invalid");
  return result.value;
}

function validCapability(input: unknown) {
  const result = validateCapabilityRegistration(input);
  assert.equal(result.ok, true);
  if (!result.ok) throw new Error("fixture capability invalid");
  return result.value;
}

test("discovers the complete admitted repair manifold without selecting", () => {
  const a = validCapability(capability("capability:lineage:a"));
  const b = validCapability(capability("capability:lineage:b"));
  const hidden = validCapability(capability("capability:lineage:hidden"));

  const result = evaluateCirculation({
    braid: validBraid(),
    capabilities: [hidden, b, a],
    admittedCapabilityIds: [b.capabilityId, a.capabilityId]
  });

  assert.equal(result.circulable, true);
  assert.equal(result.state, "multiple_routes");
  assert.deepEqual(result.routeIds, ["capability:lineage:a", "capability:lineage:b"]);
  assert.equal(result.findings.some((finding) => finding.code === "unadmitted_capability"), true);
  assert.equal(result.findings.some((finding) => finding.code === "multiple_routes_require_selection"), true);
});

test("no admitted matching capability is a stable no-route result", () => {
  const a = validCapability(capability("capability:lineage:a"));
  const result = evaluateCirculation({
    braid: validBraid(),
    capabilities: [a],
    admittedCapabilityIds: []
  });
  assert.equal(result.circulable, true);
  assert.equal(result.state, "no_route");
  assert.deepEqual(result.routeIds, []);
  assert.equal(result.findings.some((finding) => finding.code === "no_repair_route"), true);
});

test("circulation output is independent of capability and admission input order", () => {
  const a = validCapability(capability("capability:lineage:a"));
  const b = validCapability(capability("capability:lineage:b"));
  const braid = validBraid();
  const forward = evaluateCirculation({
    braid,
    capabilities: [a, b],
    admittedCapabilityIds: [a.capabilityId, b.capabilityId]
  });
  const reverse = evaluateCirculation({
    braid,
    capabilities: [b, a],
    admittedCapabilityIds: [b.capabilityId, a.capabilityId]
  });
  assert.deepEqual(reverse, forward);
});

test("capability validation rejects unbounded or unverifiable registrations", () => {
  const cases = [
    { mutate: (value: any) => { value.accepts = []; } },
    { mutate: (value: any) => { value.mayProduce = []; } },
    { mutate: (value: any) => { value.authorityRef = ""; } },
    { mutate: (value: any) => { value.witnessRefs = []; } },
    { mutate: (value: any) => { value.accepts.push({ strand: "lineage", conditions: ["broken"] }); } },
    { mutate: (value: any) => { value.mayProduce = [{ strand: "substance", conditions: ["intact"] }]; } }
  ];

  for (const { mutate } of cases) {
    const candidate = capability("capability:invalid");
    mutate(candidate);
    const result = validateCapabilityRegistration(candidate);
    assert.equal(result.ok, false);
    assert.equal(result.findings.some((finding) => finding.code === "invalid_capability"), true);
  }
});
