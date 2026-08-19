import { validateCapabilityRegistration, capabilityMatchesBraid, type CapabilityRegistrationV01 } from "./capability.js";
import { sortFindings, sortUniqueStrings, type BraidV01, type Finding } from "./model.js";

export interface CirculationEvaluation {
  schema: "iron-lung/circulation-evaluation/v0.1";
  braidId: string;
  circulable: true;
  state: "no_route" | "one_route" | "multiple_routes";
  routeIds: string[];
  findings: Finding[];
}

export function evaluateCirculation(input: {
  braid: BraidV01;
  capabilities: CapabilityRegistrationV01[];
  admittedCapabilityIds: string[];
}): CirculationEvaluation {
  const findings: Finding[] = [];
  const admitted = new Set(sortUniqueStrings(input.admittedCapabilityIds));
  const routes = new Set<string>();
  const seenCapabilityIds = new Set<string>();

  const candidates = input.capabilities
    .map((capability) => validateCapabilityRegistration(capability))
    .sort((a, b) => {
      const aId = a.ok ? a.value.capabilityId : "";
      const bId = b.ok ? b.value.capabilityId : "";
      return aId.localeCompare(bId);
    });

  for (const result of candidates) {
    if (!result.ok) {
      findings.push(...result.findings);
      continue;
    }
    const capability = result.value;
    if (seenCapabilityIds.has(capability.capabilityId)) {
      findings.push({
        code: "invalid_capability",
        detail: `duplicate capabilityId ${capability.capabilityId}`,
        refs: [capability.capabilityId],
      });
      continue;
    }
    seenCapabilityIds.add(capability.capabilityId);

    if (!capabilityMatchesBraid(capability, input.braid)) continue;
    if (!admitted.has(capability.capabilityId)) {
      findings.push({
        code: "unadmitted_capability",
        detail: `matching capability ${capability.capabilityId} is not admitted`,
        refs: [capability.capabilityId],
      });
      continue;
    }
    routes.add(capability.capabilityId);
  }

  const routeIds = sortUniqueStrings([...routes]);
  let state: CirculationEvaluation["state"];
  if (routeIds.length === 0) {
    state = "no_route";
    findings.push({ code: "no_repair_route", detail: "no admitted capability matches the braid", refs: [input.braid.id] });
  } else if (routeIds.length === 1) {
    state = "one_route";
  } else {
    state = "multiple_routes";
    findings.push({
      code: "multiple_routes_require_selection",
      detail: "multiple lawful routes require explicit present selection",
      refs: routeIds,
    });
  }

  return {
    schema: "iron-lung/circulation-evaluation/v0.1",
    braidId: input.braid.id,
    circulable: true,
    state,
    routeIds,
    findings: sortFindings(findings),
  };
}
