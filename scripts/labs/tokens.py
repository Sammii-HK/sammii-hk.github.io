"""
Chart: "How text becomes tokens" (app/labs/charts/tokens).

Runs a handful of sentences through four real tokenisers and writes every
token (id and the exact bytes it stands for) to data.json. Nothing in the
chart is drawn from a rule of thumb: each chip is one token as the tokeniser
returned it.

  cl100k_base  tiktoken, GPT-4 and GPT-3.5 Turbo
  o200k_base   tiktoken, GPT-4o, GPT-4.1, o1, o3, o4-mini, GPT-5
  Llama 3      read from Ollama's hermes3:8b (a Llama 3.1 8B fine-tune)
  Gemma 3      SentencePiece, read from Ollama's gemma3:4b-it-qat

Usage:
  TIKTOKEN_CACHE_DIR=<dir> python3 scripts/labs/tokens.py \
      --llama <hermes3 GGUF head> --gemma <gemma3 GGUF head> [--verify http://127.0.0.1:11434]

--verify asks Ollama how many prompt tokens each sentence is for the two
local models and fails if ours differ (Ollama adds one BOS token).
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import tok  # noqa: E402

SAMPLES = [
    ("fox", "A plain sentence", "The quick brown fox jumps over the lazy dog."),
    ("strawberry", "The famous question", "How many r's are in strawberry?"),
    ("code", "A line of code", "const total = items.reduce((sum, x) => sum + x.price, 0);"),
    ("numbers", "Numbers", "Order #48213 shipped on 19/10/2026 for £1,234.56."),
    ("japanese", "Japanese", "月が綺麗ですね"),
    ("emoji", "Emoji", "🌕 Full moon in Aries ✨"),
    ("welsh", "A Welsh place name", "Llanfairpwllgwyngyll is in Anglesey."),
    ("indent", "Whitespace", "if (ready) {\n    return true;\n}"),
]
STRAWBERRY = ["strawberry", " strawberry", "Strawberry", "STRAWBERRY", "strawberries", "s t r a w b e r r y"]

# Checked with tok.verify_against_ollama() on 19 October 2026: for each of
# these, Ollama's prompt_eval_count for hermes3:8b and gemma3:4b-it-qat was
# our Llama 3 and Gemma 3 count plus one BOS token. Re-run with --verify to
# check every sentence (it loads both models, so mind other jobs on the box).
CHECKED_2026_10_19 = [
    "The quick brown fox jumps over the lazy dog.", "How many r's are in strawberry?",
    "const total = items.reduce((sum, x) => sum + x.price, 0);", "Order #48213 shipped on 19/10/2026 for £1,234.56.",
    "月が綺麗ですね", "🌕 Full moon in Aries ✨", "strawberry", "STRAWBERRY", "s t r a w b e r r y", "line one\n\n    indented   line",
]

TOKENIZERS = [
    {"id": "cl100k", "name": "cl100k_base", "who": "GPT-4, GPT-3.5 Turbo"},
    {"id": "o200k", "name": "o200k_base", "who": "GPT-4o, GPT-4.1, o3, GPT-5"},
    {"id": "llama3", "name": "Llama 3", "who": "Llama 3 and 3.1, read from Hermes 3 8B"},
    {"id": "gemma3", "name": "Gemma 3", "who": "Gemma 3, SentencePiece"},
]


def pieces(kind: str, text: str, llama: str, gemma: str):
    if kind in ("cl100k", "o200k"):
        e = tok.openai(f"{kind}_base")
        ids = e.encode_ordinary(text)
        raw = [e.decode_single_token_bytes(i) for i in ids]
    elif kind == "llama3":
        e = tok.llama3(llama)
        ids = e.encode_ordinary(text)
        raw = [e.decode_single_token_bytes(i) for i in ids]
    else:
        e = tok.gemma3(gemma)
        ids = e.encode(text)
        raw = [e.piece_bytes(i) for i in ids]
    out = []
    for i, b in zip(ids, raw):
        try:
            out.append([i, b.decode("utf-8")])
        except UnicodeDecodeError:
            # a token that is only part of a character: keep its bytes as hex
            out.append([i, None, b.hex(" ").upper()])
    assert b"".join(raw) == text.encode("utf-8"), (kind, text)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--llama", required=True)
    ap.add_argument("--gemma", required=True)
    ap.add_argument("--verify")
    a = ap.parse_args()
    kinds = [t["id"] for t in TOKENIZERS]
    vocab = {"cl100k": tok.openai("cl100k_base").n_vocab, "o200k": tok.openai("o200k_base").n_vocab, "llama3": 128256, "gemma3": len(tok.gemma3(a.gemma).pieces)}
    for t in TOKENIZERS:
        t["vocab"] = vocab[t["id"]]
    data = {
        "generated": dt.date.today().isoformat(),
        "tokenizers": TOKENIZERS,
        "samples": [{"id": sid, "label": label, "text": text, "tokens": {k: pieces(k, text, a.llama, a.gemma) for k in kinds}} for sid, label, text in SAMPLES],
        "strawberry": [{"text": text, "tokens": {k: pieces(k, text, a.llama, a.gemma) for k in kinds}} for text in STRAWBERRY],
    }
    data["verified"] = {"date": "2026-10-19", "sentences": CHECKED_2026_10_19, "against": "Ollama prompt_eval_count for hermes3:8b and gemma3:4b-it-qat, raw prompts, plus one BOS token"}
    if a.verify:
        texts = [s[2] for s in SAMPLES] + STRAWBERRY
        rows = tok.verify_against_ollama(a.verify, a.llama, a.gemma, texts)
        bad = [r for r in rows if r["llama3"][1] != r["llama3"][0] + 1 or r["gemma3"][1] != r["gemma3"][0] + 1]
        for r in rows:
            print(json.dumps(r, ensure_ascii=False), file=sys.stderr)
        if bad:
            sys.exit(f"{len(bad)} sentences disagree with Ollama")
        data["verified"] = {"date": dt.date.today().isoformat(), "sentences": texts, "against": "Ollama prompt_eval_count for hermes3:8b and gemma3:4b-it-qat, raw prompts, plus one BOS token"}
    dest = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../app/labs/charts/tokens/data.json")
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    with open(dest, "w") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
        f.write("\n")
    for s in data["samples"] + data["strawberry"]:
        print(repr(s["text"]), {k: len(v) for k, v in s["tokens"].items()})


if __name__ == "__main__":
    main()
