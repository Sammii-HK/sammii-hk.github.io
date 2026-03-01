---
title: "I Built a Chrome Extension Backed by 2,000 Grimoire Articles"
description: Lunary has 2,000+ articles covering astrology, tarot, crystals, spells, and divination. I built a Chrome extension that searches them in real time so I always have accurate esoteric knowledge at hand.
date: 2026-03-30
tags: [chrome-extension, javascript, lunary, indie-hacking]
draft: false
---

Lunary has over 2,000 grimoire articles. Crystal properties, tarot card meanings, planetary aspect interpretations, spell correspondences, numerology, moon phases — all of it written to be accurate, not just to rank.

The problem: when I'm writing content, answering questions, or responding to users, I can't hold all of that in my head. Looking it up means leaving the page, navigating the grimoire, finding the entry, coming back.

So I built a Chrome extension that puts the grimoire in a side panel. Type a query, get the relevant grimoire content instantly, with the AI synthesis grounded in Lunary's own knowledge base rather than generic model output.

## Why the grimoire matters

Most astrology content online is vague and repetitive. "Amethyst brings calm and clarity." "The Tower card represents sudden change." These descriptions circulate endlessly because they're easy to write and impossible to verify.

Lunary's grimoire is different. The crystal entries include elemental correspondences, planetary rulers, chakra associations, historical uses, and specific ritual applications. The tarot entries cover numerological significance, astrological correspondence, shadow meanings, and position-specific interpretations. The spell entries list actual ingredients with their individual symbolic roles.

When the extension surfaces grimoire content, it's not pulling from a generic model's training data. It's pulling from a structured knowledge base that I've built and verified.

## The architecture

Three contexts, all communicating through message passing:

```
Content Script → Background Service Worker → Side Panel
                          ↕
                   Lunary Grimoire API
```

The content script watches the active page and provides a keyboard shortcut to open the panel. The background handles the API calls. The side panel is where the search and results live.

## Opening the side panel

The side panel API (Chrome 114+) requires the `sidePanel` permission and a manifest entry:

```json
{
  "manifest_version": 3,
  "permissions": ["sidePanel", "storage", "tabs"],
  "side_panel": {
    "default_path": "sidepanel/index.html"
  },
  "commands": {
    "open-grimoire": {
      "suggested_key": { "default": "Alt+G" },
      "description": "Open Lunary grimoire"
    }
  }
}
```

The keyboard shortcut is registered in the background:

```typescript
chrome.commands.onCommand.addListener((command) => {
  if (command === 'open-grimoire') {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (tab?.id) chrome.sidePanel.open({ tabId: tab.id });
    });
  }
});
```

Alt+G from anywhere opens the grimoire panel. No clicking around.

## The grimoire search endpoint

Lunary exposes a search endpoint that queries the grimoire by relevance:

```typescript
// GET /api/grimoire/search?q=amethyst+chakra&limit=5
interface GrimoireResult {
  id: string;
  title: string;
  category: 'crystal' | 'tarot' | 'astrology' | 'spell' | 'numerology' | 'divination';
  excerpt: string;
  url: string;
  correspondences?: Record<string, string>; // element, planet, chakra, etc.
}
```

The search runs against the full article content, titles, and a structured `correspondences` field that captures the metadata for each entry. A search for "amethyst protection" finds the amethyst crystal entry and any spell entries where amethyst appears as a protective ingredient.

In the side panel, results appear as cards:

```typescript
async function searchGrimoire(query: string): Promise<GrimoireResult[]> {
  const settings = await chrome.storage.sync.get(['apiBase', 'apiKey']);
  const url = new URL(`${settings.apiBase}/api/grimoire/search`);
  url.searchParams.set('q', query);
  url.searchParams.set('limit', '5');

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${settings.apiKey}` },
  });

  const data = await res.json();
  return data.results;
}
```

## Grounded AI synthesis

Search results alone aren't always enough. Sometimes I need a synthesised answer — "what crystals work with Scorpio in November?" — that draws from multiple grimoire entries.

The synthesis call passes the top grimoire results as context:

```typescript
async function synthesise(
  query: string,
  context: GrimoireResult[],
): Promise<string> {
  const contextText = context
    .map((r) => `## ${r.title}\n${r.excerpt}`)
    .join('\n\n');

  const res = await fetch(`${settings.apiBase}/api/ai/grimoire-answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${settings.apiKey}`,
    },
    body: JSON.stringify({ query, context: contextText }),
  });

  const data = await res.json();
  return data.answer;
}
```

The API endpoint uses the grimoire excerpts as the system context, so the model's answer is constrained to what Lunary actually says. If a crystal isn't in the grimoire, the answer reflects that rather than inventing correspondences from training data.

## What it looks like in practice

Composing an Instagram caption about a Scorpio new moon: open the panel, search "new moon Scorpio ritual", get the Scorpio correspondences entry, the new moon ritual entry, and the relevant November transit data from Lunary's ephemeris. The synthesis answer gives me the specific crystals, herbs, and intentions that align — all from the verified grimoire, not generic astrology content.

Answering a user question about a tarot pull: search the card name, get the full meaning including shadow interpretation and positional context. Copy the relevant section directly into the response.

Writing a post about angel numbers: search "1111 numerology", get the full numerology entry with the precise meaning, not the watered-down version that circulates on Pinterest.

## The shadow DOM wrapper

Every element the extension injects into the host page lives inside a shadow DOM so the host page's CSS can't reach it:

```typescript
function createPanelTrigger(): void {
  const host = document.createElement('div');
  const shadow = host.attachShadow({ mode: 'closed' });

  const button = document.createElement('button');
  button.textContent = 'Grimoire';
  // styles scoped to shadow root — platform CSS doesn't leak in
  shadow.appendChild(styleElement);
  shadow.appendChild(button);

  document.body.appendChild(host);
}
```

This matters because Twitter, LinkedIn, and Instagram all have aggressive global CSS that would otherwise mangle anything you inject.

## The result

The grimoire is now effectively ambient. I don't navigate away to look things up. The knowledge I've spent months building into Lunary is accessible in two keystrokes, grounded in the actual content, and synthesisable across multiple entries at once.

2,000+ articles stopped being a library I visit and became a knowledge layer I work inside.

---

*I'm Sammii, founder of [Lunary](https://lunary.app) and indie developer building tools I actually want to use. I write about shipping products solo, the technical decisions behind them, and figuring it all out in public.*
