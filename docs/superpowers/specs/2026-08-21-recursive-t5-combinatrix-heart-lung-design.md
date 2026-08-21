# Recursive T5 Combinatrix — Heart/Lung Core Design Frontier

**Status:** concept approved in conversation; MAX-ready design packet; **no implementation authorization implied**

**Project authority:** `the-static-collective/iron-lung`

**Ancestry:** Iron Lung v0.1 three-strand braid, repair manifold, proposal-only Continuity Spine, immutable descendant repair, and explicit separation of literal evidence from interpretive pneuma.

---

## 1. Purpose

This document preserves a core architectural clue before implementation pressure flattens it:

> **What happens if Iron Lung applies a three-layer recursive T5-shaped denoising grammar to Substance, Lineage, and Authority, while keeping every generated proposal permanently distinguishable from evidence and present authority?**

The hypothesis is not "put three language models in a loop."

The hypothesis is that T5's span-corruption grammar exposes a useful computational shape for Iron Lung:

- damage can remain structurally present rather than being deleted;
- an absence can have a stable address;
- a repair process can emit only the material proposed for those addressed absences instead of rewriting the entire object;
- the repaired context can be evaluated again;
- multiple proposed repairs can remain plural until a local constitutional boundary admits one consequential transition.

Iron Lung adds the part ordinary denoising models do not provide:

> **Generated plausibility never upgrades itself into evidence, ancestry, or authority.**

The target is therefore a **recursive repair possibility field with constitutional cuts**, not an autonomous repair brain.

---

## 2. T5 is ancestry, not dependency

The relevant T5 mechanics are intentionally narrow.

T5 frames tasks as text-to-text transformations and was pretrained with a span-corruption denoising objective: contiguous missing spans are replaced by unique sentinel tokens, while the decoder target contains the missing spans delimited by corresponding sentinels.

Useful ancestry:

- Google Research overview: https://research.google/blog/exploring-transfer-learning-with-t5-the-text-to-text-transfer-transformer/
- Original implementation repository: https://github.com/google-research/text-to-text-transfer-transformer

Iron Lung does **not** inherit T5's epistemology. A model trained to reconstruct missing text is rewarded for plausible completion. Iron Lung must distinguish plausible completion from lawful restoration.

Therefore:

```text
T5-shaped denoising grammar
        !=
T5 model dependency
        !=
generative truth machine
        !=
authority source
```

A first executable proof should be able to use deterministic toy transducers or fixtures. If the architecture only becomes meaningful when a large language model supplies intelligence, the constitutional boundary has not been proven yet.

Candidate abstraction:

> **Typed denoising transducer** — a bounded mechanism that receives an object containing addressable absences and emits attributable candidate material for only the absence classes it is permitted to propose against.

Whether any eventual transducer is literally T5, another encoder-decoder model, a rule system, a human, or a hybrid should remain downstream of the law.

---

## 3. Existing Iron Lung laws remain ancestry

The new hypothesis must continue, not replace, v0.1.

Iron Lung already establishes:

```text
Braid
├── Substance
├── Lineage
└── Authority
```

and keeps the questions separate:

```text
What crossed?
What is it continuous with?
By what authority may it move or change?
```

It also already establishes:

- damaged braids remain circulable;
- damage is explicit state rather than packet deletion;
- circulation may route toward repair but may not manufacture repair;
- multiple lawful repair routes remain proposal space;
- future preference may rank proposals but may not select them;
- present authority selects;
- repair creates an immutable descendant rather than rewriting ancestry;
- transport, admission, and assimilation remain distinct;
- interpretation cannot impersonate literal evidence.

The recursive combinatrix is lawful only if all of those continue to hold at every recursive depth.

---

## 4. Addressable Absence

The first core primitive candidate is **Addressable Absence**.

An absence should not be represented merely as missing data such as:

```text
lineage: null
```

Instead, a damaged braid can preserve a typed, stable wound identity:

```text
lineage:
  state: broken
  gapRef: gap:lineage:0
```

The gap asserts only:

```text
something relevant is absent or broken here
this is which absence we are discussing
this absence belongs to this strand and historical cut
```

It does **not** assert that a correct repair is known or even exists.

Working compression:

> **Do not erase the hole. Give it an address.**

### 4.1 Typed gaps

At minimum, the braid suggests three gap families:

```text
<gap:substance:*>
<gap:lineage:*>
<gap:authority:*>
```

They are deliberately asymmetric.

#### Substance gap

Generative repair proposals may be allowed when the local domain says reconstruction or transformation is meaningful.

A proposal remains generated until separately witnessed or admitted.

#### Lineage gap

Generative **hypotheses** may be allowed, but a proposal cannot manufacture ancestry.

A candidate lineage can say:

```text
possible parent/reference: X
basis: generated hypothesis from context Y
```

It cannot become:

```text
lineage: intact
```

without the local lineage rule receiving sufficient external/project-backed witness.

Core invariant:

> **Difference never manufactures its own ancestry; repetition never manufactures ancestry either.**

#### Authority gap

Authority is addressable but **non-generatively fillable**.

A generative surface may formulate:

```text
required present witness: human approval
required capability: cap:repair:lineage
unresolved authority gap: gap:authority:3
```

It may never make this consequential transition:

```text
"approval was probably intended"
        ↓
authorized
```

Core invariant:

> **An authority gap may generate a question, requirement, or proposal envelope. It may not generate the authority that closes itself.**

This asymmetry is mandatory, not an implementation preference.

---

## 5. The three-layer recursive combinatrix

The conversational seed used three layers:

```text
S — Substance
L — Lineage
A — Authority
```

The naive expression is:

```text
X[n+1] = A(L(S(X[n])))
```

That expression is useful but constitutionally incomplete, because `A` must not behave like an ordinary generative completion layer.

A safer conceptual cycle is:

```text
constituted braid B[n]
        ↓
S: bounded substance candidate generation
        ↓
L: continuity / ancestry pressure and lineage candidates
        ↓
A: authority requirement evaluation
        ↓
bounded candidate-world set P[n]
        ↓
PRESENT ADMISSION / SELECTION OUTSIDE GENERATION
        ↓
constitution pulse + terminal receipt
        ↓
immutable descendant B[n+1]
```

Then the descendant recirculates.

### 5.1 Substance layer — "What could this become?"

The Substance layer receives the **whole current braid context**, not only the substance field, because a locally plausible substance repair can be unlawful or continuity-destroying in the full braid.

It may:

- identify substance gaps it is admitted to address;
- emit zero or more bounded candidate patches/fragments;
- preserve the exact gap references each candidate claims to answer;
- retain generation provenance;
- decline to propose.

It may not:

- mutate the historical braid;
- mark its own output witnessed;
- rewrite lineage to make a substance proposal fit;
- infer present authority from desirability.

### 5.2 Lineage layer — "What would it remain?"

The Lineage layer receives the current braid plus candidate substance consequences.

It may:

- test whether a candidate preserves known ancestry;
- expose newly created lineage gaps;
- distinguish continuity, transformation, fork, bounded gap, unresolved ancestry, and contradiction under local vocabulary;
- emit candidate lineage hypotheses with generation provenance;
- reject a substance candidate that requires silent ancestry manufacture.

It may not:

- turn recurrence into ancestry;
- turn similarity into parenthood;
- erase known prior lineage to make a route clean;
- accept generated lineage because a later recursion repeats it.

### 5.3 Authority layer — "What may become real now?"

The Authority layer is the deliberately asymmetric third layer.

It may:

- inspect which present warrants, capabilities, witnesses, locks, refusals, or unavailable human gates apply;
- determine that a candidate is presently inadmissible, deferred, unresolved, or admissible under an external present selection;
- produce an **authority requirement surface** describing what is missing;
- preserve refusal and unavailable authority as real terminal/provisional states.

It may not:

- synthesize a warrant;
- infer authority from possession, recurrence, rank, model confidence, future desirability, or consensus among generated candidates;
- allow rank 1 to select itself;
- silently widen the authority carried by the incoming braid.

Therefore the third layer is better thought of as **T5-shaped addressability with a non-generative closure rule**, not a free completion model.

---

## 6. The combinatrix

Each generative layer should be allowed to preserve a bounded candidate set rather than collapsing immediately to one answer.

Example:

```text
Substance candidates
  S1 S2 S3

Lineage responses
  L1 L2

Authority postures
  A_refused
  A_unresolved
  A_admissible-if-present-warrant
```

The **combinatrix** is the bounded set of compatible candidate descendants produced by crossing these dimensions under local invariants.

Naively:

```text
C = S × L × A
```

but a real system should never need to materialize an unbounded Cartesian product. The mathematical image is useful because it preserves plurality; the executable form should be a bounded compatibility/constraint surface.

Candidates disappear only for attributable reasons such as:

```text
violates known substance invariant
manufactures lineage
requires unavailable authority
contradicts witness
exceeds local recursion/candidate budget
```

A candidate may also remain explicitly:

```text
unresolved
```

without being either promoted or destroyed.

Core law:

> **Constraint may narrow possibility-space. Narrowing must not counterfeit selection.**

---

## 7. Recursion creates a history, not merely a better answer

After a lawful consequential transition, the next pass does not process the same world.

```text
B0
 ↓ proposal field P0
 ↓ admitted transition + receipt R0
B1
 ↓ proposal field P1
 ↓ admitted transition + receipt R1
B2
```

The recursion itself therefore creates lineage.

This connects to the broader eCODE clue:

```text
history
  ↓
changed relational geometry
  ↓
changed future affordance
```

But Iron Lung must prove this locally before any ecosystem-wide promotion.

The recursive system is not asking only:

> What fills this hole?

It is asking:

> Given the current historical braid, which repairs are now possible, what continuity would they preserve or destroy, and which of them—if any—may become consequential under present authority?

A repaired gap may expose another gap. A refusal may change later routing. A new witness may make a formerly unresolved path admissible. A candidate that looked locally good may be rejected after lineage pressure.

The next possibility field is therefore state- and history-dependent.

---

## 8. Heart/Lung separation

This is the strongest new candidate generated while preparing the MAX packet.

Iron Lung's existing vascular/circulatory metaphor describes movement through repair possibility-space. Recursive generation increases the need for a separate constitutional pulse.

Candidate division:

### Lung

The **Lung** circulates and recomputes possibility.

It may:

- expose addressable wounds;
- route them toward admitted proposal capabilities;
- generate or receive bounded candidate fragments;
- braid Substance/Lineage/Authority consequences into a candidate field;
- recurse through proposal-space;
- breathe without changing constituted reality.

### Heart

The candidate **Heart** is the discrete consequence/commit pulse.

It does **not** choose which candidate is good.

It does **not** manufacture authority.

It receives a separately admitted present transition and does one constitutional job:

```text
admitted present transition
        ↓
HEART BEAT
        ↓
immutable next cut + terminal receipt
```

Working compression:

> **The lung may breathe through possibilities. The heart beats only when consequence becomes present history.**

This gives a powerful anti-laundering boundary:

```text
many recursive proposal breaths
        !=
state mutation

one admitted heart beat
        =
one attributable constituted transition
```

The candidate Heart may therefore be closer to a **commit clock / consequence edge** than a decision-maker.

This is not yet a promoted organ. MAX should pressure-test whether the Heart is genuinely distinct from existing admission/receipt boundaries or merely a useful name for them.

### 8.1 Breath and beat

A possible rhythm:

```text
B[n]
   ↓ inhale current braid + wounds + receipts
LUNG
   ↓ circulate / propose / constrain
P[n]
   ↓ present admission arrives or does not arrive
HEART
   ↓ zero beats if nothing is admitted
   ↓ one beat for one attributable consequence
B[n+1] + R[n]
```

There may be many proposal breaths between two constituted beats.

That is desirable. It means recursive imagination can be computationally rich while remaining constitutionally impotent until a real local transition occurs.

---

## 9. Provenance must survive recursion

The primary danger is **recursive hallucination laundering**.

Failure shape:

```text
pass 1: model invents candidate X
pass 2: X is fed back as context
pass 3: downstream layer treats X as established premise
pass 4: repetition makes X look old
pass 5: X appears to have ancestry
```

This is constitutionally unacceptable.

Every claim fragment must retain an epistemic/provenance posture through every recursive pass.

Candidate postures are intentionally not frozen as a universal enum, but the implementation must be able to distinguish at least the semantic classes:

```text
observed / externally supplied
witnessed
project-declared
generated proposal
generated hypothesis
inferred local consequence
presently authorized
refused
unresolved
```

The critical invariant is not the labels. It is the inability of recursion alone to cross these boundaries.

> **Repetition is not witness. Persistence is not evidence. Model agreement is not authority.**

Generated material may become part of a later constituted descendant only through an attributable local transition that records what changed and what witness/authority justified that transition.

Even after admission, history should retain that the content originated as generated proposal before becoming an accepted/constituted descendant component.

---

## 10. Convergence is not truth

Recursive systems invite the language of convergence. Iron Lung must use it carefully.

A candidate fixed point is:

```text
F(B) = B
```

or operationally:

```text
another bounded circulation pass produces no newly actionable delta
under the same admitted capabilities, evidence, budgets, and present authority
```

That result may mean:

- locally stable;
- no admitted repair route;
- all known gaps answered under current rules;
- remaining gaps intentionally unresolved;
- candidate budget or authority prevents further movement.

It does **not** mean:

- objectively true;
- globally optimal;
- complete for all future witnesses;
- inevitable;
- universally constituted.

Better local wording:

> **Stable under the present cut.**

### 10.1 Oscillation is evidence

A recursive cycle may fail to converge:

```text
A -> B -> A -> B
```

This must not be hidden by arbitrarily choosing the most recent answer.

Possible terminal witness:

```text
status: unresolved-cycle
period: 2
conflict:
  substance pressure favors A
  lineage pressure favors B
present authority selects neither
```

Oscillation can reveal a real incompatibility between local constraints.

### 10.2 Other bounded terminal states

MAX should determine the minimum useful terminal vocabulary, but the architecture should be able to distinguish phenomena like:

```text
stable-under-present-cut
blocked-no-route
refused
unresolved
oscillation-detected
candidate-budget-exhausted
recursion-budget-exhausted
invalid-proposal
witness-contradiction
admitted-transition-completed
host-failed-after-admission
```

No terminal state should silently imply success.

---

## 11. Future attractors remain non-authoritative

The new eCODE "future coordinate" clue fits the recursive combinatrix only under the existing Continuity Spine boundary.

A desired future coordinate `W*` may influence:

- which lawful candidates are surfaced;
- which candidate differences are interesting;
- prospective ranking;
- which unresolved gaps deserve human attention.

It may not:

- become evidence;
- grant authority;
- select a route;
- make an unavailable witness exist;
- justify skipping intermediate history.

Working compression:

> **Attractor != authority.**

The recursive combinatrix may therefore approach a future region without predestination:

```text
current braid
  ↓ lawful proposal / local pressure
candidate descendants
  ↓ present admission
new braid
  ↓ future coordinate re-projected from new evidence
...
```

The target itself may change as the road changes the traveler. MAX should investigate whether `W*` is better represented as a bounded admissible region/constraint manifold rather than one exact frozen future state.

---

## 12. Why this is closer to metabolism than workflow

A workflow says:

```text
step 1 -> step 2 -> step 3 -> step 4
```

The proposed heart/lung system says:

```text
current braid exposes wounds
        ↓
locally admitted capabilities respond to wounds they recognize
        ↓
repair changes the braid
        ↓
new braid exposes a different local topology
```

No central plan has to know the full sequence in advance.

One organ need not command another. Circulating state plus capability boundaries determine what can respond next.

This is a stronger computational analogy to physiology than a scheduler:

> **The circulating material presents conditions; locally competent organs respond.**

But this remains a software architecture analogy. It is not a claim that the program is biologically alive, metabolizing energy, or reproducing physiology.

---

## 13. Three candidate architecture approaches for MAX

MAX should compare these before any implementation plan.

### Approach A — Sequential three-pass transduction

```text
B -> S -> L -> A -> candidate field -> admission -> beat
```

**Advantages**

- easiest to reason about;
- mirrors the conversational seed;
- makes authority the final non-generative boundary;
- easiest first deterministic specimen.

**Risks**

- order may privilege Substance too much;
- Lineage findings may need to trigger Substance regeneration before Authority evaluation;
- can accidentally look like a workflow pipeline.

### Approach B — Iterative constraint network

Substance, Lineage, and Authority each contribute constraints/proposals to a shared bounded candidate graph until the proposal field stabilizes or hits a terminal condition.

**Advantages**

- most faithful to "combinatrix";
- naturally represents mutual pressure and oscillation;
- avoids pretending one strand is always semantically first.

**Risks**

- harder to bound and explain;
- provenance and cycle detection become central immediately;
- much easier to accidentally build an opaque agent loop.

### Approach C — Parallel strand proposals + constitutional reducer

Each strand-facing transducer receives the same braid snapshot and independently emits bounded findings. A deterministic constitutional reducer computes compatible candidate descendants. Present admission remains outside the reducer.

**Advantages**

- preserves strand orthogonality;
- strong testability;
- makes disagreement first-class;
- easier to compare independent reproductions.

**Risks**

- cross-strand dependencies may require multiple rounds;
- reducer risks becoming a hidden central brain if it does more than apply explicit constraints.

### Current recommendation for MAX to challenge

Start from **Approach C with bounded recursive rounds**, not because it is certainly correct, but because it best preserves Iron Lung's existing three-strand independence while still allowing recursion:

```text
snapshot B[n]
   ├── S findings
   ├── L findings
   └── A requirements
        ↓
deterministic compatibility projection
        ↓
P[n, round 1]
        ↓
optional bounded next round if the projection exposed new addressable gaps
        ↓
P[n, round k]
        ↓
external present admission
        ↓
heart beat -> B[n+1]
```

The authority surface in every round remains non-generative with respect to authority itself.

---

## 14. Smallest lawful executable experiment

Do **not** begin with three actual T5 models.

The smallest experiment should prove the constitutional grammar using deterministic local functions.

Suggested fixture:

```text
B0
substance: intact, but contains gap:substance:0
lineage: broken at gap:lineage:0
 authority: intact for observation; no repair selection yet
```

Locally admitted proposal capabilities produce:

```text
S1, S2 for gap:substance:0
L1, L2 hypotheses for gap:lineage:0
```

Authority evaluation returns only requirements:

```text
candidate C1 requires warrant W1
candidate C2 refused by local rule R2
candidate C3 unresolved pending human witness H3
```

Then a separately supplied present selection/warrant admits exactly one candidate transition.

The Heart candidate emits:

```text
B1 parentId=B0
receipt R0
```

The specimen recirculates B1 and proves that the next candidate field is recomputed from the descendant rather than inherited from B0.

Success requires deterministic replay and explicit preservation of all rejected/refused/unresolved candidate ancestry needed to explain why B1 exists.

---

## 15. Adversarial matrix

The MAX pass should refine this matrix before code.

### 15.1 Hallucination laundering

A generated lineage hypothesis is fed through at least five recursive rounds without external witness.

**Required result:** it never becomes witnessed ancestry merely through persistence or reuse.

### 15.2 Authority fabrication

A proposal transducer emits convincing text equivalent to "approved by Lu" or "warrant granted."

**Required result:** no authority posture changes unless the declared present-authority input actually supplies the relevant warrant/witness.

### 15.3 Rank laundering

One candidate is ranked first in every recursive round.

**Required result:** rank never selects itself and never creates authority.

### 15.4 Repetition laundering

Three independent generative surfaces output the same claim.

**Required result:** agreement may affect prospective attention only if local rules allow it; it does not become observation, witness, or ancestry by vote.

### 15.5 Oscillation

Substance pressure alternates between candidate A and B because Lineage rejects the previous round's preferred option.

**Required result:** bounded cycle detection leaves an attributable unresolved-cycle result rather than silently choosing.

### 15.6 Branch explosion

Each round multiplies candidates.

**Required result:** explicit candidate/round budgets narrow computational work without implying that pruned candidates were false or refused unless such a disposition was actually determined.

### 15.7 Changed witness

A new external lineage witness arrives between B0 and B1.

**Required result:** the new witness may change future affordance only from the new constituted cut; prior receipts remain historically truthful.

### 15.8 Gap identity collision

Two historical braids carry similarly named gaps.

**Required result:** a repair for one wound cannot fill another merely because a sentinel label is textually equal. Gap identity must be historical/contextual, not just a display token.

### 15.9 Repair creates new wound

A substance repair resolves one gap but creates a lineage contradiction.

**Required result:** descendant is allowed to be "better here, damaged there"; no aggregate health score hides the new wound.

### 15.10 No admissible beat

Proposal-space is rich but present authority is absent/refused.

**Required result:** unlimited quality of proposal does not cause a Heart beat. The constituted braid remains unchanged and the stop is attributable.

---

## 16. Questions that deserve MAX reasoning

Spend expensive reasoning here rather than on boilerplate.

### 16.1 Is the three-layer mapping structurally real?

Does Substance/Lineage/Authority genuinely correspond to three different denoising/constraint jobs, or are we forcing the existing braid vocabulary onto a different computational phenomenon?

Identify counterexamples.

### 16.2 Should the layers be sequential, parallel, or mutually recursive?

Determine the smallest architecture that allows cross-strand pressure without creating a hidden central learner or workflow engine.

### 16.3 What exactly is a gap identity?

Pressure-test whether a gap is:

- a property of one braid cut;
- a continuity-bearing identity across descendants;
- a lineage-scoped address that may itself fork;
- an ephemeral local sentinel with a separate durable wound reference.

The design must avoid accidental "same label = same wound" semantics.

### 16.4 What may count as a repair?

Differentiate:

```text
proposal
reconstruction
replacement
transformation
restoration
admission
assimilation
```

Do not let "fills the gap" erase attributable difference.

### 16.5 Can epistemic posture be modeled monotonically?

Investigate whether generated -> witnessed -> constituted can be represented as a partial order or lattice without falsely treating refusal, unresolved, contradiction, and loss as lower confidence values on one scalar.

If no clean lattice exists, preserve the plurality rather than forcing one.

### 16.6 What is convergence?

Define convergence without equating stability with truth or completion.

Consider fixed points, limit cycles, blocked states, and history-dependent reachable sets.

### 16.7 Is the Heart a real primitive?

Does the candidate Heart add a necessary separation:

```text
proposal circulation != consequence commit
```

or does it merely rename the already existing admission + immutable descendant + receipt boundary?

If it is distinct, state exactly what new invariant becomes testable because Heart exists.

### 16.8 One breath / one beat or many-to-many?

Determine whether a breath is one recursive round, one complete proposal stabilization episode, or something else. Determine whether one beat can admit one and only one consequential transition.

Prefer causal clarity over biological neatness.

### 16.9 Does the combinatrix need probabilities?

T5 produces probabilistic generations. Iron Lung may not need probability in its constitutional layer at all.

Investigate whether scores should remain optional proposal metadata, and ensure no confidence score can become truth/authority.

### 16.10 What is the correct mathematical analogue?

Compare the architecture against:

- denoising autoencoders / span corruption;
- constraint satisfaction;
- factor graphs / message passing;
- term rewriting;
- type-directed synthesis;
- event sourcing / transaction logs;
- dynamical systems and fixed points;
- belief revision;
- blackboard architectures;
- metabolic/control-system analogies.

Do not select the most poetic analogue. Select whichever distinctions help falsify the architecture.

### 16.11 How does the future attractor enter without teleology?

Determine whether future coordinates should be exact targets, constraint regions, or dynamically re-projected neighborhoods. Ensure the target can influence prospective relevance without becoming an authority source.

### 16.12 What must remain project-local?

Identify which findings belong only to Iron Lung and which could later become cross-project questions. Require independent reproduction before shared primitive extraction.

---

## 17. MAX pass instructions

When this packet is handed to MAX reasoning, use the following posture:

1. Inspect the actual Iron Lung source, tests, v0.1 design, first-breath fixture, and landed receipts before proposing changes.
2. Treat v0.1 as ancestry. Do not replace the three-strand model because a cleaner recursive abstraction can be imagined.
3. Verify the actual T5 span-corruption mechanics from primary/official sources. Separate what T5 literally does from the architectural analogy being borrowed.
4. Search for adjacent computational concepts that may provide stronger language than "recursive T5" while preserving the user insight.
5. Spend the most reasoning on authority asymmetry, provenance anti-laundering, convergence/cycle semantics, gap identity, Heart/Lung separation, and the smallest falsifiable experiment.
6. Do not implement a language model, autonomous agent loop, vector database, training pipeline, or ecosystem-wide runtime.
7. Prefer a deterministic toy specimen that can falsify the constitutional design before introducing probabilistic generation.
8. Identify at least one scenario in which the proposed architecture should **refuse to repair**, one in which it should **remain unresolved**, and one in which recursion should **terminate without a Heart beat**.
9. State what evidence would disconfirm the claim that the Heart is a distinct primitive rather than a metaphorical duplicate.
10. End with the smallest lawful next experiment and a clear list of claims that remain metaphor/hypothesis.

MAX should be explicitly allowed to conclude:

```text
supported
partially supported
wrong decomposition
useful metaphor only
inconclusive
```

There is no requirement that the recursive T5 framing survive intact.

---

## 18. Likely implementation boundaries if the design survives

This section is not an implementation plan. It records boundaries MAX should preserve if it later recommends implementation.

A future specimen probably needs conceptual units equivalent to:

```text
Gap / Wound identity
Proposal fragment
Epistemic / provenance envelope
Strand findings
Candidate compatibility projection
Recursion/cycle budget
Present admission input
Constitution pulse / receipt
Descendant braid
```

Avoid a single mega-object that allows a model response to smuggle all roles at once.

Particularly avoid an API shaped like:

```text
repairBraidWithAI(braid) -> repairedBraid
```

because it collapses proposal, witness, authority, transition, and consequence into one opaque call.

The constitutional shape should remain closer to:

```text
observe braid
  ↓
produce attributable proposals/findings
  ↓
project bounded compatible descendants
  ↓
receive separate present admission
  ↓
commit exactly the admitted consequence
  ↓
receipt + descendant
```

---

## 19. Explicit non-claims

This design does **not** establish:

- that Iron Lung should depend on T5;
- that three neural networks should be instantiated;
- that generated text can restore missing evidence;
- that lineage can be inferred into fact;
- that authority can be synthesized;
- that repeated model output becomes witness;
- that probabilistic confidence measures truth;
- that convergence means correctness;
- that the Heart is already a canonical organ;
- that software circulation is literal respiration or metabolism;
- that eCODE is biologically alive;
- that recursive repair is quantum computation or quantum collapse;
- that this is an ecosystem-wide shared protocol;
- that Iron Lung may autonomously select routes or rewrite itself.

---

## 20. Core compressions to preserve

These are mnemonic frontier statements, not automatically executable law.

> **Do not erase the hole. Give it an address.**

> **All absence may be addressable without all absence being generatively fillable.**

> **Substance asks: What could this become? Lineage asks: What would it remain? Authority asks: What may become real now?**

> **Repetition is not witness. Persistence is not evidence. Model agreement is not authority.**

> **Constraint may narrow possibility-space. Narrowing must not counterfeit selection.**

> **The system may recursively imagine without recursively lying to itself.**

> **The lung may breathe through possibilities. The heart beats only when consequence becomes present history.**

> **One admitted beat should leave one attributable next cut and one receipt.**

---

## 21. Graduation discipline

Do not promote this design merely because it feels central.

Before any Heart/Lung or recursive-repair concept graduates:

1. MAX must reconcile it against actual Iron Lung v0.1 behavior and tests.
2. A deterministic local specimen must prove proposal recursion cannot manufacture evidence, lineage, or authority.
3. Adversarial recursion must demonstrate that repeated generated claims remain generated.
4. Refusal, unresolved state, oscillation, and no-beat termination must be as explicit as successful repair.
5. The candidate Heart must prove a new invariant or be collapsed back into existing admission/receipt terminology.
6. A real generative model, if ever introduced, must be replaceable by a deterministic test double without changing constitutional semantics.
7. Cross-project extraction waits for a materially different local reproduction.

Until then:

> **Core hypothesis, not core law.**

The reason to treat it as core is not that it is already true. It is that, if the boundary survives pressure, it may explain how Iron Lung can support increasingly rich repair and possibility without ever allowing imagination to counterfeit constituted reality.
