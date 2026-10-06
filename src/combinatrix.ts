import { validateBraid } from "./braid.js";
import { validatePresentSelection, type PresentRouteSelectionV01 } from "./spine-boundary.js";
import type { BraidStrand, BraidV01, StrandName } from "./model.js";

export type CombinatrixStrand = Exclude<StrandName, "authority">;

export interface AddressableGapV01 {
  gapId: string;
  strand: CombinatrixStrand;
}

export interface ProposalFragmentV01 {
  fragmentId: string;
  gapId: string;
  strand: CombinatrixStrand;
  result: BraidStrand;
  provenanceRefs: string[];
}

export interface CandidatePolicyV01 {
  candidateId: string;
  fragmentIds: string[];
  rank: number;
  warrantRefs: string[];
  refusedBy?: string;
  unresolvedBy?: string[];
}

export type CandidateDisposition = "open" | "requires_warrant" | "refused" | "unresolved";

export interface CandidateWorldV01 {
  candidateId: string;
  fragmentIds: string[];
  rank: number;
  disposition: CandidateDisposition;
  warrantRefs: string[];
  refusedBy?: string;
  unresolvedBy: string[];
}

export interface CombinatrixFieldV01 {
  schema: "iron-lung/combinatrix-field/v0.1";
  braidId: string;
  gapIds: string[];
  candidates: CandidateWorldV01[];
  authority: "none";
  selection: "NONE";
}

export interface CombinatrixConsequenceReceiptV01 {
  schema: "iron-lung/combinatrix-consequence-receipt/v0.1";
  ancestorBraidId: string;
  selectedCandidateId: string;
  selectedCandidateRank: number;
  selectionAuthorityRef: string;
  warrantRefs: string[];
  witnessRefs: string[];
  descendantBraidId: string;
  descendantParentId: string;
  residue: Array<{
    candidateId: string;
    rank: number;
    disposition: CandidateDisposition;
    reasonRefs: string[];
  }>;
  nonClaims: string[];
}

export interface CombinatrixExecutionV01 {
  field: CombinatrixFieldV01;
  descendant: BraidV01;
  receipt: CombinatrixConsequenceReceiptV01;
  recirculatedField: CombinatrixFieldV01;
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function uniqueStrings(values: readonly string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function claimRefs(strand: BraidStrand): string[] {
  return strand.claim.kind === "refs" ? strand.claim.refs : [];
}

function arraysEqual(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function product<T>(groups: T[][]): T[][] {
  if (groups.length === 0) return [];
  return groups.reduce<T[][]>(
    (rows, group) => rows.flatMap((row) => group.map((item) => [...row, item])),
    [[]]
  );
}

function validateFragmentResult(ancestor: BraidV01, fragment: ProposalFragmentV01): void {
  const probe: BraidV01 = {
    schema: "iron-lung/braid/v0.1",
    id: `braid:combinatrix-probe:${fragment.fragmentId}`,
    strands: {
      substance: structuredClone(ancestor.strands.substance),
      lineage: structuredClone(ancestor.strands.lineage),
      authority: structuredClone(ancestor.strands.authority),
    },
  };
  probe.strands[fragment.strand] = structuredClone(fragment.result);
  const validated = validateBraid(probe);
  if (!validated.ok) {
    throw new Error(`invalid fragment ${fragment.fragmentId}: ${JSON.stringify(validated.findings)}`);
  }

  const priorRefs = claimRefs(ancestor.strands[fragment.strand]);
  const nextRefs = new Set(claimRefs(fragment.result));
  const erased = priorRefs.filter((ref) => !nextRefs.has(ref));
  if (erased.length > 0) {
    throw new Error(`fragment ${fragment.fragmentId} erases prior refs: ${erased.join(",")}`);
  }
}

export function discoverAddressableGaps(braid: BraidV01): AddressableGapV01[] {
  const gaps: AddressableGapV01[] = [];
  for (const strand of ["substance", "lineage"] as const) {
    const state = braid.strands[strand];
    if (state.condition === "intact") continue;
    for (const ref of claimRefs(state)) {
      if (ref.startsWith(`gap:${strand}:`)) gaps.push({ gapId: ref, strand });
    }
  }
  return gaps.sort((a, b) => a.gapId.localeCompare(b.gapId));
}

export function buildCombinatrixField(input: {
  braid: BraidV01;
  gaps: AddressableGapV01[];
  fragments: ProposalFragmentV01[];
  policies: CandidatePolicyV01[];
}): CombinatrixFieldV01 {
  const braidResult = validateBraid(input.braid);
  if (!braidResult.ok) throw new Error(`invalid braid: ${JSON.stringify(braidResult.findings)}`);
  const braid = braidResult.value;

  const discovered = discoverAddressableGaps(braid);
  const declared = [...input.gaps].sort((a, b) => a.gapId.localeCompare(b.gapId));
  if (JSON.stringify(discovered) !== JSON.stringify(declared)) {
    throw new Error("declared gaps must exactly match addressable gaps in current braid");
  }
  if (declared.length === 0) {
    return {
      schema: "iron-lung/combinatrix-field/v0.1",
      braidId: braid.id,
      gapIds: [],
      candidates: [],
      authority: "none",
      selection: "NONE",
    };
  }

  const gapById = new Map(declared.map((gap) => [gap.gapId, gap]));
  const fragmentById = new Map<string, ProposalFragmentV01>();
  for (const fragment of input.fragments) {
    if (!nonEmptyString(fragment.fragmentId) || fragmentById.has(fragment.fragmentId)) {
      throw new Error("fragment ids must be unique non-empty strings");
    }
    const gap = gapById.get(fragment.gapId);
    if (!gap || gap.strand !== fragment.strand) {
      throw new Error(`fragment ${fragment.fragmentId} targets undeclared or mismatched gap`);
    }
    if (!Array.isArray(fragment.provenanceRefs) || fragment.provenanceRefs.length === 0 || !fragment.provenanceRefs.every(nonEmptyString)) {
      throw new Error(`fragment ${fragment.fragmentId} requires provenance refs`);
    }
    validateFragmentResult(braid, fragment);
    fragmentById.set(fragment.fragmentId, fragment);
  }

  const fragmentGroups = declared.map((gap) =>
    [...fragmentById.values()]
      .filter((fragment) => fragment.gapId === gap.gapId)
      .map((fragment) => fragment.fragmentId)
      .sort((a, b) => a.localeCompare(b))
  );
  if (fragmentGroups.some((group) => group.length === 0)) {
    throw new Error("every addressable gap requires at least one proposal fragment");
  }

  const expectedCombinations = product(fragmentGroups)
    .map((ids) => uniqueStrings(ids))
    .sort((a, b) => a.join("\u0000").localeCompare(b.join("\u0000")));

  if (input.policies.length !== expectedCombinations.length) {
    throw new Error("candidate policies must cover the complete bounded combinatrix exactly once");
  }

  const candidateIds = new Set<string>();
  const ranks = new Set<number>();
  const seenCombinations: string[][] = [];
  const candidates: CandidateWorldV01[] = input.policies.map((policy) => {
    if (!nonEmptyString(policy.candidateId) || candidateIds.has(policy.candidateId)) {
      throw new Error("candidate ids must be unique non-empty strings");
    }
    candidateIds.add(policy.candidateId);
    if (!Number.isInteger(policy.rank) || policy.rank <= 0 || ranks.has(policy.rank)) {
      throw new Error("candidate ranks must be unique positive integers");
    }
    ranks.add(policy.rank);

    const ids = uniqueStrings(policy.fragmentIds);
    if (ids.length !== declared.length || ids.some((id) => !fragmentById.has(id))) {
      throw new Error(`candidate ${policy.candidateId} must contain exactly one known fragment per gap`);
    }
    const gapIds = ids.map((id) => fragmentById.get(id)!.gapId);
    if (new Set(gapIds).size !== declared.length) {
      throw new Error(`candidate ${policy.candidateId} repeats or omits a gap`);
    }
    seenCombinations.push(ids);

    const warrantRefs = uniqueStrings(policy.warrantRefs || []);
    const unresolvedBy = uniqueStrings(policy.unresolvedBy || []);
    const refusedBy = nonEmptyString(policy.refusedBy) ? policy.refusedBy : undefined;
    const disposition: CandidateDisposition = refusedBy
      ? "refused"
      : unresolvedBy.length > 0
        ? "unresolved"
        : warrantRefs.length > 0
          ? "requires_warrant"
          : "open";

    return {
      candidateId: policy.candidateId,
      fragmentIds: ids,
      rank: policy.rank,
      disposition,
      warrantRefs,
      ...(refusedBy ? { refusedBy } : {}),
      unresolvedBy,
    };
  });

  const canonicalSeen = seenCombinations.sort((a, b) => a.join("\u0000").localeCompare(b.join("\u0000")));
  if (canonicalSeen.some((combo, index) => !arraysEqual(combo, expectedCombinations[index]!))) {
    throw new Error("candidate policies do not exactly cover the bounded Cartesian product");
  }

  candidates.sort((a, b) => a.rank - b.rank || a.candidateId.localeCompare(b.candidateId));

  return {
    schema: "iron-lung/combinatrix-field/v0.1",
    braidId: braid.id,
    gapIds: declared.map((gap) => gap.gapId),
    candidates,
    authority: "none",
    selection: "NONE",
  };
}

export function executeCombinatrix(input: {
  braid: BraidV01;
  gaps: AddressableGapV01[];
  fragments: ProposalFragmentV01[];
  policies: CandidatePolicyV01[];
  selection: PresentRouteSelectionV01;
  warrantRefs: string[];
  descendantId: string;
}): CombinatrixExecutionV01 {
  const field = buildCombinatrixField(input);
  if (field.candidates.length === 0) throw new Error("no candidate field exists; no Heart beat is available");

  const selectionResult = validatePresentSelection({
    braidId: field.braidId,
    offeredRouteIds: field.candidates.map((candidate) => candidate.candidateId),
    selection: input.selection,
  });
  if (!selectionResult.ok) {
    throw new Error(`invalid present selection: ${JSON.stringify(selectionResult.findings)}`);
  }
  const selection = selectionResult.value;
  const candidate = field.candidates.find((item) => item.candidateId === selection.selectedRouteId);
  if (!candidate) throw new Error("selected candidate is not in the field");

  if (candidate.disposition === "refused") {
    throw new Error(`candidate refused by ${candidate.refusedBy}`);
  }
  if (candidate.disposition === "unresolved") {
    throw new Error(`candidate unresolved pending ${candidate.unresolvedBy.join(",")}`);
  }

  const suppliedWarrants = uniqueStrings(input.warrantRefs);
  const missingWarrants = candidate.warrantRefs.filter((ref) => !suppliedWarrants.includes(ref));
  if (missingWarrants.length > 0) {
    throw new Error(`candidate missing warrant refs: ${missingWarrants.join(",")}`);
  }

  if (!nonEmptyString(input.descendantId) || input.descendantId === input.braid.id) {
    throw new Error("descendantId must be a fresh non-empty id");
  }

  const fragmentById = new Map(input.fragments.map((fragment) => [fragment.fragmentId, fragment]));
  const descendant: BraidV01 = {
    schema: "iron-lung/braid/v0.1",
    id: input.descendantId,
    parentId: input.braid.id,
    strands: {
      substance: structuredClone(input.braid.strands.substance),
      lineage: structuredClone(input.braid.strands.lineage),
      authority: structuredClone(input.braid.strands.authority),
    },
  };

  for (const fragmentId of candidate.fragmentIds) {
    const fragment = fragmentById.get(fragmentId);
    if (!fragment) throw new Error(`missing selected fragment ${fragmentId}`);
    descendant.strands[fragment.strand] = structuredClone(fragment.result);
  }

  const descendantResult = validateBraid(descendant);
  if (!descendantResult.ok) {
    throw new Error(`invalid descendant: ${JSON.stringify(descendantResult.findings)}`);
  }

  if (JSON.stringify(descendantResult.value.strands.authority) !== JSON.stringify(input.braid.strands.authority)) {
    throw new Error("combinatrix consequence may not generate or mutate authority");
  }

  const recirculatedGaps = discoverAddressableGaps(descendantResult.value);
  const recirculatedField = buildCombinatrixField({
    braid: descendantResult.value,
    gaps: recirculatedGaps,
    fragments: recirculatedGaps.length === 0 ? [] : input.fragments,
    policies: recirculatedGaps.length === 0 ? [] : input.policies,
  });

  const residue = field.candidates
    .filter((item) => item.candidateId !== candidate.candidateId)
    .map((item) => ({
      candidateId: item.candidateId,
      rank: item.rank,
      disposition: item.disposition,
      reasonRefs: item.disposition === "refused"
        ? [item.refusedBy!]
        : item.disposition === "unresolved"
          ? item.unresolvedBy
          : item.warrantRefs,
    }));

  return {
    field,
    descendant: descendantResult.value,
    receipt: {
      schema: "iron-lung/combinatrix-consequence-receipt/v0.1",
      ancestorBraidId: input.braid.id,
      selectedCandidateId: candidate.candidateId,
      selectedCandidateRank: candidate.rank,
      selectionAuthorityRef: selection.authorityRef,
      warrantRefs: suppliedWarrants,
      witnessRefs: selection.witnessRefs,
      descendantBraidId: descendantResult.value.id,
      descendantParentId: descendantResult.value.parentId!,
      residue,
      nonClaims: [
        "candidate rank did not select the consequence",
        "proposal generation did not mint authority",
        "refused and unresolved candidates were not erased",
        "the consequence receipt does not itself grant authority",
      ],
    },
    recirculatedField,
  };
}
