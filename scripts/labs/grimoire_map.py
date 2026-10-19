"""
Chart: "Lunary's grimoire, mapped by meaning" (app/labs/charts/grimoire-map).

No database. Everything is read from the lunary repository at origin/main
with `git show`, so a local branch or uncommitted edit cannot leak in, and
Lunary's production database is never touched.

1. The article list is Lunary's own grimoire search index
   (src/constants/seo/grimoire-search-index.json): slug, title, category,
   keywords, summary for every grimoire page.
2. Each article's text is its title, summary (when it is not the generic
   "Explore X in the Lunary Grimoire.") and keywords, plus the article's body
   fields wherever the repo holds them as data: crystals, spells, tarot
   cards, runes, angel numbers, life path numbers, chakras and
   correspondences. Pages the app generates from templates (the monthly
   horoscopes above all) have only their title and keywords to go on.
3. Embeddings come from qwen3-embedding:0.6b on the Mac mini's Ollama
   (1,024 dimensions), reached over an SSH tunnel:
       ssh -N -L 11435:127.0.0.1:11434 mini
4. The vectors are L2-normalised, reduced to 50 dimensions with PCA, and laid
   out in 2D with exact t-SNE (perplexity 30, PCA initialisation, fixed seed),
   implemented below in NumPy after van der Maaten and Hinton (2008).
5. Nearest neighbours (ten for obsidian, five for every other article) are
   computed in the full 1,024-dimensional space by cosine similarity, not
   read off the 2D picture.

Usage:
  python3 scripts/labs/grimoire_map.py --ollama http://127.0.0.1:11435
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import re
import subprocess
import sys
import time
import urllib.request

import numpy as np

LUNARY = os.path.expanduser("~/development/lunary")
REF = "origin/main"
MODEL = "qwen3-embedding:0.6b"
FOCUS = "crystals/obsidian"


def show(path: str):
    return json.loads(subprocess.run(["git", "-C", LUNARY, "show", f"{REF}:{path}"], capture_output=True, check=True).stdout)


def slugify(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def flat(v) -> str:
    if isinstance(v, dict):
        return "; ".join(f"{k}: {flat(x)}" for k, x in v.items())
    if isinstance(v, list):
        return ", ".join(flat(x) for x in v)
    return str(v)


def bodies() -> dict[str, str]:
    """slug -> body text, for the sections the repo holds as data."""
    out = {}
    for c in show("src/data/crystals.json"):
        out[f"crystals/{c['id']}"] = " ".join(flat(c.get(k, "")) for k in ("description", "metaphysicalProperties", "properties", "intentions", "chakras", "zodiacSigns", "planets", "elements", "colors", "physicalProperties", "historicalUse"))
    for s in show("src/data/spells.json"):
        out[f"spells/{s['id']}"] = " ".join(flat(s.get(k, "")) for k in ("description", "purpose", "category", "type", "ingredients", "history"))
    tarot = show("src/data/tarot-cards.json")
    for group in (tarot["majorArcana"], *tarot["minorArcana"].values()):
        for card in group.values():
            out[f"tarot/{slugify(card['name'])}"] = " ".join(flat(card.get(k, "")) for k in ("keywords", "information", "uprightMeaning", "symbolism"))
    for k, r in show("src/data/runes.json").items():
        out[f"runes/{k}"] = " ".join(flat(r.get(f, "")) for f in ("meaning", "keywords", "magicalProperties", "uprightMeaning"))
    for n, a in show("src/data/angel-numbers.json")["numbers"].items():
        out[f"angel-numbers/{n}"] = " ".join(flat(a.get(f, "")) for f in ("coreMeaning", "keywords", "quickMeaning", "description"))
    for n, lp in show("src/data/numerology.json")["lifePathNumbers"].items():
        out[f"life-path/{n}"] = " ".join(flat(lp.get(f, "")) for f in ("meaning", "description", "traits", "strengths"))
    for k, ch in show("src/data/chakras.json").items():
        out[f"chakras/{k}"] = " ".join(flat(ch.get(f, "")) for f in ("location", "color", "element", "keywords", "properties", "mysticalProperties"))
    for group, items in show("src/data/correspondences.json").items():
        for name, item in items.items():
            out[f"correspondences/{group}/{slugify(name)}"] = flat(item)
    return out


def articles():
    index = show("src/constants/seo/grimoire-search-index.json")
    body = bodies()
    rows, matched = [], 0
    for a in index:
        parts = [a["title"] + "."]
        if not a["summary"].startswith("Explore "):
            parts.append(a["summary"])
        if a["slug"] in body:
            parts.append(body[a["slug"]])
            matched += 1
        parts.append("Keywords: " + ", ".join(a["keywords"]) + ".")
        rows.append({"slug": a["slug"], "title": a["title"], "category": a["category"], "text": " ".join(parts)[:4000], "body": a["slug"] in body})
    print(f"{len(rows)} articles, {matched} with a body from the repo's data", file=sys.stderr)
    return rows


def embed(host: str, texts: list[str], batch: int = 32) -> np.ndarray:
    vecs = []
    for i in range(0, len(texts), batch):
        req = urllib.request.Request(f"{host}/api/embed", data=json.dumps({"model": MODEL, "input": texts[i : i + batch], "keep_alive": "2m"}).encode(), headers={"Content-Type": "application/json"})
        vecs.extend(json.load(urllib.request.urlopen(req, timeout=600))["embeddings"])
        print(f"  embedded {min(i + batch, len(texts))}/{len(texts)}", file=sys.stderr)
    return np.asarray(vecs, dtype=np.float64)


# ── t-SNE (exact), after van der Maaten and Hinton 2008 ────────────────────
def _p_conditional(D: np.ndarray, perplexity: float) -> np.ndarray:
    n = D.shape[0]
    P = np.zeros((n, n))
    target = np.log(perplexity)
    for i in range(n):
        lo, hi, beta = 0.0, np.inf, 1.0
        d = np.delete(D[i], i)
        for _ in range(64):
            p = np.exp(-(d - d.min()) * beta)
            s = p.sum()
            H = np.log(s) + beta * np.sum((d - d.min()) * p) / s
            if abs(H - target) < 1e-5:
                break
            if H > target:
                lo = beta
                beta = beta * 2 if hi == np.inf else (beta + hi) / 2
            else:
                hi = beta
                beta = (beta + lo) / 2
        P[i, np.arange(n) != i] = p / s
    return P


def tsne(X: np.ndarray, perplexity: float = 30, iters: int = 1000, seed: int = 42) -> np.ndarray:
    rng = np.random.default_rng(seed)
    n = X.shape[0]
    sq = np.sum(X * X, 1)
    D = np.maximum(sq[:, None] + sq[None, :] - 2 * X @ X.T, 0)
    P = _p_conditional(D, perplexity)
    P = (P + P.T) / (2 * n)
    P = np.maximum(P, 1e-12)
    Xc = X - X.mean(0)
    U, S, _ = np.linalg.svd(Xc, full_matrices=False)
    Y = U[:, :2] * S[:2]
    Y = Y / Y[:, 0].std() * 1e-4 + rng.normal(0, 1e-6, Y.shape)
    lr = max(n / 12, 50)  # Belkina et al. 2019: n / early exaggeration
    V, gains = np.zeros_like(Y), np.ones_like(Y)
    for it in range(iters):
        exag = 12.0 if it < 250 else 1.0
        mom = 0.5 if it < 250 else 0.8
        sy = np.sum(Y * Y, 1)
        num = 1 / (1 + np.maximum(sy[:, None] + sy[None, :] - 2 * Y @ Y.T, 0))
        np.fill_diagonal(num, 0)
        Q = np.maximum(num / num.sum(), 1e-12)
        PQ = (exag * P - Q) * num
        grad = 4 * (np.diag(PQ.sum(1)) - PQ) @ Y
        gains = np.where(np.sign(grad) != np.sign(V), gains + 0.2, gains * 0.8).clip(0.01)
        V = mom * V - lr * gains * grad
        Y = Y + V
        Y -= Y.mean(0)
        if it % 100 == 0 or it == iters - 1:
            kl = np.sum(P * np.log(P / Q))
            print(f"  t-SNE {it:4d} KL {kl:.3f}", file=sys.stderr)
    return Y


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--ollama", default="http://127.0.0.1:11435")
    ap.add_argument("--cache", default=os.path.join(os.environ.get("TMPDIR", "/tmp"), "grimoire-embeddings.npy"))
    a = ap.parse_args()
    rows = articles()
    t0 = time.time()
    if os.path.exists(a.cache) and np.load(a.cache).shape[0] == len(rows):
        E = np.load(a.cache)
    else:
        E = embed(a.ollama, [r["text"] for r in rows])
        np.save(a.cache, E)
    print(f"embeddings {E.shape} in {time.time() - t0:.0f}s", file=sys.stderr)
    E = E / np.linalg.norm(E, axis=1, keepdims=True)

    fi = next(i for i, r in enumerate(rows) if r["slug"] == FOCUS)
    sims = E @ E[fi]
    order = [int(i) for i in np.argsort(-sims) if i != fi][:10]
    neighbours = [{"slug": rows[i]["slug"], "title": rows[i]["title"], "category": rows[i]["category"], "cosine": round(float(sims[i]), 3)} for i in order]
    for nb in neighbours:
        print("  near obsidian:", nb, file=sys.stderr)

    # every article's five nearest, so any point can show its real neighbours
    S = E @ E.T
    np.fill_diagonal(S, -1)
    near5 = np.argsort(-S, axis=1)[:, :5]

    Ec = E - E.mean(0)
    U, S, _ = np.linalg.svd(Ec, full_matrices=False)
    X50 = U[:, :50] * S[:50]
    Y = tsne(X50)
    Y = (Y - Y.min(0)) / (Y.max(0) - Y.min(0)).max() * 1000

    cats = sorted({r["category"] for r in rows}, key=lambda c: -sum(1 for r in rows if r["category"] == c))
    data = {
        "generated": dt.date.today().isoformat(),
        "source": f"lunary {REF}, src/constants/seo/grimoire-search-index.json",
        "model": MODEL,
        "dims": int(E.shape[1]),
        "method": "PCA to 50 dimensions, then exact t-SNE (perplexity 30, 1,000 iterations, PCA initialisation, seed 42)",
        "n": len(rows),
        "withBody": sum(1 for r in rows if r["body"]),
        "categories": cats,
        "focus": FOCUS,
        "neighbours": neighbours,
        "points": [[r["slug"], r["title"], cats.index(r["category"]), round(float(x), 1), round(float(y), 1), 1 if r["body"] else 0, [int(j) for j in near5[i]]] for i, (r, (x, y)) in enumerate(zip(rows, Y))],
    }
    dest = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../app/labs/charts/grimoire-map/data.json")
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    with open(dest, "w") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
        f.write("\n")
    print(f"wrote {dest}", file=sys.stderr)


if __name__ == "__main__":
    main()
