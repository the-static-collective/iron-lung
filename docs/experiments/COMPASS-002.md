# COMPASS-002: Actual source contracts and second-person address

Original Iron Lung branch stacked on COMPASS-001. This experiment keeps the three original Substance/Lineage/Authority phases and runs four nine-call arms using the same actual source task: neutral short dyads, second-person short dyads, neutral compiled questions, and second-person compiled questions.

The incoming CANNON task is extracted directly from its real Reflex Composer registry and Reflex Library: source capability `film-press-synthetic-selection/v1`; composed-memory output `cannon.reflex-memory/v1`; receiver `film-press-plan-shaped/v1`; typed input `planz.generated-plan/v1`; existing verified adapter `VERIFIED_RECEIPT_PLAN_ID_V1` with `reusableRecipe.planId`. Native owner receipts have a distinct output schema.

Every raw dyad prompt line has two to three words and includes `FACT sourced`, `IDEA speculative`, `RELATION typed`. The second-person variant adds `You inspect`. The compiled arms use a deterministic translation from those exact facts into narrowly directed plain-English questions. All arms use 9 calls and the same pretrained FLAN-T5 Small checkpoint. They are call-budget matched, not token-budget matched.

The target answers are exact values already present in the source contracts, so correct answers test *retrieval of explicit facts*, not invention or semantic reasoning. Metrics also count card echoing and second-person repetition. The code keeps all 36 source-linked responses unverified and refuses modification, fake grants, and source inconsistency. There is no model-generated authority, automatic capability creation, executable code acceptance, real-world consequence or release.

Run the original owner script with `npm run --silent contract-compass -- compare --provider fixture --task /path/to/cannon-derived-task.json` (or `--provider flan` after installing its original real CPU model dependencies). Verify with `npm run --silent contract-compass -- verify --file /path/to/result.json`. CANNON's cross-owner workflow supplies and validates the real task; an arbitrary locally constructed task is not automatically established as true.
