import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { replayFirstBreathFixture } from "../scripts/first-breath.js";

const fixture = JSON.parse(
  readFileSync(new URL("../fixtures/first-breath-v01.json", import.meta.url), "utf8")
);

test("own birth reaches a structurally assimilable first breath without self-selection", () => {
  const before = structuredClone(fixture);
  const receipt = replayFirstBreathFixture(fixture);
  assert.deepEqual(receipt, {
    schema: "iron-lung/first-breath-receipt/v0.1",
    initialBraidId: "braid:iron-lung:birth:0",
    initialCirculation: "multiple_routes",
    spineStatus: "proposal_only",
    offeredRouteIds: [
      "capability:birth-lineage:conversation-only",
      "capability:birth-lineage:project-backed"
    ],
    selectedRouteId: "capability:birth-lineage:project-backed",
    descendantBraidId: "braid:iron-lung:birth:1",
    descendantParentId: "braid:iron-lung:birth:0",
    descendantCirculation: "no_route",
    assimilation: "assimilable",
    pneumaStatus: "interpretive"
  });
  assert.deepEqual(fixture, before);
  assert.deepEqual(replayFirstBreathFixture(fixture), receipt);
});
