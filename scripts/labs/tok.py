"""
Tokenisers for the Labs AI charts, all run offline.

- cl100k_base and o200k_base: OpenAI's own tiktoken library. tiktoken
  downloads its BPE files on first use; to run offline, point
  TIKTOKEN_CACHE_DIR at a folder holding the two files (see README). The
  loader checks each file's SHA-256 against the hash pinned inside tiktoken,
  so a wrong file fails loudly rather than giving wrong counts.
- Llama 3: the 128,000 ordinary tokens read out of a local Llama 3.1 GGUF
  (Ollama's hermes3:8b, a Llama 3.1 8B fine-tune) and run through tiktoken
  with Meta's published split pattern. Llama 3's tokenizer is a tiktoken BPE
  whose ranks are its token ids, so this is the same algorithm, not a copy.
- Gemma 3: the SentencePiece vocabulary (262,208 pieces with scores) read
  out of Ollama's gemma3:4b-it-qat GGUF, tokenised with SentencePiece's
  score-ordered BPE merge and byte fallback, as llama.cpp does.

The two GGUF-derived tokenisers are checked against the model itself in
`verify_against_ollama()`: the number of prompt tokens Ollama reports for a
raw prompt must equal ours (plus the BOS token).
"""
from __future__ import annotations

import heapq
import json
import os
import struct
import urllib.request
from functools import lru_cache

import tiktoken

HERE = os.path.dirname(os.path.abspath(__file__))

# ── GGUF metadata ────────────────────────────────────────────────────────────
_T = {0: "B", 1: "b", 2: "H", 3: "h", 4: "I", 5: "i", 6: "f", 7: "?", 10: "Q", 11: "q", 12: "d"}


def read_gguf_meta(path: str) -> dict:
    """The key/value header of a GGUF file. Only the header is read, so the
    first ~40 MB of a model file is enough (`head -c 40000000 blob`)."""
    f = open(path, "rb")

    def rd(fmt):
        size = struct.calcsize("<" + fmt)
        return struct.unpack("<" + fmt, f.read(size))[0]

    def rstr():
        return f.read(rd("Q")).decode("utf-8", errors="surrogateescape")

    def rval(t):
        if t == 8:
            return rstr()
        if t == 9:
            at, n = rd("I"), rd("Q")
            if at in _T:
                fmt = _T[at]
                return list(struct.unpack("<" + fmt * n, f.read(struct.calcsize(fmt) * n)))
            return [rval(at) for _ in range(n)]
        return rd(_T[t])

    assert f.read(4) == b"GGUF", "not a GGUF file"
    rd("I")  # version
    rd("Q")  # tensor count
    meta = {}
    for _ in range(rd("Q")):
        k = rstr()
        meta[k] = rval(rd("I"))
    return meta


# ── tiktoken (cl100k_base, o200k_base) ───────────────────────────────────────
@lru_cache(None)
def openai(name: str) -> tiktoken.Encoding:
    return tiktoken.get_encoding(name)


# ── Llama 3 ──────────────────────────────────────────────────────────────────
# Meta's split pattern from llama3/tokenizer.py
LLAMA3_PAT = r"""(?i:'s|'t|'re|'ve|'m|'ll|'d)|[^\r\n\p{L}\p{N}]?\p{L}+|\p{N}{1,3}| ?[^\s\p{L}\p{N}]+[\r\n]*|\s*[\r\n]+|\s+(?!\S)|\s+"""


def _gpt2_byte_decoder() -> dict[str, int]:
    bs = list(range(ord("!"), ord("~") + 1)) + list(range(ord("¡"), ord("¬") + 1)) + list(range(ord("®"), ord("ÿ") + 1))
    cs = bs[:]
    n = 0
    for b in range(256):
        if b not in bs:
            bs.append(b)
            cs.append(256 + n)
            n += 1
    return {chr(c): b for b, c in zip(bs, cs)}


@lru_cache(None)
def llama3(gguf_head: str) -> tiktoken.Encoding:
    meta = read_gguf_meta(gguf_head)
    toks = meta["tokenizer.ggml.tokens"]
    dec = _gpt2_byte_decoder()
    ranks = {bytes(dec[ch] for ch in toks[i]): i for i in range(128000)}
    return tiktoken.Encoding(name="llama3", pat_str=LLAMA3_PAT, mergeable_ranks=ranks, special_tokens={})


# ── Gemma 3 (SentencePiece BPE) ──────────────────────────────────────────────
class SentencePiece:
    """Score-ordered BPE over UTF-8 characters with byte fallback, the
    algorithm of SentencePiece's BPE model as implemented in llama.cpp
    (llm_tokenizer_spm). User-defined pieces (runs of newlines and spaces,
    a few HTML tags) are split out first, longest match wins."""

    def __init__(self, gguf_head: str):
        meta = read_gguf_meta(gguf_head)
        self.pieces = meta["tokenizer.ggml.tokens"]
        self.scores = meta["tokenizer.ggml.scores"]
        types = meta["tokenizer.ggml.token_type"]
        self.add_space_prefix = bool(meta.get("tokenizer.ggml.add_space_prefix", True))
        self.index = {p: i for i, p in enumerate(self.pieces) if types[i] in (1, 4)}
        self.user = sorted({p for i, p in enumerate(self.pieces) if types[i] == 4}, key=len, reverse=True)
        self.byte = {int(p[3:5], 16): i for i, p in enumerate(self.pieces) if types[i] == 6}

    def _split_user(self, text: str):
        out, i, buf = [], 0, []
        while i < len(text):
            hit = next((u for u in self.user if text.startswith(u, i)), None)
            if hit:
                if buf:
                    out.append(("".join(buf), False))
                    buf = []
                out.append((hit, True))
                i += len(hit)
            else:
                buf.append(text[i])
                i += 1
        if buf:
            out.append(("".join(buf), False))
        return out

    def _bpe(self, text: str) -> list[int]:
        text = text.replace(" ", "▁")
        sym = list(text)
        prev = list(range(-1, len(sym) - 1))
        nxt = list(range(1, len(sym) + 1))
        nxt[-1] = -1
        alive = [True] * len(sym)
        heap = []

        def push(l):
            r = nxt[l]
            if r == -1:
                return
            s = sym[l] + sym[r]
            i = self.index.get(s)
            if i is not None:
                heapq.heappush(heap, (-self.scores[i], l, s))

        for l in range(len(sym) - 1):
            push(l)
        while heap:
            _, l, s = heapq.heappop(heap)
            r = nxt[l] if alive[l] else -1
            if r == -1 or not alive[r] or sym[l] + sym[r] != s:
                continue
            sym[l] = s
            alive[r] = False
            nxt[l] = nxt[r]
            if nxt[r] != -1:
                prev[nxt[r]] = l
            if prev[l] != -1:
                push(prev[l])
            push(l)
        ids = []
        k = 0
        while k != -1:
            if alive[k]:
                i = self.index.get(sym[k])
                if i is not None:
                    ids.append(i)
                else:
                    ids.extend(self.byte[b] for b in sym[k].encode("utf-8"))
            k = nxt[k]
        return ids

    def encode(self, text: str) -> list[int]:
        if self.add_space_prefix:
            text = " " + text
        ids = []
        for frag, is_user in self._split_user(text):
            ids.extend([self.index[frag]] if is_user else self._bpe(frag))
        return ids

    def piece_bytes(self, i: int) -> bytes:
        p = self.pieces[i]
        if p.startswith("<0x") and len(p) == 6:
            return bytes([int(p[3:5], 16)])
        return p.replace("▁", " ").encode("utf-8")


@lru_cache(None)
def gemma3(gguf_head: str) -> SentencePiece:
    return SentencePiece(gguf_head)


# ── verification against the models themselves ──────────────────────────────
def ollama_prompt_tokens(host: str, model: str, text: str) -> int:
    """Prompt tokens Ollama evaluates for a raw prompt (no chat template).
    keep_alive 0 unloads after each call, so no cached prefix is reused."""
    body = json.dumps({"model": model, "prompt": text, "raw": True, "stream": False, "keep_alive": 0, "options": {"num_predict": 1, "temperature": 0}}).encode()
    req = urllib.request.Request(f"{host}/api/generate", data=body, headers={"Content-Type": "application/json"})
    return json.load(urllib.request.urlopen(req, timeout=300))["prompt_eval_count"]


def verify_against_ollama(host: str, llama_head: str, gemma_head: str, texts: list[str]) -> list[dict]:
    rows = []
    for t in texts:
        ours_l = len(llama3(llama_head).encode(t))
        ours_g = len(gemma3(gemma_head).encode(t))
        theirs_l = ollama_prompt_tokens(host, "hermes3:8b", t)
        theirs_g = ollama_prompt_tokens(host, "gemma3:4b-it-qat", t)
        rows.append({"text": t, "llama3": [ours_l, theirs_l], "gemma3": [ours_g, theirs_g]})
    return rows
