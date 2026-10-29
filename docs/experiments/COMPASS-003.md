# COMPASS-003 — Let the words do the work

The original Iron Lung `src/content-compass.ts` removes heading-only labels. Neither `FACT`, `IDEA`, nor `RELATION` appears in the prompt as an organizing tag. Instead, every model-visible line says something about the actual interface:

```text
SOURCE_PROOF produces
cannon.reflex-memory/v1 memory
VISUAL_STUDY expects
planz.generated-plan/v1 input
A bridge
could translate
receipt identity
The bridge
already exists
VERIFIED_RECEIPT_PLAN_ID_V1 connects
reusableRecipe.planId identity
Direct types
remain different
You identify
adapter availability
Answer briefly
No execution
```

Each line has two or three whitespace-delimited words. The source-owning runtime takes the same `iron-lung/compass-real-contract/v1` typed task already grounded in CANNON original Reflex Composer. Provenance metadata, including the fact-versus-proposal distinction, is retained in typed receipts **outside** the prompt. A statement about what exists comes from the original CANNON source; hypothetical bridges are expressed as possibilities.

Two explicit scenarios are tested: the **actual already verified adapter** is available; or it is *deliberately disabled for a synthetic test*. The latter is **not a claim that the actual deployed software lacks the adapter**. The direct original output-port and receiver-input-port types do not match; the original verified adapter is needed.

There are two prompt variants (minimal vs focused) crossed with two address variants (neutral vs second person) and two source-grounded adapter scenarios, giving eight arms. Each gets exactly three breaths of three original Substance, Lineage, Authority-requirement transformations: 9 model calls per arm, 72 total. `You identify` appears only in directed arms. The previous answer is supplied in a bounded, source-tracked line, reset for each arm. The original Google FLAN-T5 Small CPU inference provider is unchanged and source-pinned.

Independent verifier `inspectContentCompass` checks complete parent chain, the precise source-generated prompts, their exact word limits and no heading labels, expected answers, immutable source contracts, model identity and the non-authorization status. No data is promoted to authority, execution or verified invention. Metrics comparing exact source-value extraction are **not** claims of novel adapter discovery or genuine software problem-solving.

CANNON INSPAND-009 derives the typed task directly from its original registries, independently pins the owner source, conducts the pretrained-model run and cold replay, and preserves an inspectable side-by-side reviewer.
