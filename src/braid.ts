import {
  STRAND_CONDITIONS,
  STRAND_NAMES,
  sortFindings,
  sortUniqueStrings,
  type BraidStrand,
  type BraidV01,
  type Finding,
  type Result,
  type StrandCondition,
  type StrandName,
} from "./model.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeClaim(value: unknown): { ok: true; value: BraidStrand["claim"] } | { ok: false } {
  if (!isRecord(value)) return { ok: false };
  const keys = Object.keys(value).sort();

  if (value.kind === "none") {
    if (keys.length !== 1 || keys[0] !== "kind") return { ok: false };
    return { ok: true, value: { kind: "none" } };
  }

  if (value.kind === "refs") {
    if (keys.length !== 2 || keys[0] !== "kind" || keys[1] !== "refs") return { ok: false };
    if (!Array.isArray(value.refs) || value.refs.length === 0 || !value.refs.every(nonEmptyString)) {
      return { ok: false };
    }
    return { ok: true, value: { kind: "refs", refs: sortUniqueStrings(value.refs) } };
  }

  return { ok: false };
}

function normalizeStrand(name: StrandName, value: unknown, findings: Finding[]): BraidStrand | undefined {
  if (!isRecord(value)) {
    findings.push({ code: "invalid_braid", detail: `strand ${name} must be an object`, refs: [name] });
    return undefined;
  }
  const keys = Object.keys(value).sort();
  if (keys.length !== 2 || keys[0] !== "claim" || keys[1] !== "condition") {
    findings.push({ code: "invalid_braid", detail: `strand ${name} has invalid fields`, refs: [name] });
    return undefined;
  }
  if (!STRAND_CONDITIONS.includes(value.condition as StrandCondition)) {
    findings.push({ code: "invalid_strand_state", detail: `strand ${name} has invalid condition`, refs: [name] });
    return undefined;
  }
  const claim = normalizeClaim(value.claim);
  if (!claim.ok) {
    findings.push({ code: "invalid_braid", detail: `strand ${name} has invalid claim`, refs: [name] });
    return undefined;
  }
  return { condition: value.condition as StrandCondition, claim: claim.value };
}

export function validateBraid(input: unknown): Result<BraidV01> {
  const findings: Finding[] = [];
  if (!isRecord(input)) {
    return { ok: false, findings: [{ code: "invalid_braid", detail: "braid must be an object", refs: [] }] };
  }

  const allowedTopKeys = new Set(["schema", "id", "parentId", "strands"]);
  for (const key of Object.keys(input)) {
    if (!allowedTopKeys.has(key)) {
      findings.push({ code: "invalid_braid", detail: `unexpected top-level field ${key}`, refs: [key] });
    }
  }

  if (input.schema !== "iron-lung/braid/v0.1") {
    findings.push({ code: "invalid_braid", detail: "unsupported braid schema", refs: [] });
  }
  if (!nonEmptyString(input.id)) {
    findings.push({ code: "invalid_braid", detail: "braid id must be non-empty", refs: [] });
  }
  if (input.parentId !== undefined && !nonEmptyString(input.parentId)) {
    findings.push({ code: "invalid_braid", detail: "parentId must be non-empty when present", refs: [] });
  }
  if (nonEmptyString(input.id) && input.parentId === input.id) {
    findings.push({ code: "invalid_braid", detail: "parentId must differ from id", refs: [input.id] });
  }

  if (!isRecord(input.strands)) {
    findings.push({ code: "invalid_braid", detail: "strands must be an object", refs: [] });
    return { ok: false, findings: sortFindings(findings) };
  }

  for (const name of STRAND_NAMES) {
    if (!(name in input.strands)) {
      findings.push({ code: "missing_strand", detail: `missing strand ${name}`, refs: [name] });
    }
  }
  for (const key of Object.keys(input.strands)) {
    if (!(STRAND_NAMES as readonly string[]).includes(key)) {
      findings.push({ code: "invalid_braid", detail: `unexpected strand ${key}`, refs: [key] });
    }
  }

  const normalized = {} as BraidV01["strands"];
  for (const name of STRAND_NAMES) {
    if (!(name in input.strands)) continue;
    const strand = normalizeStrand(name, input.strands[name], findings);
    if (strand) normalized[name] = strand;
  }

  if (findings.length > 0 || !nonEmptyString(input.id) || input.schema !== "iron-lung/braid/v0.1") {
    return { ok: false, findings: sortFindings(findings) };
  }

  const braid: BraidV01 = {
    schema: "iron-lung/braid/v0.1",
    id: input.id,
    strands: {
      substance: normalized.substance,
      lineage: normalized.lineage,
      authority: normalized.authority,
    },
    ...(input.parentId !== undefined ? { parentId: input.parentId as string } : {}),
  };

  return { ok: true, value: braid, findings: [] };
}
