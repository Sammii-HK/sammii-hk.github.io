import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Play, Pause, RotateCcw, Info, ArrowUpRight, Plus, Minus } from 'lucide-react';
import { readFileSync, writeFileSync } from 'node:fs';
const icons = Object.fromEntries(Object.entries({Play, Pause, RotateCcw, Info, ArrowUpRight, Plus, Minus}).map(([name, Icon]) => [name, renderToStaticMarkup(createElement(Icon, {size:16,'aria-hidden':true,focusable:false}))]));
const adapter = readFileSync(new URL('./exploration-icons-adapter.js', import.meta.url),'utf8');
const output = new URL('../public/exploration-runtime/ui-icons.js', import.meta.url);
const generated = `/* Generated from lucide-react by scripts/generate-exploration-icons.mjs. */\n(function () {\nvar icons = ${JSON.stringify(icons)};\n${adapter}\n})();\n`;
if (process.argv.includes('--check')) {
  if (readFileSync(output, 'utf8') !== generated) throw new Error('Exploration Lucide adapter is stale; run node scripts/generate-exploration-icons.mjs');
} else writeFileSync(output, generated);
