import { validateBraid } from "./braid.js";
import { capabilityMatchesBraid, type CapabilityRegistrationV01 } from "./capability.js";
import {
  STRAND_NAMES,
  sortFindings,
  type BraidStrand,
  type BraidV01,
  type Finding,
  type Result,
  type StrandName,
} from "./model.js";
import type { PresentRouteSelectionV01 } from "./spine-boundary.js";

export interface RepairObservationV01 {
  schema: "iron-lung/repair-observation/v0.1";
  repairId: string;
  descendantId: string;
  ancestorBraidId: string;
  capabilityId: string;
  strand: StrandName;
  result: BraidStrand;
  authorityRef: string;
  authorityChangeRef?: string;
  witnessRefs: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function finding(code: Finding["code"], detail: string, refs: string[] = []): Finding {
  return { code, detail, refs };
}

function sameStrand(a: BraidStrand, b: BraidStrand): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function claimRefs(strand: BraidStrand): string[] {
  return strand.claim.kind === "refs" ? strand.claim.refs : [];
}

export function applyRepair(input: {
  ancestor: BraidV01;
  capability: CapabilityRegistrationV01;
  selection: PresentRouteSelectionV01;
  observation: RepairObservationV01;
}): Result<BraidV01> {
  const findings: Finding[] = [];
  const observation = input.observation as unknown;
  if (!isRecord(observation)) {
    return { ok: false, findings: [finding("repair_scope_violation", "repair observation must be an object")] };
  }

  const allowedKeys = new Set([
    "schema", "repairId", "descendantId", "ancestorBraidId", "capabilityId", "strand",
    "result", "authorityRef", "authorityChangeRef", "witnessRefs",
  ]);
  for (const key of Object.keys(observation)) {
    if (!allowedKeys.has(key)) findings.push(finding("repair_scope_violation", `unexpected repair field ${key}`, [key]));
  }

  if (observation.schema !== "iron-lung/repair-observation/v0.1") {
    findings.push(finding("repair_scope_violation", "unsupported repair observation schema"));
  }
  for (const field of ["repairId", "descendantId", "ancestorBraidId", "capabilityId", "authorityRef"] as const) {
    if (!nonEmptyString(observation[field])) findings.push(finding("repair_scope_violation", `${field} must be non-empty`, [field]));
  }
  if (observation.ancestorBraidId !== input.ancestor.id) {
    findings.push(finding("repair_scope_violation", "repair ancestor does not match supplied ancestor", [input.ancestor.id]));
  }
  if (input.selection.braidId !== input.ancestor.id) {
    findings.push(finding("unknown_route_selection", "selection does not target supplied ancestor", [input.selection.braidId]));
  }
  if (input.selection.selectedRouteId !== input.capability.capabilityId) {
    findings.push(finding("unknown_route_selection", "selected route does not match supplied capability", [input.selection.selectedRouteId, input.capability.capabilityId]));
  }
  if (observation.capabilityId !== input.capability.capabilityId) {
    findings.push(finding("unknown_route_selection", "repair observation capability was not selected", nonEmptyString(observation.capabilityId) ? [observation.capabilityId] : []));
  }
  if (!capabilityMatchesBraid(input.capability, input.ancestor)) {
    findings.push(finding("repair_scope_violation", "selected capability does not accept current ancestor state", [input.capability.capabilityId]));
  }

  if (!(STRAND_NAMES as readonly unknown[]).includes(observation.strand)) {
    findings.push(finding("repair_scope_violation", "repair strand is invalid"));
  }
  const strand = observation.strand as StrandName;
  const accepted = input.capability.accepts.find((constraint) => constraint.strand === strand);
  const produced = input.capability.mayProduce.find((constraint) => constraint.strand === strand);
  if (!accepted || !produced) {
    findings.push(finding("repair_scope_violation", "repair targets strand outside capability scope", [String(observation.strand)]));
  }

  if (!isRecord(observation.result) || typeof observation.result.condition !== "string") {
    findings.push(finding("repair_scope_violation", "repair result must be a braid strand", [String(observation.strand)]));
  } else if (produced && !produced.conditions.includes(observation.result.condition as never)) {
    findings.push(finding("repair_scope_violation", "repair result condition is outside mayProduce", [String(observation.result.condition)]));
  }

  if (!Array.isArray(observation.witnessRefs) || observation.witnessRefs.length === 0 || !observation.witnessRefs.every(nonEmptyString)) {
    findings.push(finding("missing_witness", "repair requires at least one witness", [input.capability.capabilityId]));
  }
  if (observation.descendantId === input.ancestor.id) {
    findings.push(finding("repair_scope_violation", "repair descendant must have a fresh id", [input.ancestor.id]));
  }

  let resultStrand: BraidStrand | undefined;
  if ((STRAND_NAMES as readonly unknown[]).includes(observation.strand) && isRecord(observation.result)) {
    const probe = {
      schema: "iron-lung/braid/v0.1",
      id: "braid:repair-result-probe",
      strands: {
        substance: structuredClone(input.ancestor.strands.substance),
        lineage: structuredClone(input.ancestor.strands.lineage),
        authority: structuredClone(input.ancestor.strands.authority),
      },
    };
    (probe.strands as Record<StrandName, unknown>)[strand] = structuredClone(observation.result);
    const resultValidation = validateBraid(probe);
    if (!resultValidation.ok) {
      findings.push(...resultValidation.findings.map((item) =>
        finding("repair_scope_violation", `invalid repair result: ${item.detail}`, item.refs)
      ));
    } else {
      resultStrand = resultValidation.value.strands[strand];
    }
  }

  if (findings.length > 0 || !resultStrand) {
    return { ok: false, findings: sortFindings(findings) };
  }

  if (strand === "lineage") {
    const priorRefs = claimRefs(input.ancestor.strands.lineage);
    const nextRefs = new Set(claimRefs(resultStrand));
    if (priorRefs.some((ref) => !nextRefs.has(ref))) {
      findings.push(finding("lineage_erasure", "lineage repair may not erase prior lineage refs", priorRefs.filter((ref) => !nextRefs.has(ref))));
    }
  }

  if (strand === "authority" && !sameStrand(input.ancestor.strands.authority, resultStrand)) {
    if (!nonEmptyString(observation.authorityChangeRef)) {
      findings.push(finding("authority_escalation", "authority change requires explicit authorityChangeRef"));
    } else if (!claimRefs(resultStrand).includes(observation.authorityChangeRef)) {
      findings.push(finding("authority_escalation", "authorityChangeRef must be carried in resulting authority refs", [observation.authorityChangeRef]));
    }
  }

  if (findings.length > 0) return { ok: false, findings: sortFindings(findings) };

  const candidate = {
    schema: "iron-lung/braid/v0.1",
    id: observation.descendantId,
    parentId: input.ancestor.id,
    strands: {
      substance: structuredClone(input.ancestor.strands.substance),
      lineage: structuredClone(input.ancestor.strands.lineage),
      authority: structuredClone(input.ancestor.strands.authority),
    },
  } as const;
  (candidate.strands as Record<StrandName, BraidStrand>)[strand] = resultStrand;

  const validated = validateBraid(candidate);
  if (!validated.ok) {
    return {
      ok: false,
      findings: sortFindings(validated.findings.map((item) => finding("repair_scope_violation", item.detail, item.refs))),
    };
  }

  return { ok: true, value: validated.value, findings: [] };
}
