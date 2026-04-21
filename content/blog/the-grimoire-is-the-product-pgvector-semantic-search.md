---
title: "The grimoire is the product: 2,000 articles with pgvector semantic search"
description: >-
  Lunary's grimoire is two thousand articles on astrology, tarot, crystals,
  spells, and divination. It is also the thing that drives most of the traffic.
  Here is how semantic search across it runs on Postgres alone, with no
  Elasticsearch, no Pinecone, and no separate search service.
date: '2026-05-04'
tags:
  - postgres
  - pgvector
  - semantic-search
  - ai
  - lunary
draft: false
---
Lunary's grimoire is two thousand articles. Crystals, spells, tarot cards, planetary days, aspects, zodiac pages, numerology, herbs, sabbats, rituals. Every one of them is its own URL, its own OG image, its own entry in the database, and increasingly its own entry point from Google. The grimoire is why Lunary grows. It is the content moat and it is the top of the funnel.

Once the grimoire hit a certain size, "related articles" stopped being a manageable problem. Tag-based or category-based relationships only get you so far: a page on the crystal obsidian has fifteen plausibly related pages by tag, but only three of them feel like what a reader would actually want next. Solving that properly meant semantic search. And once I was already generating embeddings for the related-articles feature, the astral guide chat started using the same infrastructure to fetch relevant context per conversation.

I did not want to add Elasticsearch, Pinecone, Weaviate, or a separate search service to the stack. Lunary already runs on Postgres via Neon. pgvector turns that Postgres database into a perfectly adequate vector store, at the scale I need, for free.

---

## Why pgvector is enough

The pitch for dedicated vector databases is that they are faster at a million rows, handle sharding, and come with opinionated indexing defaults. All true. Also all irrelevant to a personal product with two thousand rows.

pgvector is a Postgres extension that adds a `vector` column type and a set of distance operators. It supports exact nearest-neighbour search by default and gives you two approximate-nearest-neighbour index types when you want to trade recall for speed. At two thousand rows, exact search returns in a handful of milliseconds. Even with a naive sequential scan the query finishes faster than the embedding lookup. The database the app already runs on becomes the search service. Nothing to deploy, nothing to sync, nothing to pay for.

The setup is three lines in the Prisma schema:

```prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [vector, pgcrypto(map: "pgcrypto")]
}
```

Prisma's first-class support for the `vector` type is incomplete (it shows up as `Unsupported("vector")` in generated types), but the raw SQL template tag handles it fine at query time. You just treat the embedding column as opaque to the ORM and write the queries by hand where you need them.

## The schema

The grimoire embeddings table is deliberately boring:

```prisma
model grimoire_embeddings {
  id         String                 @id
  slug       String                 @unique
  title      String
  category   String
  content    String
  embedding  Unsupported("vector")?
  metadata   Json?
  created_at DateTime?              @default(now()) @db.Timestamptz(6)
  updated_at DateTime?              @default(now()) @db.Timestamptz(6)

  @@index([category], map: "idx_grimoire_embeddings_category")
  @@index([slug], map: "idx_grimoire_embeddings_slug")
}
```

`content` is the full text of the article, stored alongside the embedding so a search result can render a preview without a second query. The metadata column is jsonb and carries anything that does not fit: planet, zodiac sign, element, crystal properties, whatever the category wants. Indexes on category and slug keep the scoped queries cheap.

## The embedding model

Lunary uses BAAI's **bge-large-en-v1.5** at 1024 dimensions, served through DeepInfra's OpenAI-compatible endpoint. Two reasons:

```typescript
const EMBEDDING_MODEL = 'BAAI/bge-large-en-v1.5';
const EMBEDDING_DIMENSIONS = 1024;

openaiClient = new OpenAI({
  apiKey: process.env.DEEPINFRA_API_KEY,
  baseURL: 'https://api.deepinfra.com/v1/openai',
});
```

One: BGE-large is free to run, MIT-licensed, and benchmarks competitively against OpenAI's proprietary embedding models on MTEB. Two: DeepInfra's pricing is about a twentieth of OpenAI's for the same endpoint shape, which matters when you are embedding two thousand articles plus every chat query forever.

Switching to a hosted provider that looks like OpenAI means the client code does not know the difference. If BGE gets surpassed, I change three lines.

The dimension choice, 1024, is the model's native output. Earlier iterations of the grimoire ran on a 768-dimension model, and the migration to 1024 required regenerating every embedding. That migration lives in `prisma/migrations/20260325200000_switch_embeddings_to_1024d/`. Changing embedding model is not free, and the dimension count is part of the commitment.

## Storing an entry

Storing an embedding is an upsert keyed on the slug:

```typescript
const embedding = await generateEmbedding(`${entry.title}\n\n${entry.content}`);
const embeddingString = `[${embedding.join(',')}]`;

await sql`
  INSERT INTO grimoire_embeddings (id, slug, title, category, content, embedding, metadata)
  VALUES (
    ${entry.id},
    ${entry.slug},
    ${entry.title},
    ${entry.category},
    ${entry.content},
    ${embeddingString}::vector,
    ${JSON.stringify(entry.metadata || {})}::jsonb
  )
  ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    category = EXCLUDED.category,
    content = EXCLUDED.content,
    embedding = EXCLUDED.embedding,
    metadata = EXCLUDED.metadata,
    updated_at = NOW()
`;
```

Two details worth flagging. First, the embedding input is `title + "\n\n" + content`. Giving the model the title separately from the body is a small but measurable accuracy improvement; the title is often more semantically dense than the opening paragraph and the model weights the first tokens more heavily. Second, the embedding is cast to `vector` on insert via `::vector`. pgvector accepts vectors as stringified arrays, which is the most portable format across client libraries.

The ON CONFLICT clause means the same grimoire ingestion script can be run repeatedly without creating duplicates. New articles insert, edited ones update, nothing has to be tracked externally.

## The search query

This is where pgvector earns its keep:

```typescript
const results = await sql`
  SELECT
    id,
    slug,
    title,
    category,
    content,
    metadata,
    1 - (embedding <=> ${embeddingString}::vector) as similarity
  FROM grimoire_embeddings
  ORDER BY embedding <=> ${embeddingString}::vector
  LIMIT ${limit}
`;
```

The `<=>` operator is pgvector's cosine distance. Cosine distance is `1 - cosine_similarity`, so you invert it in the SELECT to get a similarity score between 0 and 1 for the result. The ORDER BY on the raw distance lets the planner use an index if one is present, which it is:

```sql
CREATE INDEX grimoire_embeddings_embedding_idx
ON grimoire_embeddings
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

IVFFLAT is pgvector's inverted-file flat index. It partitions the vector space into 100 clusters (the `lists = 100` parameter) and, at query time, searches a subset of clusters rather than the whole table. You get approximately the same top-K results as exact search with a large speed-up as the table grows. At two thousand rows I could skip the index entirely; at twenty thousand or two hundred thousand, I would not.

Rough sizing for IVFFLAT: `lists ≈ sqrt(N)` at small scale, `lists ≈ N / 1000` at larger scale. At ~2,000 rows, 100 lists is deliberately generous so recall stays high while the query stays fast. HNSW is the other supported index type, better recall at the cost of more memory and slower builds; for read-heavy, write-occasional workloads like a grimoire, IVFFLAT is the right trade.

An optional category filter runs as a WHERE clause before the distance sort. Because the category has its own B-tree index, Postgres can filter first then rank, which keeps the search narrow and fast when the caller knows they want a specific content type.

## The LRU cache

Embedding generation is an API call. Repeating the same call for the same text wastes money and adds latency. The library keeps a simple in-memory LRU cache:

```typescript
const EMBEDDING_CACHE_TTL = 24 * 60 * 60 * 1000;
const EMBEDDING_CACHE_MAX_SIZE = 200;
const embeddingCache = new Map<string, { embedding: number[]; timestamp: number }>();
```

200 entries, 24-hour TTL. It is a `Map` specifically because `Map` preserves insertion order, so evicting the oldest entry is `embeddingCache.keys().next().value`: O(1), no library, no dependency. Embeddings are deterministic for a given input, so caching is safe forever; the TTL is only there to stop stale cache entries from consuming memory indefinitely on a long-running process.

For a page with a popular search query, the embedding call is made once per process lifetime. The marginal cost of the next 199 identical queries is essentially zero.

## What I skipped and why

A few choices worth calling out explicitly.

No reranking. Some teams pair vector search with a cross-encoder that reranks the top-K with more expensive attention. At two thousand articles, the vector search is accurate enough that reranking would add latency without moving the needle.

No hybrid search. Combining vector search with classical keyword search (tsvector + BM25) is a real technique and the query pattern is well-supported. I tried it and the fused ranking was noisier than either alone on grimoire queries, probably because the vocabulary is unusual enough (astrology jargon) that pure semantic search handles it better than keyword.

No per-paragraph chunking. The grimoire articles are short enough (500-1,500 words) that embedding the whole article gives the right granularity. Chunking paid off for the Lunary astral guide chat, which needs passage-level retrieval, but for related-articles the full-article embedding is what wants comparing.

---

## The point

Two thousand rows in a vector column in Postgres that the app already uses. Three hundred lines of TypeScript across the embed-on-write path and the search-on-read path. One IVFFLAT index. Zero extra services. Semantic search for the grimoire runs out of this, the astral guide's retrieval runs out of this, and related articles runs out of this.

The grimoire is the product. 38,000 monthly visitors find Lunary through it. Every one of those visits is a potential sign-up, and the internal linking that semantic search produces is what keeps readers moving through the site instead of bouncing after one article. pgvector is the smallest, most boring technical choice that delivers that outcome. Boring choices that work are the best choices an indie founder can make.
