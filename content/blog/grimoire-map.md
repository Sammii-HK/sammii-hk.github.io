---
title: "Obsidian's nearest neighbours: Lunary's grimoire, mapped by meaning"
description: >-
  All 1,958 articles in Lunary's grimoire, embedded with a small model on my Mac mini and laid out by meaning. Obsidian sits with the stones, two spells turn up among its ten nearest, and the horoscopes form a continent of their own.
date: '2026-12-31T09:00:00+00:00'
tags:
  - charts
  - ai engineering
  - embeddings
  - lunary
series: "AI engineering"
chart: "grimoire-map"
draft: false
---

Open the chart and one dot is already circled: Obsidian. Ten lines run out from it to its nearest neighbours by meaning. The first four are what you would guess, all stones: Snowflake Obsidian, Onyx, Serpentine, Labradorite. The fifth and sixth are not stones at all. They are spells, Black Tourmaline Shield and Obsidian Shadow Integration, and only after them does the next crystal, Vesuvianite, arrive.

Then you zoom out and notice that half the page is one dense continent, and it is horoscopes.

The chart is at [labs.sammii.dev/charts/grimoire-map](https://labs.sammii.dev/charts/grimoire-map/). It is every article in Lunary's grimoire, 1,958 of them, placed so that close together means close in meaning.

## Meaning does not respect the menu

Lunary's grimoire is organised the way a site has to be: crystals in one section, spells in another, tarot in a third. Those categories are how I built it. They are not how the content relates.

Obsidian's list is the clearest example. A protection spell built around black tourmaline and a shadow-work ritual built around obsidian itself are, to the embedding model, closer to obsidian than most of the other stones in the crystal section. Which is right, if you think about why someone reads about obsidian. The site's categories are about what kind of page something is. The model is about what the page is about.

Here are the ten, with their cosine similarity to obsidian (the panel shows the same scores rounded to two places):

1. Snowflake Obsidian, 0.706
2. Onyx, 0.611
3. Serpentine, 0.579
4. Labradorite, 0.574
5. Black Tourmaline Shield (a spell), 0.568
6. Obsidian Shadow Integration (a spell), 0.561
7. Vesuvianite, 0.539
8. Black Tourmaline, 0.525
9. Turquoise, 0.519
10. Tourmalinated Quartz, 0.518

## The continent

962 of the 1,958 articles are monthly horoscopes. That is the single biggest category by a long way (the next is concepts, at 269), and on the map they form a landmass of their own.

Part of that is how the map was made. The horoscopes are generated in code from the sign and the month when the page renders, so there is no body text in the repository for the embedding to read. The model knows them only by title and keywords, so to the model they mostly resemble each other, which is part of why they cluster so tightly. When you hover one, the side panel says so: "title and keywords only".

That is the first honest thing the chart shows about the site, and it is not flattering to the grimoire: nearly half of it is one kind of generated page.

## Using it

Hover the map (or tap it on a phone) and the nearest article to your pointer is picked, within a generous radius so the dots do not have to be hit exactly. The panel beside the map (below it on a narrow screen) shows its category, its title, its nearest neighbours under **Nearest in meaning**, and a **Read it on Lunary** link to the real page. Click a neighbour in the list to jump to it. For obsidian the panel lists ten neighbours with their cosine scores; for every other article it lists the five nearest, with their categories.

Above the map, a row of buttons highlights one category at a time, each with its count: **monthly horoscopes** 962, **concepts** 269, **spells and rituals** 211, **numerology** 137, **glossary** 107, **crystals** 105, **tarot** 92, and a tail of small ones down to a single birthday article. **none** clears it. **Find an article** lights up every title that matches what you type, from two letters on, and lists the first eight underneath.

The page takes `?focus=` with an article's slug, so `?focus=obsidian` opens it where it starts anyway, and any other slug opens on that article instead.

## How it is built

Everything comes from the Lunary repository and nothing else: no database, no API. The article list is the grimoire's own search index. Each article's text is its title, summary and keywords, plus its body fields where the repository holds them as data. That is true for 503 articles: crystals, spells, tarot cards, runes, angel numbers, life path numbers, chakras and correspondences. The other 1,455 are known by title and keywords only.

Each text went through qwen3-embedding, a 0.6-billion-parameter model, running in Ollama on my Mac mini. Each article becomes 1,024 numbers. All 1,958 took about two minutes. Similarity is cosine similarity, and the neighbour lists in the panel are computed in all 1,024 dimensions. The map is only a picture of them.

The picture is t-SNE: PCA down to 50 dimensions first, then exact t-SNE with perplexity 30 for 1,000 iterations from a PCA start, written in NumPy for this chart. The script is `scripts/labs/grimoire_map.py`, run on 19 October 2026. The component on the page just draws the dots from the resulting data file; nothing is embedded in your browser. I wrote about how the live grimoire search works in [The grimoire is the product](/blog/the-grimoire-is-the-product-pgvector-semantic-search); this chart is a separate, offline look at the same articles.

## What it cannot tell you

t-SNE keeps neighbourhoods and gives up on everything else. Trust what is next to what. Do not trust the size of a cluster, or the distance between two clusters, or the empty space around an island. The horoscope continent is big because there are 962 of them, not because of anything the layout is saying, and the gap between it and the crystals means nothing on its own.

The map is also a picture of thin text in places. An article known only by its title and keywords has very little for the model to go on, so where it lands says as much about how it was named as about what it says. The 503 articles with body text are the ones whose positions I would put more weight on.

It is one small model. A larger embedding model, or a different one, might well draw a different map and probably a slightly different list for obsidian. The neighbours are real for this model on this text, not a ruling on what obsidian is like.

And it is a snapshot of the repository on 19 October 2026, not a live view of the site.

The chart is at [labs.sammii.dev/charts/grimoire-map](https://labs.sammii.dev/charts/grimoire-map/).

## Sources

- van der Maaten and Hinton, Visualizing Data using t-SNE (2008).
- Wattenberg, Viégas and Johnson, How to Use t-SNE Effectively, Distill (2016).
- Belkina et al., Automated optimized parameters for t-SNE (2019).
- Zhang et al., Qwen3 Embedding (2025).
