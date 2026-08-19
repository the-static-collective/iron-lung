import {
  STRAND_CONDITIONS,
  STRAND_NAMES,
  sortFindings,
  sortUniqueStrings,
  type BraidV01,
  type Finding,
  type Result,
  type StrandCondition,
  type StrandName,
} from "./model.js";

export interface StrandConstraint {
  strand: StrandName;
  conditions: StrandCondition[];
}

export interface CapabilityRegistrationV01 {
  schema: "iron-lung/capability/v0.1";
  capabilityId: string;
  organId: string;
  accepts: StrandConstraint[];
  requires: StrandConstraint[];
  mayProduce: StrandConstraint[];
  authorityRef: string;
  witnessRefs: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeConditions(value: unknown): StrandCondition[] | undefined {
  if (!Array.isArray(value) || value.length === 0) return undefined;
  if (!value.every((item) => STRAND_CONDITIONS.includes(item as StrandCondition))) return undefined;
  const set = new Set(value as StrandCondition[]);
  return STRAND_CONDITIONS.filter((condition) => set.has(condition));
}

function normalizeConstraints(
  label: string,
  value: unknown,
  findings: Finding[],
  requireNonEmpty: boolean,
): StrandConstraint[] | undefined {
  if (!Array.isArray(value) || (requireNonEmpty && value.length === 0)) {
    findings.push({ code: "invalid_capability", detail: `${label} must be ${requireNonEmpty ? "a non-empty" : "an"} array`, refs: [label] });
    return undefined;
  }

  const seen = new Set<StrandName>();
  const normalized: StrandConstraint[] = [];
  for (const entry of value) {
    if (!isRecord(entry) || Object.keys(entry).sort().join(",") !== "conditions,strand") {
      findings.push({ code: "invalid_capability", detail: `${label} constraint has invalid fields`, refs: [label] });
      continue;
    }
    if (!(STRAND_NAMES as readonly unknown[]).includes(entry.strand)) {
      findings.push({ code: "invalid_capability", detail: `${label} constraint has invalid strand`, refs: [label] });
      continue;
    }
    const strand = entry.strand as StrandName;
    if (seen.has(strand)) {
      findings.push({ code: "invalid_capability", detail: `${label} repeats strand ${strand}`, refs: [label, strand] });
      continue;
    }
    const conditions = normalizeConditions(entry.conditions);
    if (!conditions) {
      findings.push({ code: "invalid_capability", detail: `${label} ${strand} has invalid conditions`, refs: [label, strand] });
      continue;
    }
    seen.add(strand);
    normalized.push({ strand, conditions });
  }

  return normalized.sort((a, b) => STRAND_NAMES.indexOf(a.strand) - STRAND_NAMES.indexOf(b.strand));
}

export function validateCapabilityRegistration(input: unknown): Result<CapabilityRegistrationV01> {
  const findings: Finding[] = [];
  if (!isRecord(input)) {
    return { ok: false, findings: [{ code: "invalid_capability", detail: "capability must be an object", refs: [] }] };
  }

  const exactKeys = ["accepts", "authorityRef", "capabilityId", "mayProduce", "organId", "requires", "schema", "witnessRefs"];
  if (Object.keys(input).sort().join(",") !== exactKeys.join(",")) {
    findings.push({ code: "invalid_capability", detail: "capability has invalid top-level fields", refs: [] });
  }
  if (input.schema !== "iron-lung/capability/v0.1") {
    findings.push({ code: "invalid_capability", detail: "unsupported capability schema", refs: [] });
  }
  for (const field of ["capabilityId", "organId", "authorityRef"] as const) {
    if (!nonEmptyString(input[field])) {
      findings.push({ code: "invalid_capability", detail: `${field} must be non-empty`, refs: [field] });
    }
  }
  if (!Array.isArray(input.witnessRefs) || input.witnessRefs.length === 0 || !input.witnessRefs.every(nonEmptyString)) {
    findings.push({ code: "invalid_capability", detail: "witnessRefs must contain at least one non-empty ref", refs: ["witnessRefs"] });
  }

  const accepts = normalizeConstraints("accepts", input.accepts, findings, true);
  const requires = normalizeConstraints("requires", input.requires, findings, false);
  const mayProduce = normalizeConstraints("mayProduce", input.mayProduce, findings, true);

  if (accepts && mayProduce) {
    const accepted = new Set(accepts.map((constraint) => constraint.strand));
    for (const constraint of mayProduce) {
      if (!accepted.has(constraint.strand)) {
        findings.push({
          code: "invalid_capability",
          detail: `mayProduce strand ${constraint.strand} is outside accepts`,
          refs: [constraint.strand],
        });
      }
    }
  }

  if (findings.length > 0 || !accepts || !requires || !mayProduce ||
      !nonEmptyString(input.capabilityId) || !nonEmptyString(input.organId) || !nonEmptyString(input.authorityRef) ||
      !Array.isArray(input.witnessRefs)) {
    return { ok: false, findings: sortFindings(findings) };
  }

  return {
    ok: true,
    value: {
      schema: "iron-lung/capability/v0.1",
      capabilityId: input.capabilityId,
      organId: input.organId,
      accepts,
      requires,
      mayProduce,
      authorityRef: input.authorityRef,
      witnessRefs: sortUniqueStrings(input.witnessRefs as string[]),
    },
    findings: [],
  };
}

function constraintMatches(constraint: StrandConstraint, braid: BraidV01): boolean {
  return constraint.conditions.includes(braid.strands[constraint.strand].condition);
}

export function capabilityMatchesBraid(capability: CapabilityRegistrationV01, braid: BraidV01): boolean {
  return [...capability.accepts, ...capability.requires].every((constraint) => constraintMatches(constraint, braid));
}
