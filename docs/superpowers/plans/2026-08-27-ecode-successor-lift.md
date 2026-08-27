# eCODE Successor Lift Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a deterministic local successor primitive proving that one attributable event creates one new causal cut even when the constituted body projection does not change.

**Architecture:** Keep `S` below the existing D/R/V/H and Heart boundaries. `src/successor.ts` owns only local cut succession, mandatory receipts, body-equivalence comparison, and anti-counterfeit validation; it does not authorize events or create a global clock. Tests prove admitted/refused/no-op succession, Z4 body-cycle/history-helix behavior, reset-without-return, sibling branches, and invalid-input refusal.

**Tech Stack:** TypeScript, Node 22, `node:test`, existing Iron Lung `Result`/`Finding` domain style.

**Spec:** `docs/superpowers/specs/2026-08-27-ecode-successor-lift-design.md`

## Global Constraints

- `S(x)=x+1` counts one local attributable event; it is not elapsed time or a universal clock.
- Successor does not synthesize or validate authority; existing present-selection/Heart boundaries remain authoritative.
- Every successful successor produces exactly one receipt and one next cut.
- The prior cut is never mutated.
- Body equality must remain separable from full-world identity/history.
- No persistence, networking, global ordering, or model dependency is introduced.
- Existing Iron Lung tests must remain green.

---

### Task 1: Write the executable successor contract as failing tests

**Files:**
- Create: `test/successor.test.ts`
- Test: `test/successor.test.ts`

**Interfaces:**
- Consumes: existing `Result<T>` conventions from `src/model.ts`.
- Produces: executable expectations for `createInitialCut`, `applySuccessor`, and `sameBody`.

- [ ] **Step 1: Create `test/successor.test.ts` importing the not-yet-existing module**

The test file must exercise:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { applySuccessor, createInitialCut, sameBody } from "../src/successor.js";
```

Use a helper that unwraps valid `Result` values. Add separate tests for:

1. admitted body mutation increments ordinal and appends one receipt;
2. refusal keeps body equal but creates a new cut/history entry;
3. no-op keeps body equal but creates a new cut/history entry;
4. four quarter-turns return orientation to zero while ordinal becomes four and receipt lineage has four entries;
5. reset restores an earlier body value but not cut identity/history;
6. two siblings from one parent may share ordinal/body while carrying distinct cut/receipt identities;
7. invalid ids and duplicate event/receipt ids are refused as `invalid_successor` findings.

- [ ] **Step 2: Push the failing test and verify RED in GitHub Actions**

Expected failure: TypeScript compilation cannot resolve `../src/successor.js` or the successor exports do not exist.

- [ ] **Step 3: Commit the RED witness**

```bash
git add test/successor.test.ts
git commit -m "test: specify successor lift behavior"
```

---

### Task 2: Add domain finding codes required by successor validation

**Files:**
- Modify: `src/model.ts`
- Test: `test/successor.test.ts`

**Interfaces:**
- Consumes: existing `FindingCode` union and `Result<T>`.
- Produces: `invalid_successor` and `duplicate_successor_event` finding codes.

- [ ] **Step 1: Extend `FindingCode` minimally**

Add:

```ts
| "invalid_successor"
| "duplicate_successor_event"
```

Do not add generic clock, time, or authority codes.

- [ ] **Step 2: Run the successor test**

Expected: still RED because `src/successor.ts` remains absent.

- [ ] **Step 3: Commit the domain-code change with the implementation task if desired**

Do not treat this as independently complete until Task 3 passes.

---

### Task 3: Implement the minimal successor primitive

**Files:**
- Create: `src/successor.ts`
- Modify: `src/model.ts`
- Test: `test/successor.test.ts`

**Interfaces:**
- Produces:

```ts
export type SuccessorDisposition = "admitted" | "refused" | "failed" | "no-op";

export interface SuccessorReceiptV01 {
  schema: "iron-lung/successor-receipt/v0.1";
  receiptId: string;
  eventId: string;
  eventKind: string;
  disposition: SuccessorDisposition;
  priorCutId: string;
  nextCutId: string;
  ordinalBefore: number;
  ordinalAfter: number;
  bodyChanged: boolean;
  refs: string[];
}

export interface SuccessorCutV01<T> {
  schema: "iron-lung/successor-cut/v0.1";
  cutId: string;
  parentCutId?: string;
  ordinal: number;
  body: T;
  receiptIds: string[];
  eventIds: string[];
}

export function createInitialCut<T>(cutId: string, body: T): Result<SuccessorCutV01<T>>;

export function applySuccessor<T>(input: {
  prior: SuccessorCutV01<T>;
  nextCutId: string;
  receiptId: string;
  eventId: string;
  eventKind: string;
  disposition: SuccessorDisposition;
  nextBody: T;
  refs?: string[];
}): Result<{ cut: SuccessorCutV01<T>; receipt: SuccessorReceiptV01 }>;

export function sameBody<T>(a: SuccessorCutV01<T>, b: SuccessorCutV01<T>): boolean;
```

- [ ] **Step 1: Implement validation helpers**

Require non-empty ids/kinds, integer non-negative prior ordinal, exact schema, valid disposition, fresh `nextCutId`, and no reuse of any prior `eventId` or `receiptId`.

Return `Result` findings rather than throwing for domain-invalid input.

- [ ] **Step 2: Implement `createInitialCut`**

Return a fresh clone:

```ts
{
  schema: "iron-lung/successor-cut/v0.1",
  cutId,
  ordinal: 0,
  body: structuredClone(body),
  receiptIds: [],
  eventIds: []
}
```

- [ ] **Step 3: Implement `applySuccessor`**

On success:

- `ordinalAfter = prior.ordinal + 1` exactly;
- `parentCutId = prior.cutId`;
- body is `structuredClone(nextBody)`;
- `receiptIds` and `eventIds` append exactly one id each;
- prior input remains unchanged;
- `bodyChanged` uses `isDeepStrictEqual` from `node:util` against prior body and next body;
- refs are deduplicated/sorted using existing `sortUniqueStrings`.

- [ ] **Step 4: Implement `sameBody`**

Return `isDeepStrictEqual(a.body, b.body)` only. It must not inspect cut ids, ordinals, or history.

- [ ] **Step 5: Run `npm run check`**

Expected: all prior tests plus the successor test pass.

- [ ] **Step 6: Commit GREEN**

```bash
git add src/model.ts src/successor.ts test/successor.test.ts
git commit -m "feat: add local successor lift"
```

---

### Task 4: Document the relation to Iron Lung without promoting global law

**Files:**
- Modify: `README.md`

**Interfaces:**
- Consumes: verified successor API from Task 3.
- Produces: discoverable local documentation and cross-project graduation boundary.

- [ ] **Step 1: Add a `Successor Lift` subsection**

State:

```text
S(x)=x+1
```

means one additional attributable local event/cut, not one unit of physical time.

Include:

```text
same body != same historical world
reset != return
successor != authority
```

and point to the design spec.

- [ ] **Step 2: Run `npm run check` again**

Expected: green.

- [ ] **Step 3: Commit documentation**

```bash
git add README.md
git commit -m "docs: expose successor lift boundary"
```

---

### Task 5: Verify exact branch head before PR completion

**Files:** none

**Interfaces:**
- Consumes: Tasks 1-4.
- Produces: exact-head verification receipt.

- [ ] **Step 1: Confirm GitHub Actions on the final branch head**

Expected: `npm run check` passes with zero failures.

- [ ] **Step 2: Confirm the PR diff contains only successor-lift code, tests, and docs**

No global clock, networking, persistence, model dependency, or authority synthesis may appear.

- [ ] **Step 3: Record the exact verified head SHA in the PR description or comment**

The receipt must distinguish the RED test head from the final GREEN head.
