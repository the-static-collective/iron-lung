export const STRAND_NAMES = ["substance", "lineage", "authority"] as const;
export type StrandName = (typeof STRAND_NAMES)[number];

export const STRAND_CONDITIONS = ["intact", "strained", "unknown", "refused", "broken"] as const;
export type StrandCondition = (typeof STRAND_CONDITIONS)[number];

export type StrandClaim =
  | { kind: "refs"; refs: string[] }
  | { kind: "none" };

export interface BraidStrand {
  condition: StrandCondition;
  claim: StrandClaim;
}

export interface BraidV01 {
  schema: "iron-lung/braid/v0.1";
  id: string;
  parentId?: string;
  strands: {
    substance: BraidStrand;
    lineage: BraidStrand;
    authority: BraidStrand;
  };
}

export type FindingCode =
  | "invalid_braid"
  | "missing_strand"
  | "invalid_strand_state"
  | "invalid_capability"
  | "unadmitted_capability"
  | "no_repair_route"
  | "multiple_routes_require_selection"
  | "proposal_only"
  | "invalid_spine_proposal"
  | "unknown_route_selection"
  | "repair_scope_violation"
  | "authority_escalation"
  | "lineage_erasure"
  | "ancestor_mutation"
  | "assimilation_blocked"
  | "missing_witness"
  | "invalid_pneuma_annotation";

export interface Finding {
  code: FindingCode;
  detail: string;
  refs: string[];
}

export type Result<T> =
  | { ok: true; value: T; findings: Finding[] }
  | { ok: false; findings: Finding[] };

export function sortUniqueStrings(values: readonly string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

export function sortFindings(findings: readonly Finding[]): Finding[] {
  return [...findings]
    .map((finding) => ({
      ...finding,
      refs: sortUniqueStrings(finding.refs),
    }))
    .sort((a, b) =>
      a.code.localeCompare(b.code) ||
      a.detail.localeCompare(b.detail) ||
      a.refs.join("\u0000").localeCompare(b.refs.join("\u0000"))
    );
}
