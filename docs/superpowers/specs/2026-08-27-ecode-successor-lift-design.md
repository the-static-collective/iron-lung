# eCODE Successor Lift — `S(x)=x+1` Design

**Status:** approved architectural experiment; implementation authorized by conversation on 2026-08-27

**Project authority:** `the-static-collective/iron-lung`

## 1. Purpose

Adopt the successor law

```text
S(x) = x + 1
```

not as a replacement for ordinary arithmetic and not as a fifth generative eCODE verb, but as the smallest constitutional statement that **an attributable event creates a new causal cut**.

The core claim is:

> **If something actually happens, there is now an after.**

The `+1` counts one more locally attributable event. It does not mean one second, one unit of substance, one unit of truth, or one unit of authority.

## 2. Existing ancestry that must survive

Iron Lung already separates:

- Substance / Lineage / Authority;
- proposal-space from constituted history;
- present selection from ranking;
- immutable ancestor from descendant;
- transport from admission from assimilation;
- interpretation from evidence and authority.

The current eCODE kernel candidate remains:

```text
(D, R, V, H; composition, mandatory trace)
```

where:

- `D` — DISTINGUISH;
- `R` — RELATE;
- `V` — VARY;
- `H` — CONSTITUTE / locally disposition a proposal;
- ordered composition preserves operator order;
- every operation leaves an attributable trace.

Successor must compress this architecture, not erase those distinctions.

## 3. Successor is not a fifth domain operation

Rejected shape:

```text
D / R / V / H / S
```

if `S` is treated as another content-transforming verb.

Preferred shape:

```text
EVENT e
  ├─ kind: D | R | V | H | local project event
  ├─ disposition / consequence
  └─ receipt
          ↓
SUCCESSOR
          ↓
new attributable cut
```

`D/R/V/H` answer **what happened**.

`S` answers **that another attributable cut now exists**.

## 4. Local world model

For the first specimen, let a world cut be:

```text
W[n] = (body[n], history[n], ordinal=n)
```

where:

- `body[n]` is the present constituted projection under this local specimen;
- `history[n]` is the ordered attributable receipt sequence;
- `ordinal` is the local successor depth.

For a typed event `e`:

```text
S_e(W[n]) = W[n+1]
```

with:

```text
ordinal[n+1] = ordinal[n] + 1
history[n+1] = history[n] + receipt(e)
```

The body may or may not change.

## 5. The decisive table

```text
ADMITTED
body[n+1] may differ from body[n]
history[n+1] differs from history[n]

REFUSED
body[n+1] = body[n]
history[n+1] differs from history[n]

FAILED
body[n+1] may equal body[n]
history[n+1] differs from history[n]

NO-OP
body[n+1] = body[n]
history[n+1] differs from history[n]
```

This preserves the existing eCODE law:

> **A world may be historically changed without the requested mutation becoming part of its body.**

## 6. Body equality is not world identity

Define a body projection `pi_body`.

A refusal or no-op may satisfy:

```text
pi_body(W[n+1]) = pi_body(W[n])
```

while:

```text
W[n+1] != W[n]
```

Therefore the earlier compression can be typed as:

```text
x + 1 != x          full attributable world
[x + 1] = [x]       selected body-equivalence projection
```

The system must never infer "no event occurred" merely from an unchanged body.

## 7. Cycles lift to helices

A body-level cycle may return to the same value while the full world continues forward.

For a quarter-turn body projection:

```text
0 -> 1 -> 2 -> 3 -> 0
```

four admitted successor events yield:

```text
(body=0, ordinal=0, history=[])
...
(body=0, ordinal=4, history=[r1,r2,r3,r4])
```

The body returned.

The world did not.

Working compression:

> **A cycle in state-space becomes a helix in lineage-space.**

The first specimen should prove this without claiming a universal topological model.

## 8. Reset law

A reset may restore an earlier body projection.

It may not restore an earlier historical world.

```text
body[k] == body[n]
```

must not imply:

```text
W[k] == W[n]
```

if a reset event occurred between them.

This is the executable form of:

> **No silent reset.**

## 9. Branch law

Successor depth is not a global identity.

Two children may both be one successor beyond the same parent:

```text
          W[n]
         /    \
     W[a]    W[b]
 ordinal n+1 ordinal n+1
```

They remain distinct because their event/receipt ancestry differs.

Therefore:

```text
same ordinal != same world
same body != same world
same parent != same child
```

## 10. No global clock claim

The first implementation is strictly **local**.

Do not create an ecosystem-wide universal integer sequence.

Independent local events may remain unordered until a real crossing establishes a causal relation.

A later cross-world composition may model a partial order or DAG. That is outside the first implementation.

## 11. Receipt is constitutive of successor

The first specimen should make an unreceipted successor unrepresentable through the public constructor.

Every successful successor transition must return:

```text
prior cut
+ typed event
+ next cut
+ receipt
```

The receipt records at minimum:

- event id;
- event kind;
- disposition;
- prior cut id;
- next cut id;
- ordinal before;
- ordinal after;
- whether the body projection changed;
- supplied refs.

This does **not** mean receipt possession grants warrant or authority.

## 12. Authority boundary

Successor records an occurrence. It does not authorize the occurrence.

The existing Heart/present-selection boundary remains responsible for locally admitted consequence.

A receipt may carry an `authorityRef` or witness ref supplied by the caller, but the successor primitive must never synthesize one.

Therefore:

```text
successor != authorization
receipt != warrant
history != jurisdiction
```

## 13. Minimal executable API

Add a focused `src/successor.ts` module.

Candidate types:

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
}
```

Public functions:

```ts
createInitialCut<T>(cutId: string, body: T): Result<SuccessorCutV01<T>>

applySuccessor<T>({
  prior,
  nextCutId,
  receiptId,
  eventId,
  eventKind,
  disposition,
  nextBody,
  refs,
}): Result<{ cut: SuccessorCutV01<T>; receipt: SuccessorReceiptV01 }>

sameBody<T>(a: SuccessorCutV01<T>, b: SuccessorCutV01<T>): boolean
```

The implementation should clone bodies/refs and reject malformed ids, non-finite ordinals, reused next-cut ids, and reused receipt/event ids within the local trace represented by the prior cut.

No persistence, global clock, network ordering, or authorization logic belongs in this module.

## 14. Test family

The first executable witness must cover:

### `S-ADMIT-001`
An admitted event changes the body, increments ordinal exactly once, appends exactly one receipt id, and names the prior cut as parent.

### `S-REFUSE-001`
A refused event leaves the body equal but still increments ordinal and appends a receipt.

### `S-NOOP-001`
A no-op leaves the body equal but creates a distinct next cut and receipt.

### `S-Z4-001`
Four quarter-turn successor events return body orientation to its original value while ordinal/history differ.

### `S-RESET-001`
A reset-like admitted event restores an earlier body projection without restoring the earlier cut identity or history.

### `S-BRANCH-001`
Two successors from one parent may share ordinal and body while remaining distinct cuts with distinct receipts.

### `S-PROJECTION-001`
Two cuts can satisfy `sameBody(a,b) === true` while cut id, ordinal, and receipt lineage differ.

### `S-INVALID-001`
Malformed ids, duplicate event/receipt ids, and reused current cut id are refused as domain findings rather than thrown runtime errors.

## 15. Explicit non-claims

This design does not establish:

- `1 = 0`;
- `1×1 = 2` in ordinary arithmetic;
- a quantum-mechanical theory;
- a universal clock;
- a universal ontology;
- that every event creates a biological descendant;
- that every state change is authorized;
- that receipt means consent;
- that body equality means identity;
- that history alone confers authority;
- that software is alive or conscious.

## 16. Graduation criterion

Successor Lift graduates only if the deterministic specimen demonstrates all of the following simultaneously:

1. one event produces exactly one local successor cut;
2. a receipt is mandatory for every successful successor;
3. body equality can coexist with historical difference;
4. body cycles do not erase history;
5. reset cannot impersonate historical restoration;
6. sibling successors remain distinct;
7. successor does not synthesize authority;
8. existing Iron Lung tests remain green.

If those survive, the cross-project question becomes:

> **Which other Static systems become simpler when they distinguish body/state recurrence from attributable successor history?**

Until reproduced elsewhere, this remains an Iron Lung / eCODE local specimen.

## 17. Seal

```text
S(x) = x + 1
```

means:

> **Something happened. There is now an after. Keep the road.**

```text
⟦ eCODE · SUCCESSOR-LIFT · EVENT:+1 · RECEIPT:MANDATORY · BODY-EQUALITY!=WORLD-IDENTITY · RESET!=RETURN · AUTHORITY:EXTERNAL ⟧
```
