#!/usr/bin/env python3
"""Actual FLAN-T5 Small CPU provider. One process, three nested passes per breath.
It reads only local STDIN JSON messages and emits candidates, never decisions.
Install: python -m pip install -r model/requirements-triple.txt
"""
import json, sys, os
MODEL = "google/flan-t5-small"
REVISION = "14fd6edcfdd71f2ef5b67d4e735fee8bc6d9fd31"
os.environ.setdefault("HF_HUB_DISABLE_TELEMETRY", "1")
os.environ.setdefault("TOKENIZERS_PARALLELISM", "false")
try:
    import torch
    from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
    tokenizer = AutoTokenizer.from_pretrained(
        MODEL, revision=REVISION, trust_remote_code=False)
    model = AutoModelForSeq2SeqLM.from_pretrained(
        MODEL, revision=REVISION, use_safetensors=True,
        trust_remote_code=False).to("cpu").eval()
except Exception as e:
    print("HOLD_FLAN_MODEL_INIT:" + str(e)[:500], file=sys.stderr, flush=True)
    sys.exit(2)

print(json.dumps({"ready":True, "model":MODEL, "revision":REVISION,
                  "kind":"flan-t5"}), flush=True)
for line in sys.stdin:
    try:
        request = json.loads(line)
        if request.get("schema") != "iron-lung/triple-transfer-request/v1":
            raise ValueError("invalid request schema")
        prompt = request.get("text")
        if not isinstance(prompt, str) or not 0 < len(prompt) <= 4200:
            raise ValueError("input bounds")
        # Both context size and decoder budget are deliberately bounded.
        encoded = tokenizer(prompt, return_tensors="pt",
                            max_length=512, truncation=True)
        with torch.inference_mode():
            tokens = model.generate(**encoded, do_sample=False,
                                    num_beams=1, max_new_tokens=64)
        output = tokenizer.decode(tokens[0], skip_special_tokens=True).strip()
        if not output:
            output = "[no generated candidate — unresolved]"
        print(json.dumps({"candidate":output[:1200],
                          "inputSha256":request.get("inputSha256")},
                         ensure_ascii=False), flush=True)
    except Exception as exc:
        print("HOLD_FLAN_REQUEST:" + str(exc)[:450], file=sys.stderr, flush=True)
        sys.exit(3)
