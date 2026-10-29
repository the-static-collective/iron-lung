# IRON-LUNG T5-TRIPLE-001 — three nested recursive transfer membranes

**Source owner:** `the-static-collective/iron-lung`. Draft, review-only.
**Ancestry:** Iron Lung merged Recursive T5 Combinatrix #3, HEART-001 #7 (first deterministic consequence specimen), existing three-strand braid and Addressable Absence. The later APERTURE / TRIAD / BRAID frontier #6 is explicitly *design-only*; this experiment keeps the sparse addresses as metadata rather than falsely claiming the 27-cell theory is implemented.

## The recovered idea, not a made-up three-model chain

The original August 21 design was never simply three T5 models in a row. It proposed **three conceptually nested transfers** (Substance → Lineage → Authority requirements) that can recursively reconsider possible repairs while keeping any generated text out of evidence, true ancestry and present authority.

The runnable experiment now implements exactly that under a bounded depth of one, two or three breaths:

```text
Constituted B0 (unchanged; original S/L gaps + existing authority)
  └─ breath 1
       ├─ SUBSTANCE: propose a missing substance reading
       ├─ LINEAGE: pressure-test continuity of that proposal
       └─ AUTHORITY_REQUIREMENTS: articulate what independent human witness
           or permission WOULD be needed; NEVER provide or infer that grant
          └─ breath 2 (the previous output actually enters the next prompt)
               ├─ SUBSTANCE
               ├─ LINEAGE
               └─ AUTHORITY_REQUIREMENTS
                  └─ breath 3
                       ├─ SUBSTANCE
                       ├─ LINEAGE
                       └─ AUTHORITY_REQUIREMENTS
                           └─ bounded nine-step LUNG field, no HEART beat
```

Each step is content-addressed and cites its immediate parent, the unchanged raw source digest, the source braid digest, original typed gaps, the exact model identity and its input/output digests. A different earlier candidate changes the next prompt and hence potentially all downstream requests. The model receives a deliberately bounded context. No full Cartesian 3×3×3 semantic materialization is claimed. Sparse non-authoritative addresses indicate APERTURE/GAP, TRIAD/IDEA, BRAID/SUBSTANCE; APERTURE/CONTEXT, TRIAD/RELATION, BRAID/LINEAGE; and APERTURE/GAP, TRIAD/IDEA, BRAID/AUTHORITY. The Authority-stage **content is a proposal for external requirements**, never an authority strand change.

All nine outputs have `PROPOSAL_UNVERIFIED`, `actualAuthority: NONE`, `heartBeat: false`, `evidenceMinted: false`. The original source braid is never mutated or rewritten. The resulting field is LUNG possibility only. The independently admitted HEART-001 path (PR #7) remains separate, uninvoked by this model experiment.

## Use it now

**Zero model dependency, deterministic fixture:**

```bash
npm install
npm run check
npm run --silent triple-transfer -- --provider fixture --depth 3 > /tmp/iron-lung-nested.json
npm run --silent triple-transfer -- --verify /tmp/iron-lung-nested.json
```

**Actual Google FLAN-T5 Small checkpoint, running entirely on CPU:**

```bash
python3 -m pip install 'torch>=2.2,<3' --index-url https://download.pytorch.org/whl/cpu
python3 -m pip install -r model/requirements-triple.txt
npm run --silent triple-transfer -- --provider flan --depth 3 > /tmp/iron-lung-flan.json
npm run --silent triple-transfer -- --verify /tmp/iron-lung-flan.json
```

The optional Python process loads `google/flan-t5-small` once, with fixed checkpoint revision `14fd6edcfdd71f2ef5b67d4e735fee8bc6d9fd31`, uses safetensors (not pickle), and handles all nine serial nested requests with greedy CPU inference. The model weights are Apache 2.0. Model availability requires network/cached weights and CPU memory; model quality is not established by a smoke test. Nothing uploads to a model API; the first download retrieves public model files from Hugging Face. No user-private data is passed in the hosted demo.

The hosted workflow includes both the deterministic structural proof and a **separate actual FLAN-T5 CPU smoke job**. They must be evaluated separately; a green fixture test is not proof that actual model weights executed.

## Refusal, memory and boundaries

The machine fails closed on depth >3, mismatched gaps/invalid braids, an empty or overlong proposed text, broken content addresses, missing parent links, altered fields, and counterfeit authority. Even a model response claiming to be a judge/owner is retained exclusively as **untrusted proposal text**. No text is parsed as an executable command, selection, grant, verified fact, repair, witness or admission. No hidden source-input changes. No FLAN outputs are allowed into the existing HEART execution path without a later explicitly specified user-selected interface and independent authorization.

**What is proven only when runtime tests pass:** bounded serial three-stage recursion, nine connected source-attributed proposal transformations, deterministic fixture replay, and optionally real FLAN inference with pinned weights. Not proved: intelligent repair, correct ancestry, automatic resolution of semantic gaps, semantic 27-cell tensor, autonomous skill creation, full Iron Lung–INSPAND–CANNON integration, independent human review or real time savings.

## Next connector

A separate CANNON side may consume the held nine-step field as an **unverified proposal source**, verify its content addresses and model pin, and submit candidate plans through the existing INSPAND gates. That would not amend the original Iron Lung Heart or grant cross-repo authority.

## Bring your own source

Pass --source fixtures/triple-transfer-input-v1.json to either the fixture or FLAN provider. This JSON contains the original typed braid, rawText, and sourceRefs. You can copy and edit it; required Substance and Lineage gap addresses remain explicit, and unknown Authority is never promoted. For example: npm run --silent triple-transfer -- --provider flan --source fixtures/triple-transfer-input-v1.json --depth 3. Keep private sources local; hosted CI uses only fictional fixtures.
