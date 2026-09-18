# APERTURE / TRIAD / BRAID — Semantic Tensor Design Frontier

**Date:** 2026-09-17  
**Status:** CANDIDATE / design frontier / no runtime promotion  
**Project authority:** `the-static-collective/iron-lung`  
**Ancestry:** Recursive T5 Combinatrix / Heart-Lung design (PR #3), Iron Lung v0.1 three-strand braid, Green Grammar `IDEA / FACT / RELATION` formation witness, Static Workbench HumanTerminal design conversation.

---

## 1. The new clue

The prior Recursive T5 Combinatrix design already asks how a three-strand system can recursively generate bounded possibilities without allowing generated material to counterfeit evidence, ancestry, or authority.

A new HumanTerminal question exposes a missing layer **before** semantic classification:

> What if the machine should first preserve multiple possible meanings in unresolved tension, before asking whether any reading is a fact, idea, or relation?

The resulting candidate stack is:

```text
RAW
  ↓
APERTURE
  Signal / Context / Gap
  ↓
SENSE FIELD
  one or more unresolved candidate readings
  ↓
TRIAD
  Fact / Idea / Relation
  ↓
BRAID
  Substance / Lineage / Authority
  ↓
LUNG
  bounded proposal circulation
  ↓
present admission
  ↓
HEART
  attributable consequence + receipt
```

This is not a proposal to let a model decide what a human meant.

It is a proposal to make **non-decision itself representable**.

---

## 2. APERTURE — the pre-semantic layer

APERTURE is the candidate name for the first derived layer after raw input.

Its job is not to classify truth, infer intent, or choose one interpretation. Its job is to retain the minimum structure needed to represent what was given, what constrains interpretation, and what remains unresolved.

### 2.1 Signal — what was actually given?

Signal stays maximally close to the carrier.

Examples:

- exact words and spans;
- punctuation and ordering when relevant;
- explicitly named entities;
- explicit assertions;
- literal references or selections;
- source identity and timestamp;
- non-text carrier references when the HumanTerminal points at an object.

Signal does not upgrade an utterance into truth.

```text
human said X
!=
X is established fact
```

### 2.2 Context — what constrains what this could mean?

Context is typed and attributable.

Possible context sources include:

- immediately preceding utterances;
- explicitly selected Workbench objects;
- active project/workspace;
- known source packets;
- observer-local availability;
- temporal cut;
- declared task frame.

Context must preserve source identity. Conversation context, source evidence, model memory, repository documentation, and user selection are not interchangeable context classes.

```text
contextual fit
!=
intended meaning
```

### 2.3 Gap — what remains unresolved?

Gap is the APERTURE-facing relative of Iron Lung's Addressable Absence.

A semantic gap may represent:

- ambiguous token or phrase;
- unresolved pronoun/reference;
- missing premise;
- alternative scope;
- uncertain relation type;
- competing parses;
- absent context needed to choose between readings;
- a question the machine cannot lawfully answer from the present cut.

Core law:

> **Do not erase ambiguity. Give it an address.**

An APERTURE gap does not imply that one correct completion is known or that generative completion is authorized.

---

## 3. Sense Field — unresolved meaning as a first-class object

APERTURE emits a bounded **Sense Field**, not one canonical interpretation.

Example:

```text
input:
  "the bank moved"

reading r1:
  financial institution changed location / organizational position

reading r2:
  river bank physically shifted

reading r3:
  aircraft/vehicle performed a banking maneuver
```

A useful receipt may preserve:

```text
sense_field_id
source_raw_ref
candidate_readings[]
tensions[]
required_discriminators[]
context_refs[]
generation_provenance
status: unresolved
```

The most important APERTURE laws are:

```text
POSSIBLE MEANING != INTENDED MEANING
HIGHEST SCORE != INTENDED MEANING
CONTEXTUAL FIT != INTENDED MEANING
REPETITION != INTENDED MEANING
MODEL AGREEMENT != INTENDED MEANING
```

Ambiguity is information.

Premature disambiguation is lossy transformation.

---

## 4. TRIAD — semantic role after APERTURE

Each candidate reading may then be projected through the Human-facing semantic TRIAD:

```text
FACT
IDEA
RELATION
```

These labels describe **semantic role**, not constitutional authority.

### 4.1 Fact candidate

A candidate assertion whose shape is fact-like.

Examples:

- "the input explicitly names Memphis";
- "the source states X";
- "the file contains checksum Y".

Internal naming should prefer `fact_candidate` or `assertion` until the relevant evidence rule admits stronger language.

### 4.2 Idea

A proposed interpretation, hypothesis, possibility, analogy, design, or speculative continuation.

An idea may be useful without being supported.

### 4.3 Relation candidate

A proposed typed edge or correspondence between addressable objects.

Examples:

```text
A --possible_parallel--> B
claim --derived_from--> source
reading --requires_context--> object
event --occurred_after--> event
```

A generated relation remains a relation candidate until its owning project establishes whatever posture is required.

---

## 5. BRAID — constitutional posture is a separate axis

Iron Lung already preserves:

```text
Substance — What crossed?
Lineage   — What is it continuous with?
Authority — By what authority may it move or change?
```

The new result is that TRIAD and BRAID must **not** be collapsed one-to-one.

Wrong:

```text
Fact = Substance
Idea = Lineage
Relation = Authority
```

Instead:

- APERTURE describes the **interpretive source condition**;
- TRIAD describes the **semantic form**;
- BRAID describes the **constitutional posture and continuity**.

Therefore a generated fact candidate may have:

```text
semantic_role: fact_candidate

substance:
  "The input explicitly names Memphis."

lineage:
  derived from raw utterance U17
  via transform T5-provider-X / prompt-version-Y

authority:
  generated extraction
  not externally witnessed
  not admitted as project fact
```

This prevents the label `FACT` from smuggling authority.

---

## 6. The 3 × 3 × 3 semantic tensor

The candidate axes are:

```text
AXIS A — APERTURE
Signal / Context / Gap

AXIS B — TRIAD
Fact / Idea / Relation

AXIS C — BRAID
Substance / Lineage / Authority
```

This yields 27 possible coordinates.

Examples:

### Signal × Fact × Substance

Material explicitly present in the source, represented as a fact-shaped assertion about what crossed.

### Context × Relation × Lineage

A candidate relation suggested by bounded context whose derivation/continuity is itself the object of inspection.

### Gap × Idea × Authority

A possible interpretation of an unresolved absence for which no present authority exists to constitute a consequential claim.

### Signal × Relation × Lineage

An explicitly stated relation whose source lineage can be preserved independently from whether the relation is true outside the source.

### Gap × Fact × Authority

A dangerous cell: the system may formulate the fact-shaped question created by a gap, but must not manufacture the warrant that closes it.

---

## 7. The cube is an address space, not a mandatory explosion

The system should **not** generate 27 artifacts for every utterance.

```text
3 × 3 × 3
    ↓
possible semantic coordinates
    !=
materialize all 27 cells
```

The cube supplies:

- an address grammar;
- a way to name mixed cases;
- a test surface for collapse errors;
- a comparison space between different transforms;
- a target for Dogram calculation without requiring Dogram to decide meaning.

A sparse representation is preferred.

---

## 8. Raw provenance remains beneath the cube

The derived layers never replace the source.

A minimal ancestry shape is:

```text
RawUtterance U17
  ├── Aperture pass A1
  │    ├── reading r1
  │    ├── reading r2
  │    └── unresolved gap g3
  ├── TRIAD pass T1 over r1
  ├── TRIAD pass T2 over r2
  └── later corrected/replayed passes
```

Future transforms may disagree.

That disagreement is history, not corruption.

A model upgrade must not rewrite prior outputs as if they had never existed.

---

## 9. T5 is a provider, not the protocol

The HumanTerminal conversation proposed T5 / FLAN-T5 because text-to-text task prefixing fits the desired shape.

Candidate task surfaces may look like:

```text
static.aperture:
  preserve signal, bounded context, and unresolved gaps

static.fact:
  emit fact-shaped candidates from one reading

static.idea:
  emit idea/hypothesis candidates from one reading

static.relation:
  emit typed relation candidates from one reading + bounded context
```

But:

```text
APERTURE != T5
TRIAD != T5
IRON LUNG != T5
```

T5 should remain a replaceable provider.

A deterministic fixture or rule transducer must be able to exercise the constitutional grammar without a neural model.

---

## 10. Relation to Heart / Lung

The new stack sharpens the Heart/Lung split.

### Lung

The Lung may circulate:

- multiple sense readings;
- unresolved gaps;
- fact/idea/relation candidates;
- cross-strand constraints;
- proposed mappings;
- possible descendants.

It may recurse without mutating constituted reality.

### Heart

The Heart does not choose the most probable interpretation.

It receives an independently admitted consequential transition and commits one attributable next cut.

```text
many meanings
many semantic candidates
many proposal breaths
        !=
constituted change

one separately admitted consequence
        ↓
HEART
        ↓
one next cut + receipt
```

---

## 11. Workbench / HumanTerminal seam

The Static Workbench should present this architecture without owning it.

Candidate HumanTerminal surface:

```text
RAW INPUT
  "..."

APERTURE
  Signal  [n]
  Context [n]
  Gap     [n]

SENSE FIELD
  Reading 1
  Reading 2
  Unresolved

TRIAD
  Fact     [n]
  Idea     [n]
  Relation [n]
```

Every item can become a Workbench Object and be routed to an owner:

- ALEX — evidence/provenance pressure;
- Dogram — exact graph/combinatorial calculation;
- 3rdi — observer-local availability/focus/known-at;
- LOADOUT — declared capability binding;
- Iron Lung — proposal circulation/admission boundary.

The Workbench must not silently promote a generated item merely because it is easy to click.

---

## 12. Jurisdiction split

### Iron Lung

Owns the constitutional distinction between proposal circulation and consequence.

### 3rdi

Natural pressure surface for:

```text
which readings were available
under which observer cut
with which context/focus
at what known-at coordinate
```

### ALEX

Natural pressure surface for:

```text
what source supports this
what was generated
what was inferred
what was observed
what changed posture
what evidence path survives
```

### Dogram

Natural mathematical surface for:

- sparse 3×3×3 occupancy;
- candidate relation graph;
- ambiguity fibers;
- collapse under projections;
- compatibility constraints;
- change in candidate field after new context;
- exact deltas between passes.

Dogram does not decide which reading is intended.

### Workbench

Presentation and routing surface only.

---

## 13. Smallest lawful experiment

Do **not** start with a live T5 model.

Use deterministic fixtures.

### Fixture A — lexical ambiguity

Raw:

```text
"The bank moved."
```

APERTURE emits at least three readings and an unresolved referent/type gap.

Required result:

- no reading is chosen merely because one has highest synthetic score;
- TRIAD may classify claims inside each reading;
- no generated reading becomes user intent.

### Fixture B — context narrows without rewriting history

Add explicit context:

```text
"After the flood, the bank moved six feet east."
```

Required result:

- new cut narrows the current sense field;
- earlier ambiguity receipt remains historically correct.

### Fixture C — generated fact laundering

A transform emits:

```text
"The bank definitely refers to a river bank."
```

Required result:

- assertion remains generated;
- wording such as "definitely" changes no authority posture.

### Fixture D — relation proposal

Input permits:

```text
bank --shifted_east_of--> prior_bank_position
```

Required result:

- Dogram may calculate graph delta;
- ALEX may inspect evidence;
- relation does not self-establish.

### Fixture E — no lawful resolution

Provide insufficient context permanently.

Required result:

```text
status: unresolved
```

Unresolved is a successful terminal outcome.

---

## 14. Adversarial controls

### Premature collapse

Highest-scoring reading wins automatically.

**Required:** REFUSE.

### Context laundering

Generated previous output is reintroduced as if it were external context.

**Required:** provenance remains generated.

### Label laundering

A `FACT` semantic role becomes evidence authority.

**Required:** impossible without separate posture transition.

### Relation laundering

Repeated model agreement on one edge becomes historical relation.

**Required:** repetition may affect attention only under declared policy; it does not mint lineage.

### Gap erasure

A new context resolves one ambiguity and the historical gap disappears from old receipts.

**Required:** old receipt remains intact.

### Cube explosion

System materializes all 27 tensor cells regardless of usefulness.

**Required:** bounded sparse projection.

### Authority completion

Model fills an authority gap with plausible permission text.

**Required:** no authorization change.

---

## 15. Core candidate laws

> **AMBIGUITY IS INFORMATION.**

> **DO NOT RESOLVE A MEANING MERELY BECAUSE A MODEL CAN.**

> **POSSIBLE MEANING != INTENDED MEANING.**

> **SEMANTIC ROLE != CONSTITUTIONAL POSTURE.**

> **FACT-SHAPED != ESTABLISHED FACT.**

> **RELATION CANDIDATE != ESTABLISHED RELATION.**

> **THE CUBE IS AN ADDRESS SPACE, NOT A DEMAND TO MATERIALIZE EVERY CELL.**

> **RAW SURVIVES EVERY TRANSFORM.**

> **THE LUNG MAY BREATHE THROUGH MEANINGS. THE HEART BEATS ONLY FOR AN ADMITTED CONSEQUENCE.**

---

## 16. Promotion discipline

This document promotes no shared ontology.

Before APERTURE / TRIAD / semantic tensor becomes executable law:

1. prove the grammar using deterministic fixtures;
2. demonstrate that unresolved meaning survives without forced collapse;
3. demonstrate that TRIAD labels cannot promote epistemic authority;
4. demonstrate that generated context cannot launder itself through recursion;
5. reproduce the architecture in at least one materially different input domain;
6. let Dogram show what information is lost under proposed compressions;
7. let 3rdi show observer-local availability without turning availability into truth;
8. let ALEX pressure provenance and evidence paths;
9. only then compare actual T5/FLAN-T5 or other model providers;
10. preserve a clean provider boundary so model replacement does not change constitutional semantics.

Until then:

> **Candidate semantic tensor, not shared law.**
