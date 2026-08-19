import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { validateBraid } from "../src/braid.js";
import { validateCapabilityRegistration, type CapabilityRegistrationV01 } from "../src/capability.js";
import { evaluateCirculation } from "../src/circulation.js";
import { prepareProspectiveFork, applySpineProposal, validatePresentSelection } from "../src/spine-boundary.js";
import { applyRepair, type RepairObservationV01 } from "../src/repair.js";
import { evaluateAssimilation, type AssimilationPolicyV01 } from "../src/assimilation.js";
import { validatePneumaAnnotation } from "../src/pneuma.js";
import type { Result } from "../src/model.js";

export interface FirstBreathReceiptV01 {
  schema: "iron-lung/first-breath-receipt/v0.1";
  initialBraidId: string;
  initialCirculation: "multiple_routes";
  spineStatus: "proposal_only";
  offeredRouteIds: string[];
  selectedRouteId: string;
  descendantBraidId: string;
  descendantParentId: string;
  descendantCirculation: "no_route" | "one_route" | "multiple_routes";
  assimilation: "assimilable" | "blocked";
  pneumaStatus: "interpretive";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function unwrap<T>(label: string, result: Result<T>): T {
  if (!result.ok) {
    throw new Error(`${label}: ${JSON.stringify(result.findings)}`);
  }
  return result.value;
}

function stringArray(label: string, value: unknown): string[] {
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string" && item.trim().length > 0)) {
    throw new Error(`${label}: expected array of non-empty refs`);
  }
  return [...value];
}

export function replayFirstBreathFixture(input: unknown): FirstBreathReceiptV01 {
  if (!isRecord(input)) throw new Error("fixture: expected object");

  const birthBraid = unwrap("birth braid", validateBraid(input.birthBraid));

  if (!Array.isArray(input.capabilities)) throw new Error("capabilities: expected array");
  const capabilities: CapabilityRegistrationV01[] = input.capabilities.map((candidate, index) =>
    unwrap(`capability[${index}]`, validateCapabilityRegistration(candidate))
  );
  const admittedCapabilityIds = stringArray("admittedCapabilityIds", input.admittedCapabilityIds);

  const initialCirculation = evaluateCirculation({
    braid: birthBraid,
    capabilities,
    admittedCapabilityIds,
  });
  if (initialCirculation.state !== "multiple_routes") {
    throw new Error(`initial circulation: expected multiple_routes, got ${initialCirculation.state}`);
  }

  const fork = unwrap("prospective fork", prepareProspectiveFork(initialCirculation));
  const annotatedForkResult = applySpineProposal({ fork, proposal: input.spineProposal });
  const annotatedFork = unwrap("Spine proposal", annotatedForkResult);
  if (!annotatedForkResult.findings.some((finding) => finding.code === "proposal_only")) {
    throw new Error("Spine proposal: missing proposal_only boundary finding");
  }

  const selection = unwrap("present selection", validatePresentSelection({
    braidId: annotatedFork.braidId,
    offeredRouteIds: annotatedFork.offeredRouteIds,
    selection: input.selection,
  }));

  const selectedCapability = capabilities.find((capability) => capability.capabilityId === selection.selectedRouteId);
  if (!selectedCapability) {
    throw new Error(`present selection: selected capability ${selection.selectedRouteId} was not supplied`);
  }

  const descendant = unwrap("repair", applyRepair({
    ancestor: birthBraid,
    capability: selectedCapability,
    selection,
    observation: input.repairObservation as RepairObservationV01,
  }));
  const validatedDescendant = unwrap("descendant braid", validateBraid(descendant));
  if (!validatedDescendant.parentId) throw new Error("descendant braid: missing parentId");

  const descendantCirculation = evaluateCirculation({
    braid: validatedDescendant,
    capabilities,
    admittedCapabilityIds,
  });

  if (!isRecord(input.assimilationPolicy)) throw new Error("assimilationPolicy: expected object");
  const assimilation = evaluateAssimilation({
    braid: validatedDescendant,
    policy: input.assimilationPolicy as unknown as AssimilationPolicyV01,
    suppliedWitnessRefs: stringArray("assimilationWitnessRefs", input.assimilationWitnessRefs),
  });

  const pneuma = unwrap("pneuma", validatePneumaAnnotation(input.pneuma));
  if (pneuma.braidId !== validatedDescendant.id) {
    throw new Error(`pneuma: annotation targets ${pneuma.braidId}, expected ${validatedDescendant.id}`);
  }

  return {
    schema: "iron-lung/first-breath-receipt/v0.1",
    initialBraidId: birthBraid.id,
    initialCirculation: "multiple_routes",
    spineStatus: "proposal_only",
    offeredRouteIds: [...annotatedFork.offeredRouteIds],
    selectedRouteId: selection.selectedRouteId,
    descendantBraidId: validatedDescendant.id,
    descendantParentId: validatedDescendant.parentId,
    descendantCirculation: descendantCirculation.state,
    assimilation: assimilation.state,
    pneumaStatus: pneuma.status,
  };
}

function runCli(): void {
  const fixture = JSON.parse(
    readFileSync(new URL("../fixtures/first-breath-v01.json", import.meta.url), "utf8")
  );
  const receipt = replayFirstBreathFixture(fixture);
  process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : undefined;
if (invokedPath && fileURLToPath(import.meta.url) === invokedPath) {
  runCli();
}
