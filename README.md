# Iron Lung

> the liminal space between

Iron Lung v0.1 is a local boundary-and-transformation instrument. Its first executable specimen is its own birth.

## Core laws

- **Always three strands:** substance, lineage, authority.
- **Damaged braids may circulate.** Damage is explicit state, not packet deletion.
- **Capability-based circulation routes but does not repair.**
- **Multiple routes ascend as proposal space.** Continuity Spine may rank; present authority selects.
- **Repair creates descendants.** Historical braids are never rewritten.
- **Transport != admission != assimilation.**
- **Pneuma is interpretive, never literal evidence or authority.**

A braid keeps three questions distinct while something moves:

```text
What crossed?
What is it continuous with?
By what authority may it move or change?
```

The first-breath specimen starts with a three-strand birth braid whose lineage is explicitly broken, discovers two admitted lineage-repair capabilities, sends the fork through a proposal-only Spine boundary, applies the separately supplied present selection, emits an immutable descendant braid, re-evaluates circulation from the descendant state, checks assimilation eligibility, and validates pneuma separately.

## Successor Lift — local eCODE specimen

Iron Lung now carries one additional experimental primitive:

```text
S(x) = x + 1
```

Here `+1` means **one additional attributable local event/cut**. It does not mean one second, one unit of physical time, one unit of truth, or one unit of authority.

The successor specimen preserves three boundaries:

```text
same body != same historical world
reset != return
successor != authority
```

An admitted event, refusal, failure, or no-op can all advance local history when an attributable event actually occurred. The body projection may remain byte/deep-equal while the next cut has a new ordinal, parent relation, event id, and receipt.

`src/successor.ts` deliberately owns only local succession and body-equivalence comparison. It does not authorize events, choose routes, persist state, create a global clock, or order unrelated worlds.

Design: [`docs/superpowers/specs/2026-08-27-ecode-successor-lift-design.md`](docs/superpowers/specs/2026-08-27-ecode-successor-lift-design.md)

Working compression:

> **Something happened. There is now an after. Keep the road.**

## Run it

```bash
npm install
npm run check
npm run first-breath
```

`npm run first-breath` reads only the pinned local fixture at `fixtures/first-breath-v01.json` and prints one deterministic receipt. It performs no file writes and no network calls.

## Boundaries

The replay does **not** fetch GitHub, GitBook, conversation history, or TranchNode. External references in the fixture are opaque inputs; recording a reference does not make Iron Lung evidence authority for the referenced source.

Iron Lung v0.1 is **not**:

- a thermodynamic simulator or energy/entropy accounting system;
- proof or disproof of Spirit;
- theology presented as measurement;
- an autonomous repair system;
- an autonomous route selector;
- a generic service mesh or network transport;
- a scheduler or AI planner;
- a shared ecosystem vascular schema;
- a universal clock or global event counter.

The local specimen does not graduate **Braided Transfer**, **Repair Manifold**, or **Successor Lift** into a cross-project Pattern. Another materially different system must reproduce the deeper invariant locally before any shared-law claim is warranted.

## Relationship to Continuity Spine

```text
Continuity Spine: how the self may become through time
Iron Lung:       what crosses the membrane while becoming is possible
```

The Spine-facing contract in this repository is intentionally local and proposal-only. It proves the authority boundary without importing TranchNode's implementation schema or runtime authority.
