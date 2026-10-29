# COMPASS-001 — a two-word-per-line directional question grammar

**Status:** original-source executable experiment; review-only. Stacked on T5-TRIPLE-001 draft #8. FLAN-T5 is the existing independently pinned original model, not a new model or a new source of authority.

## User question

Could breaking source questions into dyads/triads, structured like a tiny "golden compass" card, make the same small language model produce more specific candidate connections than long prose?

The new Iron Lung `dyadCard` creates source-owned *actual* model input cards with **every nonempty line containing exactly two or three whitespace-delimited words**. At least the first three lines deliberately triangulate:

```text
FACT stated
IDEA speculative
RELATION unverified
```

The source is a reported signal, not verified truth. "FACT" is a compass direction, not a promotion to evidence. More lines follow in the same strict dyad format for source tokens, previous-generation tokens, stage, microquestion focus and bounded question. Nothing in the card authorizes a Heart beat or modifies the original braid. The prompt includes only the first 32 source words and 18 previous words, always explicitly lossy; the full source and its hash survive in the retained packet.

## Three controlled arms

`npm run compass-lab -- compare --provider fixture --source fixtures/triple-transfer-input-v1.json`

**Arm A:** prior original `circulateTripleTransfer` 3 breaths × 3 phases = 9 full-prose model requests.

**Arm B:** new **9 equal-budget dyad cards**, 3 breaths × 3 phases, each request includes all FACT/IDEA/RELATION bearings, previous model output, and one precise question.

**Arm C:** new **27 microquestion cards**, same 3 breaths × 3 phases × three distinct FACT / IDEA / RELATION focused microquestions, with each generated response fed into the next card. This arm uses triple the inference-call budget, so improvement cannot be credited to prompt formatting alone.

All three arms run on the same original source, identical braid, identical pretrained model revision, same greedy decoding and no injected permission. Each card, source, response and parent link is content-addressed; `inspectCompass` recomputes the exact expected card from the source and previous response, checks line counts, provenance and hash. Verification never treats text as evidence, history, rights, or consent.

With actual weights: `npm run compass-lab -- compare --provider flan --source fixtures/triple-transfer-input-v1.json > /tmp/compass-real.json`. Offline inspection: `npm run compass-lab -- verify --file /tmp/compass-real.json`. The hosted workflow has real CPU FLAN-T5 and a separate deterministic fixture job.

## Evaluation

Compare arms A and B fairly first: identical **9 requests** and source; metric changes alone do not establish improved hypothesis quality. C is exploratory, not a fair equal-budget claim. A downstream CANNON experiment must explicitly record response echoes, executable interface proposals, false premises and unanswered questions; ideally independent blind evaluation against frozen typed contracts. The tiny pretrained model may fail both methods. Preserve negative results.

Not implemented: magical semantic truth, human intention reading, automatic synthesis of valid adapters, autonomous capability creation, actual authority, publishing, physical actions or real-world outcomes.
