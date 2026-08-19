import type { CirculationEvaluation } from "./circulation.js";
import { sortFindings, sortUniqueStrings, type Finding, type Result } from "./model.js";

export interface ProspectiveForkV01 {
  schema: "iron-lung/prospective-fork/v0.1";
  braidId: string;
  status: "proposal";
  offeredRouteIds: string[];
}

export interface SpineRouteAnnotation {
  routeId: string;
  rank: number;
  note: string;
}

export interface SpineProposalV01 {
  schema: "iron-lung/spine-proposal/v0.1";
  braidId: string;
  status: "proposal";
  annotations: SpineRouteAnnotation[];
}

export interface AnnotatedForkV01 extends ProspectiveForkV01 {
  annotations: SpineRouteAnnotation[];
}

export interface PresentRouteSelectionV01 {
  schema: "iron-lung/present-route-selection/v0.1";
  braidId: string;
  selectedRouteId: string;
  authorityRef: string;
  witnessRefs: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function invalid(detail: string, refs: string[] = []): Finding {
  return { code: "invalid_spine_proposal", detail, refs };
}

export function prepareProspectiveFork(circulation: CirculationEvaluation): Result<ProspectiveForkV01> {
  if (circulation.state !== "multiple_routes" || circulation.routeIds.length < 2) {
    return {
      ok: false,
      findings: [invalid("prospective fork requires multiple lawful routes", [circulation.braidId])],
    };
  }
  return {
    ok: true,
    value: {
      schema: "iron-lung/prospective-fork/v0.1",
      braidId: circulation.braidId,
      status: "proposal",
      offeredRouteIds: sortUniqueStrings(circulation.routeIds),
    },
    findings: [],
  };
}

export function applySpineProposal(input: {
  fork: ProspectiveForkV01;
  proposal: unknown;
}): Result<AnnotatedForkV01> {
  const findings: Finding[] = [];
  const proposal = input.proposal;
  if (!isRecord(proposal)) {
    return { ok: false, findings: [invalid("Spine proposal must be an object")] };
  }

  const exactKeys = ["annotations", "braidId", "schema", "status"];
  if (Object.keys(proposal).sort().join(",") !== exactKeys.join(",")) {
    findings.push(invalid("Spine proposal has invalid top-level fields"));
  }
  if (proposal.schema !== "iron-lung/spine-proposal/v0.1") findings.push(invalid("unsupported Spine proposal schema"));
  if (proposal.status !== "proposal") findings.push(invalid("Spine status must remain proposal"));
  if (proposal.braidId !== input.fork.braidId) findings.push(invalid("Spine proposal braid does not match fork", [input.fork.braidId]));
  if (!Array.isArray(proposal.annotations)) {
    findings.push(invalid("annotations must be an array"));
    return { ok: false, findings: sortFindings(findings) };
  }

  const offered = sortUniqueStrings(input.fork.offeredRouteIds);
  const routeSeen = new Set<string>();
  const rankSeen = new Set<number>();
  const annotations: SpineRouteAnnotation[] = [];
  for (const annotation of proposal.annotations) {
    if (!isRecord(annotation) || Object.keys(annotation).sort().join(",") !== "note,rank,routeId") {
      findings.push(invalid("annotation has invalid fields"));
      continue;
    }
    if (!nonEmptyString(annotation.routeId) || !offered.includes(annotation.routeId)) {
      findings.push(invalid("annotation names unoffered route", nonEmptyString(annotation.routeId) ? [annotation.routeId] : []));
      continue;
    }
    if (routeSeen.has(annotation.routeId)) {
      findings.push(invalid("route annotation duplicated", [annotation.routeId]));
      continue;
    }
    if (!Number.isInteger(annotation.rank) || (annotation.rank as number) <= 0) {
      findings.push(invalid("rank must be a positive integer", [annotation.routeId]));
      continue;
    }
    if (rankSeen.has(annotation.rank as number)) {
      findings.push(invalid("rank duplicated", [String(annotation.rank)]));
      continue;
    }
    if (!nonEmptyString(annotation.note)) {
      findings.push(invalid("annotation note must be non-empty", [annotation.routeId]));
      continue;
    }
    routeSeen.add(annotation.routeId);
    rankSeen.add(annotation.rank as number);
    annotations.push({ routeId: annotation.routeId, rank: annotation.rank as number, note: annotation.note });
  }

  if (routeSeen.size !== offered.length || offered.some((routeId) => !routeSeen.has(routeId))) {
    findings.push(invalid("Spine proposal must annotate every offered route exactly once", offered));
  }

  if (findings.length > 0) return { ok: false, findings: sortFindings(findings) };
  annotations.sort((a, b) => a.rank - b.rank || a.routeId.localeCompare(b.routeId));
  return {
    ok: true,
    value: {
      ...input.fork,
      offeredRouteIds: offered,
      annotations,
    },
    findings: [{ code: "proposal_only", detail: "Spine ranking is proposal-only and grants no selection authority", refs: offered }],
  };
}

export function validatePresentSelection(input: {
  braidId: string;
  offeredRouteIds: string[];
  selection: unknown;
}): Result<PresentRouteSelectionV01> {
  const selection = input.selection;
  const findings: Finding[] = [];
  if (!isRecord(selection)) {
    return { ok: false, findings: [invalid("present selection must be an object")] };
  }
  const exactKeys = ["authorityRef", "braidId", "schema", "selectedRouteId", "witnessRefs"];
  if (Object.keys(selection).sort().join(",") !== exactKeys.join(",")) {
    findings.push(invalid("present selection has invalid fields"));
  }
  if (selection.schema !== "iron-lung/present-route-selection/v0.1") findings.push(invalid("unsupported present selection schema"));
  if (selection.braidId !== input.braidId) findings.push(invalid("present selection braid does not match", [input.braidId]));
  if (!nonEmptyString(selection.selectedRouteId)) {
    findings.push({ code: "unknown_route_selection", detail: "selected route must be non-empty", refs: [] });
  } else if (!sortUniqueStrings(input.offeredRouteIds).includes(selection.selectedRouteId)) {
    findings.push({ code: "unknown_route_selection", detail: "selected route was not offered", refs: [selection.selectedRouteId] });
  }
  if (!nonEmptyString(selection.authorityRef)) findings.push(invalid("present selection authorityRef must be non-empty"));
  if (!Array.isArray(selection.witnessRefs) || selection.witnessRefs.length === 0 || !selection.witnessRefs.every(nonEmptyString)) {
    findings.push({ code: "missing_witness", detail: "present selection requires at least one witness", refs: [] });
  }

  if (findings.length > 0 || !nonEmptyString(selection.selectedRouteId) || !nonEmptyString(selection.authorityRef) || !Array.isArray(selection.witnessRefs)) {
    return { ok: false, findings: sortFindings(findings) };
  }

  return {
    ok: true,
    value: {
      schema: "iron-lung/present-route-selection/v0.1",
      braidId: input.braidId,
      selectedRouteId: selection.selectedRouteId,
      authorityRef: selection.authorityRef,
      witnessRefs: sortUniqueStrings(selection.witnessRefs as string[]),
    },
    findings: [],
  };
}
