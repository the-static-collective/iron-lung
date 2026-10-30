# Q-CYCLE-001 — Original National Treasure questions enter Iron Lung

The original Iron Lung engine now consumes a **genuine, unchanged `national-treasure.question-receipt/v0`** question rather than treating a model's guess as evidence. Source commits and provenance are independently checked by the CANNON research-cycle runner before this source-owning module receives the receipt.

## Exactly nine unverified possibilities per question

The module `src/nt-investigation.ts` accepts a bounded `iron-lung/national-treasure-question-seed/v1`, containing the exact original National Treasure question digest and an explicit provenance case.

- `REAL_REGISTERED_ADAPTER`: the original National Treasure question must concern chronology and have a recoverable original CANNON source.
- `SYNTHETIC_ADAPTER_DISABLED`: the original question must concern missing source object, retain provenance speculation/support unsupported, and contain **no fabricated source locator**.

Every prompt is a short, meaning-bearing **2–3-word-per-line** card derived from the original question and clue, including preceding responses. The same original Substance → Lineage → Authority requirements phases repeat three times. Each step carries the original source digest, parent step, model identity, actual response and held status. The original Google `google/flan-t5-small` provider is reused unchanged; no fake inference, new model or independent source fork is introduced.

The output `iron-lung/question-investigation/v1` is **nine speculations, not nine answers**. The model cannot grant authority, forge a dated source, establish ancestry, execute software, choose a recipe, or trigger a follow-up question.

## Reproducibility

```bash
npm run --silent nt-investigation -- explore --provider fixture --seed source-verified-question.json > output.json
npm run --silent nt-investigation -- verify --file output.json
```

Use `--provider flan` after installing original CPU PyTorch and original `model/requirements-triple.txt` to run the actual pretrained model. Hosted CANNON INSPAND-012 obtains the question from the **original National Treasure** engine, not from a synthetic placeholder, and checks original Iron Lung source Git locks before actual model inference.

The bounded source-owner tests enforce: exactly nine parent-linked phases, deterministic fixtures, all prompt lines 2–3 words, real source/counterfactual distinction, refused fake admission, unchanged question receipts and hashed model fields.

There is no autonomous selection, execution or learning in this original Iron Lung module. The successor National Treasure question is produced by National Treasure again using **original code and independently verified new evidence**, not by Iron Lung-generated text.
