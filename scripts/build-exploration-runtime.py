"""Refresh the standalone wrappers around the existing, unmodified models.

The vendored runtime is committed, so npm builds need no Python or sibling repo.
Use --source-dir to import a new reviewed creative source snapshot, then run this
script without it to rebuild wrappers. No network access is used.
"""
from pathlib import Path
import argparse
import hashlib
import html
import json
import re
import shutil

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / 'public/exploration-runtime'
parser = argparse.ArgumentParser()
parser.add_argument('--source-dir', type=Path)
args = parser.parse_args()
TARGET.mkdir(parents=True, exist_ok=True)

COPIES = {
    'atlas/worlds/worlds.js': 'modules/worlds.js',
    'atlas/worlds/worlds.css': 'modules/worlds.css',
    'atlas/worlds/SOURCES.md': 'sources/worlds.md',
    'atlas/sky/sky.js': 'modules/sky.js',
    'atlas/sky/sky.css': 'modules/sky.css',
    'atlas/sky/SOURCES.md': 'sources/sky.md',
    'atlas/sky/data/D3-LICENSE.txt': 'sources/D3-LICENSE.txt',
    'atlas/labs/labs.js': 'modules/labs.js',
    'atlas/labs/labs.css': 'modules/labs.css',
    'atlas/labs/SOURCES.md': 'sources/physics.md',
    'atlas/clock/black-hole-clocks.html': 'modules/black-hole-clocks.html',
    'atlas/clock/SOURCES.md': 'sources/clocks.md',
    'evolution/model.js': 'modules/evolution-model.js',
    'evolution/app.js': 'modules/evolution-app.js',
    'evolution/index.template.html': 'modules/evolution.template.html',
    'evolution/SOURCES.md': 'sources/evolution.md',
    'editorial/assets/Inter.ttf': 'fonts/Inter.ttf',
    'editorial/assets/Jost.ttf': 'fonts/Jost.ttf',
    'editorial/assets/Inter-LICENSE.txt': 'fonts/Inter-LICENSE.txt',
    'editorial/assets/Jost-LICENSE.txt': 'fonts/Jost-LICENSE.txt',
}

if args.source_dir:
    manifest = []
    for source, destination in COPIES.items():
        src, dest = args.source_dir / source, TARGET / destination
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(src, dest)
        manifest.append({'source': source, 'runtime': destination, 'sha256': hashlib.sha256(src.read_bytes()).hexdigest()})
    (TARGET / 'source-manifest.json').write_text(json.dumps({'files': manifest}, indent=2) + '\n')

catalogue = json.loads((ROOT / 'app/labs/explorations/catalogue.json').read_text())
for item in catalogue['items']:
    directory = TARGET / item['slug']
    directory.mkdir(exist_ok=True)
    family, mode = item['moduleFamily'], item['id']
    title = html.escape(item['title'])
    head = f'''<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><meta name="color-scheme" content="dark"><title>{title} · interactive view</title><link rel="canonical" href="https://labs.sammii.dev/explorations/{item['slug']}/"><script src="../bridge.js"></script>'''
    common = '<link rel="stylesheet" href="../frame.css">'
    body_attrs = f'data-slug="{item["slug"]}" data-family="{family}" data-mode="{mode}"'
    noscript = '<noscript><p class="frame-fallback">This visualisation needs JavaScript for its controls. The parent page contains the explanation, model limits and sources.</p></noscript>'
    if family in ('world', 'sky', 'lab'):
        module = {'world': 'worlds', 'sky': 'sky', 'lab': 'labs'}[family]
        output = head + f'<link rel="stylesheet" href="../modules/{module}.css">' + common + f'<script defer src="../modules/{module}.js"></script></head><body {body_attrs}><main id="scene" class="scene" aria-label="{title}"></main>{noscript}</body></html>'
    elif family == 'clock':
        fragment = (TARGET / 'modules/black-hole-clocks.html').read_text()
        output = head + common + f'</head><body {body_attrs}><main id="scene" class="scene">' + fragment + '</main>' + noscript + '</body></html>'
    elif family == 'evolution':
        template = (TARGET / 'modules/evolution.template.html').read_text()
        style = re.search(r'<style>([\s\S]*?)</style>', template).group(1)
        content = re.search(r'<main>([\s\S]*?)</main>', template).group(1)
        content = re.sub(r'^<div class="intro">[\s\S]*?</div>\s*<div class="lab-grid">', '<div class="lab-grid">', content, count=1)
        content = content.replace('It runs entirely in this file.', 'It runs locally in your browser.')
        output = head + '<style>' + style + '</style>' + common + f'<script defer src="../modules/evolution-model.js"></script><script defer src="../modules/evolution-app.js"></script></head><body {body_attrs}><main id="scene" class="scene evolution-scene">' + content + '</main>' + noscript + '</body></html>'
    else:
        raise ValueError(f'Unknown module family: {family}')
    (directory / 'index.html').write_text(output)

print(json.dumps({'runtime_pages': len(catalogue['items']), 'output': str(TARGET)}))
