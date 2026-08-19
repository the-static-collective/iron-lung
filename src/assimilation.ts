import {
  STRAND_CONDITIONS,
  STRAND_NAMES,
  sortFindings,
  sortUniqueStrings,
  type BraidV01,
  type Finding,
  type StrandCondition,
} from "./model.js";

export interface AssimilationPolicyV01 {
  schema: "iron-lung/assimilation-policy/v0.1";
  policyId: string;
  acceptableConditions: {
    substance: StrandCondition[];
    lineage: StrandCondition[];
    authority: StrandCondition[];
  };
  requiredWitnessRefs: string[];
}

export interface AssimilationEvaluation {
  schema: "iron-lung/assimilation-evaluation/v0.1";
  braidId: string;
  state: "assimilable" | "blocked";
  eligible: boolean;
  findings: Finding[];
}

function validConditions(value: unknown): value is StrandCondition[] {
  return Array.isArray(value) && value.length > 0 && value.every((item) => STRAND_CONDITIONS.includes(item as StrandCondition));
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function evaluateAssimilation(input: {
  braid: BraidV01;
  policy: AssimilationPolicyV01;
  suppliedWitnessRefs: string[];
}): AssimilationEvaluation {
  const findings: Finding[] = [];
  const policy = input.policy;

  if (policy.schema !== "iron-lung/assimilation-policy/v0.1" || !nonEmptyString(policy.policyId)) {
    findings.push({ code: "assimilation_blocked", detail: "assimilation policy is invalid", refs: [] });
  }

  const acceptable = policy.acceptableConditions;
  for (const strand of STRAND_NAMES) {
    const allowed = acceptable?.[strand];
    if (!validConditions(allowed)) {
      findings.push({ code: "assimilation_blocked", detail: `assimilation policy has invalid ${strand} conditions`, refs: [strand] });
      continue;
    }
    if (!allowed.includes(input.braid.strands[strand].condition)) {
      findings.push({
        code: "assimilation_blocked",
        detail: `${strand} condition is not eligible for assimilation`,
        refs: [strand, input.braid.strands[strand].condition],
      });
    }
  }

  if (input.braid.strands.authority.condition !== "intact") {
    findings.push({
      code: "assimilation_blocked",
      detail: "authority must be intact for assimilation regardless of policy looseness",
      refs: [input.braid.strands.authority.condition],
    });
  }

  const requiredWitnesses = Array.isArray(policy.requiredWitnessRefs) && policy.requiredWitnessRefs.every(nonEmptyString)
    ? sortUniqueStrings(policy.requiredWitnessRefs)
    : [];
  if (!Array.isArray(policy.requiredWitnessRefs) || policy.requiredWitnessRefs.some((ref) => !nonEmptyString(ref))) {
    findings.push({ code: "assimilation_blocked", detail: "assimilation policy witness refs are invalid", refs: [] });
  }
  const supplied = new Set(sortUniqueStrings(input.suppliedWitnessRefs.filter(nonEmptyString)));
  const missing = requiredWitnesses.filter((ref) => !supplied.has(ref));
  if (missing.length > 0) {
    findings.push({ code: "missing_witness", detail: "assimilation is missing required witnesses", refs: missing });
  }

  const normalized = sortFindings(findings);
  return {
    schema: "iron-lung/assimilation-evaluation/v0.1",
    braidId: input.braid.id,
    state: normalized.length === 0 ? "assimilable" : "blocked",
    eligible: normalized.length === 0,
    findings: normalized,
  };
}
