"""
Chart: "A context window, to scale" (app/labs/charts/context-window).

Counts the tokens in four of my repositories and in my published blog posts
with OpenAI's tiktoken (o200k_base, the GPT-4o and o-series encoding, and
cl100k_base, the GPT-4 and GPT-3.5 encoding), and writes ONLY aggregate
numbers to data.json. No file names, paths or code leave this script.

What is counted: every file tracked by git at the tip of each repo's default
branch (origin/HEAD), read straight from the object store so local edits and
untracked files do not count. Skipped: dependency and build folders, lock
files, minified bundles and source maps, images (SVG included), fonts, audio,
video, archives, and anything with a NUL byte (binary).

Usage:
  TIKTOKEN_CACHE_DIR=<dir> python3 scripts/labs/context_window.py
"""
from __future__ import annotations

import datetime as dt
import json
import os
import re
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import tok  # noqa: E402

DEV = os.path.expanduser("~/development")
REPOS = [
    ("quickcut", "postready", "PostReady", "An iOS video app and its Mac companion, in Swift"),
    ("sammii-hk.github.io", "sammii-dev", "sammii.dev", "This site: Next.js, the blog and Labs"),
    ("spellcast", "spellcast", "Spellcast", "My content pipeline: a Next.js app, workers and MCP servers"),
    ("lunary", "lunary", "Lunary", "My astrology app: Next.js, the grimoire, the iOS app"),
]
SKIP_DIRS = {"__pycache__", "node_modules", ".next", "out", "dist", "build", ".build", "coverage", ".vercel", ".turbo", "DerivedData", "Pods", "vendor", ".yarn", "__snapshots__", ".expo", ".swiftpm"}
LOCKFILES = {"yarn.lock", "package-lock.json", "pnpm-lock.yaml", "bun.lockb", "bun.lock", "Podfile.lock", "Package.resolved", "Cargo.lock", "poetry.lock", "Gemfile.lock", "composer.lock", "uv.lock"}
BINARY_EXT = {"png", "jpg", "jpeg", "gif", "webp", "avif", "ico", "icns", "bmp", "tif", "tiff", "heic", "svg", "psd", "ai", "sketch", "fig", "mp4", "mov", "webm", "m4v", "mp3", "wav", "m4a", "aac", "ogg", "flac", "caf", "ttf", "otf", "woff", "woff2", "eot", "pdf", "zip", "gz", "tgz", "tar", "7z", "rar", "dmg", "bin", "onnx", "mlmodel", "mlpackage", "tflite", "task", "pt", "safetensors", "gguf", "sqlite", "db", "car", "a", "o", "dylib", "so", "jar", "class", "wasm", "riv", "lottie", "glb", "gltf", "usdz", "exr", "hdr", "ktx2"}
CODE_EXT = {"ts", "tsx", "js", "jsx", "mjs", "cjs", "swift", "py", "sh", "zsh", "css", "scss", "html", "sql", "metal", "go", "rs", "kt", "java", "rb", "php", "c", "h", "m", "mm", "cpp", "hpp", "vue", "svelte", "astro", "graphql", "prisma", "glsl", "frag", "vert", "wgsl", "toml", "yml", "yaml", "plist", "xcconfig", "pbxproj", "entitlements", "storyboard", "xib", "Dockerfile", "makefile"}
# generated artefacts count as build output: migration-tool schema snapshots,
# files named as generated, and backups left next to the original
GENERATED = re.compile(r"(^|/)(generated[^/]*|[^/]*[._-]generated[^/]*|meta/\d+_snapshot\.json)$", re.I)
BACKUP = re.compile(r"\.(bak|orig|old|pre-[\w-]+)$|\.bak-", re.I)
WORDS = {"page": 250, "short_story": 7500, "novel": 40000}


def git(repo: str, *args: str, input: bytes | None = None) -> bytes:
    return subprocess.run(["git", "-C", repo, *args], input=input, capture_output=True, check=True).stdout


def tracked_blobs(repo: str, ref: str):
    out = git(repo, "ls-tree", "-r", "-z", ref)
    for rec in out.split(b"\0"):
        if not rec:
            continue
        meta, path = rec.split(b"\t", 1)
        mode, kind, sha = meta.split()
        if kind == b"blob" and mode != b"120000":
            yield path.decode("utf-8", "replace"), sha.decode()


def read_blobs(repo: str, shas: list[str]) -> list[bytes]:
    out = git(repo, "cat-file", "--batch", input=("\n".join(shas) + "\n").encode())
    blobs, i = [], 0
    for _ in shas:
        nl = out.index(b"\n", i)
        size = int(out[i:nl].split()[2])
        blobs.append(out[nl + 1 : nl + 1 + size])
        i = nl + 1 + size + 1
    return blobs


def kind_of(path: str) -> str | None:
    parts = path.split("/")
    name = parts[-1]
    if any(p in SKIP_DIRS for p in parts[:-1]) or name in LOCKFILES:
        return None
    if name.endswith((".min.js", ".min.css", ".map")) or GENERATED.search(path) or BACKUP.search(name):
        return None
    ext = name.rsplit(".", 1)[-1].lower() if "." in name else name
    if ext in BINARY_EXT:
        return None
    return "code" if ext in CODE_EXT or name in CODE_EXT else "other"


def count_repo(slug: str):
    repo = os.path.join(DEV, slug)
    ref = git(repo, "symbolic-ref", "-q", "--short", "refs/remotes/origin/HEAD").decode().strip() or "HEAD"
    entries = [(p, s, kind_of(p)) for p, s in tracked_blobs(repo, ref)]
    entries = [e for e in entries if e[2]]
    blobs = read_blobs(repo, [s for _, s, _ in entries])
    texts = {"code": [], "other": []}
    files = {"code": 0, "other": 0}
    nbytes = 0
    for (_, _, k), b in zip(entries, blobs):
        if b"\0" in b[:8000] or encoded_blob(b):
            continue
        files[k] += 1
        nbytes += len(b)
        texts[k].append(b.decode("utf-8", "replace"))
    res = {"files": files["code"] + files["other"], "codeFiles": files["code"], "bytes": nbytes}
    for enc in ("o200k_base", "cl100k_base"):
        e = tok.openai(enc)
        per = {k: sum(len(x) for x in e.encode_ordinary_batch(v, num_threads=8)) for k, v in texts.items()}
        res[enc] = {"total": per["code"] + per["other"], "code": per["code"], "other": per["other"]}
    return ref, res


def encoded_blob(b: bytes) -> bool:
    """Minified or base64 text: big, with very long lines and almost no
    whitespace. That is a binary or a build product wearing a text extension."""
    if len(b) < 50_000:
        return False
    longest = max(len(line) for line in b.split(b"\n"))
    ws = sum(b.count(c) for c in (b" ", b"\n", b"\t")) / len(b)
    return longest > 5_000 and ws < 0.05


FRONTMATTER = re.compile(r"^---\n.*?\n---\n", re.S)
FENCE = re.compile(r"```.*?```", re.S)
WORD = re.compile(r"[A-Za-z0-9][A-Za-z0-9'’\-]*")


def count_blog():
    repo = os.path.join(DEV, "sammii-hk.github.io")
    ref = git(repo, "symbolic-ref", "-q", "--short", "refs/remotes/origin/HEAD").decode().strip()
    posts = [(p, s) for p, s in tracked_blobs(repo, ref) if p.startswith("content/blog/") and p.endswith((".md", ".mdx"))]
    blobs = read_blobs(repo, [s for _, s in posts])
    bodies = []
    for b in blobs:
        t = b.decode("utf-8")
        fm = FRONTMATTER.match(t)
        if fm and re.search(r"^draft:\s*true\s*$", fm.group(0), re.M):
            continue
        bodies.append(t[fm.end():] if fm else t)
    e = tok.openai("o200k_base")
    per_post = sorted(len(x) for x in e.encode_ordinary_batch(bodies, num_threads=8))
    prose = [FENCE.sub(" ", b) for b in bodies]
    words = sum(len(WORD.findall(p)) for p in prose)
    prose_tokens = sum(len(x) for x in e.encode_ordinary_batch(prose, num_threads=8))
    c100 = tok.openai("cl100k_base")
    return {
        "posts": len(bodies),
        "o200k_base": sum(per_post),
        "cl100k_base": sum(len(x) for x in c100.encode_ordinary_batch(bodies, num_threads=8)),
        "medianPost": per_post[len(per_post) // 2],
        "proseWords": words,
        "proseTokens": prose_tokens,
        "tokensPerWord": round(prose_tokens / words, 3),
    }


def main():
    out_path = os.path.join(os.path.dirname(__file__), "../../app/labs/charts/context-window/data.json")
    blog = count_blog()
    tpw = blog["tokensPerWord"]
    repos = []
    for slug, rid, name, what in REPOS:
        ref, r = count_repo(slug)
        print(f"{name:22} {ref:40} files={r['files']:5} o200k={r['o200k_base']['total']:>10,} cl100k={r['cl100k_base']['total']:>10,}", file=sys.stderr)
        repos.append({"id": rid, "name": name, "what": what, **r})
    data = {
        "counted": dt.date.today().isoformat(),
        "tokenizer": f"tiktoken {tiktoken_version()} (o200k_base; cl100k_base for comparison)",
        "blog": blog,
        "estimates": {k: {"words": w, "tokens": round(w * tpw)} for k, w in WORDS.items()},
        "repos": repos,
    }
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w") as f:
        json.dump(data, f, indent=1)
        f.write("\n")
    print(json.dumps(data, indent=1))


def tiktoken_version() -> str:
    import tiktoken

    return getattr(tiktoken, "__version__", "?")


if __name__ == "__main__":
    main()
