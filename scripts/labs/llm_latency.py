"""
Chart: "Where an LLM call spends its time" (app/labs/charts/llm-latency).

Two steps.

1. measure (standard library only, so it runs on the Mac mini as is):
     scp scripts/labs/llm_latency.py content/blog/31-vercel-crons-solo-product.md mini:/tmp/
     ssh mini 'python3 /tmp/llm_latency.py measure --article /tmp/31-vercel-crons-solo-product.md --codex 2' > runs.jsonl

   Streams chat completions from the local Ollama (127.0.0.1:11434) and
   timestamps, on the client: the TCP connect, the request leaving, the
   response headers, every streamed chunk, and the end. Ollama's own final
   chunk adds the server's split: model load, prompt evaluation (prefill)
   and generation, in nanoseconds. Each call is written out as one JSON line
   the moment it finishes. Conditions:
     short    12 calls, a one-line question
     long     10 calls, a ~3,000-token article to summarise
     cached   5 calls of one identical long prompt after a priming call
   A call that finds the model unloaded (load_duration over 300 ms, because
   another job on the machine evicted it) is reported as a cold start.
   Every short and long prompt starts with a different request number, so
   no call can reuse another's cached prefix. The cached condition does the
   opposite on purpose.
   Optionally (--codex N, N <= 2) the same short prompt through the local
   Codex proxy on 127.0.0.1:11480, for a hosted model's network and queue.

2. summarise (on any machine):
     python3 scripts/labs/llm_latency.py summarise runs.jsonl
   writes app/labs/charts/llm-latency/data.json: per-condition medians and
   one representative run (the median by time to first token) with its
   chunk timings and text, for the replay.
"""
from __future__ import annotations

import http.client
import json
import os
import statistics
import sys
import time

# A small model, at the context size it is already served with, so these
# calls never evict another job's model from the shared Mac mini.
MODEL = "qwen3.5:2b"
OPTIONS = {"temperature": 0, "seed": 7, "num_ctx": 4096}
QUESTION = "In about 100 words, explain why streaming a language model's reply feels faster than waiting for the whole answer, even when the total time is the same."


def stream_call(host: str, port: int, path: str, body: dict, headers: dict | None = None, kind: str = "ollama") -> dict:
    t0 = time.perf_counter()
    conn = http.client.HTTPConnection(host, port, timeout=600)
    conn.connect()
    t_connect = time.perf_counter()
    payload = json.dumps(body).encode()
    conn.putrequest("POST", path)
    for k, v in {"Content-Type": "application/json", "Content-Length": str(len(payload)), **(headers or {})}.items():
        conn.putheader(k, v)
    conn.endheaders(payload)
    t_sent = time.perf_counter()
    resp = conn.getresponse()
    t_headers = time.perf_counter()
    chunks, final, buf = [], None, b""
    while True:
        part = resp.read1(65536) if hasattr(resp, "read1") else resp.read(1)
        if not part:
            break
        now = time.perf_counter()
        buf += part
        while b"\n" in buf:
            line, buf = buf.split(b"\n", 1)
            line = line.strip()
            if not line:
                continue
            if kind == "openai":
                if not line.startswith(b"data:"):
                    continue
                line = line[5:].strip()
                if line == b"[DONE]":
                    continue
                obj = json.loads(line)
                if obj.get("usage"):
                    final = obj["usage"]
                for ch in obj.get("choices", []):
                    text = (ch.get("delta") or {}).get("content")
                    if text:
                        chunks.append([round((now - t0) * 1000, 2), text])
            else:
                obj = json.loads(line)
                msg = obj.get("message") or {}
                text = msg.get("content") or msg.get("thinking")
                if text:
                    chunks.append([round((now - t0) * 1000, 2), text] + (["thinking"] if msg.get("thinking") and not msg.get("content") else []))
                if obj.get("done"):
                    final = {k: obj.get(k) for k in ("total_duration", "load_duration", "prompt_eval_count", "prompt_eval_duration", "eval_count", "eval_duration", "done_reason")}
    t_end = time.perf_counter()
    conn.close()
    ms = lambda t: round((t - t0) * 1000, 2)  # noqa: E731
    return {"connect": ms(t_connect), "sent": ms(t_sent), "headers": ms(t_headers), "end": ms(t_end), "chunks": chunks, "server": final}


def ollama(messages: list[dict], keep_alive: str = "5m") -> dict:
    return stream_call("127.0.0.1", 11434, "/api/chat", {"model": MODEL, "messages": messages, "stream": True, "think": False, "keep_alive": keep_alive, "options": OPTIONS})


def loaded() -> list[str]:
    conn = http.client.HTTPConnection("127.0.0.1", 11434, timeout=30)
    conn.request("GET", "/api/ps")
    return [m["name"] for m in json.loads(conn.getresponse().read()).get("models", [])]


def measure(article_path: str, codex: int, out) -> dict:
    article = open(article_path).read()
    if article.startswith("---"):
        article = article.split("---", 2)[2]
    long_prompt = lambda i: f"Request {i}.\n\n<article>\n{article.strip()}\n</article>\n\nSummarise this article in about 100 words."  # noqa: E731
    short_prompt = lambda i: f"Request {i}. {QUESTION}"  # noqa: E731
    head = {"measured": time.strftime("%Y-%m-%d %H:%M %Z"), "machine": machine(), "model": MODEL, "options": OPTIONS, "loadedAtStart": loaded()}
    out.write(json.dumps(head) + "\n")
    out.flush()

    def run(cond, prompt, i):
        r = ollama([{"role": "user", "content": prompt}])
        r.update(condition=cond, i=i, model=MODEL)
        out.write(json.dumps(r, ensure_ascii=False) + "\n")  # one line per call, so nothing is lost if stopped
        out.flush()
        print(f"{cond:6} {i:2} ttft={r['chunks'][0][0] if r['chunks'] else None} end={r['end']} load={(r['server'] or {}).get('load_duration')}", file=sys.stderr)
        time.sleep(2)  # leave room for the other jobs on the machine

    for i in range(1, 13):
        run("short", short_prompt(i), i)
    for i in range(1, 11):
        run("long", long_prompt(i), i)
    run("prime", long_prompt(99), 0)
    for i in range(1, 6):
        run("cached", long_prompt(99), i)
    for i in range(1, min(codex, 2) + 1):
        try:
            r = stream_call("127.0.0.1", 11480, "/v1/chat/completions", {"model": "gpt-5.6-terra", "stream": True, "stream_options": {"include_usage": True}, "messages": [{"role": "user", "content": short_prompt(100 + i)}]}, kind="openai")
            r.update(condition="hosted", i=i, model="gpt-5.6-terra via the Codex proxy")
            out.write(json.dumps(r, ensure_ascii=False) + "\n")
            out.flush()
            print(f"hosted {i} ttft={r['chunks'][0][0] if r['chunks'] else None} end={r['end']}", file=sys.stderr)
        except Exception as e:  # one try per call, never a retry loop
            print(f"hosted call {i} failed: {e}", file=sys.stderr)
    return head


def machine() -> str:
    try:
        import subprocess

        chip = subprocess.run(["sysctl", "-n", "machdep.cpu.brand_string"], capture_output=True, text=True).stdout.strip()
        mem = int(subprocess.run(["sysctl", "-n", "hw.memsize"], capture_output=True, text=True).stdout) // 2**30
        return f"Mac mini, {chip}, {mem} GB"
    except Exception:
        return "unknown"


def phases(r: dict) -> dict:
    s = r.get("server") or {}
    ttft = r["chunks"][0][0] if r["chunks"] else None
    last = r["chunks"][-1][0] if r["chunks"] else None
    load = (s.get("load_duration") or 0) / 1e6
    prefill = (s.get("prompt_eval_duration") or 0) / 1e6
    gaps = [b[0] - a[0] for a, b in zip(r["chunks"], r["chunks"][1:])]
    gen = (s.get("eval_duration") or 0) / 1e6
    # time the server held the request without working on it: waiting behind
    # another job's request for the same model, plus scheduling
    queue = max(0.0, (s.get("total_duration") or 0) / 1e6 - load - prefill - gen) if s.get("total_duration") else None
    return {
        "connect": r["connect"],
        "send": round(r["sent"] - r["connect"], 2),
        "queue": round(queue, 1) if queue is not None else None,
        "load": round(load, 1),
        "prefill": round(prefill, 1),
        "ttft": ttft,
        "other": round(max(0.0, ttft - r["sent"] - (queue or 0) - load - prefill), 1) if ttft is not None and s and "total_duration" in s else None,
        "stream": round(r["end"] - ttft, 1) if ttft is not None else None,
        "total": r["end"],
        "promptTokens": s.get("prompt_eval_count") or s.get("prompt_tokens"),
        "outputTokens": s.get("eval_count") or s.get("completion_tokens"),
        "chunks": len(r["chunks"]),
        "gap": round(statistics.median(gaps), 2) if gaps else None,
        "tps": round((len(r["chunks"]) - 1) / ((last - ttft) / 1000), 1) if last and ttft and last > ttft else None,
    }


def summarise(path: str) -> None:
    lines = [json.loads(x) for x in open(path) if x.strip()]
    raw = {**lines[0], "runs": lines[1:]}
    # a warm call that found the model unloaded (another job evicted it) is a
    # cold start, whatever condition it was meant to be
    for r in raw["runs"]:
        if r["condition"] in ("short", "long", "cached") and ((r.get("server") or {}).get("load_duration") or 0) > 300e6:
            r["condition"] = "cold"
    out = {"measured": raw["measured"], "machine": raw["machine"], "model": raw["model"], "options": raw["options"], "conditions": {}}
    for cond in ("cold", "short", "long", "cached", "hosted"):
        rs = [r for r in raw["runs"] if r["condition"] == cond and r["chunks"]]
        if not rs:
            continue
        ps = [phases(r) for r in rs]
        med = {}
        for k in ps[0]:
            vals = [p[k] for p in ps if isinstance(p[k], (int, float))]
            med[k] = round(statistics.median(vals), 2) if vals else None
        rep = sorted(rs, key=lambda r: r["chunks"][0][0])[len(rs) // 2]
        out["conditions"][cond] = {
            "n": len(rs),
            "model": rs[0].get("model"),
            "median": med,
            "min": {k: min(p[k] for p in ps if isinstance(p[k], (int, float))) for k in ("ttft", "total") if any(isinstance(p[k], (int, float)) for p in ps)},
            "max": {k: max(p[k] for p in ps if isinstance(p[k], (int, float))) for k in ("ttft", "total") if any(isinstance(p[k], (int, float)) for p in ps)},
            "example": {"phases": phases(rep), "chunks": rep["chunks"]},
        }
    dest = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../app/labs/charts/llm-latency/data.json")
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    with open(dest, "w") as f:
        json.dump(out, f, ensure_ascii=False, separators=(",", ":"))
        f.write("\n")
    for c, v in out["conditions"].items():
        print(c, v["n"], json.dumps(v["median"]))


if __name__ == "__main__":
    if sys.argv[1] == "measure":
        args = sys.argv[2:]
        art = args[args.index("--article") + 1]
        codex = int(args[args.index("--codex") + 1]) if "--codex" in args else 0
        measure(art, codex, sys.stdout)
    elif sys.argv[1] == "summarise":
        summarise(sys.argv[2])
