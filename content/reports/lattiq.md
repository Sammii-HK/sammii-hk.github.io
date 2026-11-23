---
title: "Lattiq live sync: what was broken, what changed, what it measures"
description: "The engineering report behind the Lattiq case study: root causes, the fixes, and benchmarks for load, keystroke latency and offline merge."
project: lattiq
date: "2026-11-20"
---

Written on 20 November 2026, when the sync work was finished. The public editor runs device-only until the room server is hosted; everything below was tested against a production build on my machine.

## Summary

Lattiq now does what it says: a Lexical editor bound to a Yjs document, persisted in IndexedDB, synced through a WebSocket room server, with live cursors and presence. Playwright proves two-way sync between two browser contexts, an offline edit surviving a reload with the server down, and offline edits from two clients merging on reconnect.

## What was broken, and why

| Symptom | Root cause |
|---|---|
| `CollaborationPlugin` removed; editor ran on `HistoryPlugin`, nothing synced or persisted | It was blamed on a lib0/webpack bundling bug. There was no bundling bug: pnpm already installs one copy of `yjs` (13.6.22) and `lib0` (0.2.99), and the real error came from the provider's heartbeat (next row). With the protocol fixed, the plugin works with the webpack aliases removed. I also checked it still works with the old aliases put back. |
| `Unexpected end of array` | The client pinged with a single byte `[0]`, and the server answered `[1]`. The client reads `1` as an awareness message, then tries to read its payload from an empty buffer, and lib0's decoder throws exactly this message. It fired about 15 s after connecting, which is why it looked like a load-time problem. Reproduced in isolation with lib0. |
| Mounting the plugin crashed | Lexical 0.40 requires a `<LexicalCollaboration>` context provider around the composer. |
| Seeded content would not have round-tripped | `text-to-yjs.ts` hand-built the Y.XmlText tree but left out the `Y.Map` that Lexical embeds for every TextNode. The workaround was a server route that read the Yjs file and returned JSON, plus `LoadContentPlugin`, which typed the text into Lexical with no Yjs involved. |
| `/api/doc/<slug>/content` returned 404 on the live site | Seeds were written at runtime to `.lattiq-data/`, which is gitignored and doesn't exist on Vercel's read-only, per-request filesystem. |
| No WebSocket URL in the live bundle | `NEXT_PUBLIC_WS_URL` was never set, so the provider would have tried `ws://localhost:3001` on every visitor's machine. |
| Provider would have misbehaved once mounted | It reconnected after an intentional `disconnect()` (React StrictMode runs connect/disconnect twice), gave up after 10 attempts, and kept offline edits in an in-memory buffer that a reload throws away. |
| Lexical never rendered stored content | Lexical's V1 binding only renders Yjs changes it observes *after* binding. Content already in the Y.Doc at mount stays invisible, so loading has to happen after the plugin binds. |
| Server | No auth; any string became a room and a file name; it sent the whole document to every client on every connect; it lost track of who owned an awareness entry, so people who left stayed in the presence list. |
| React hydration error #418 | I didn't reproduce this one locally before changing things, so the cause is unconfirmed. The editor now renders only in the browser (the server sends a skeleton), and an e2e test asserts no console errors on the home page, the welcome doc and the largest book in a production build. |

## What changed

**Client**
- `CollaborationPlugin` is mounted with the custom provider, inside `LexicalCollaboration`. Undo now goes through Yjs's UndoManager, so undoing your edit never undoes someone else's.
- `CollaborationProvider` owns the local-first lifecycle. On the first `connect()` it:
  1. loads y-indexeddb;
  2. applies the seed if this browser has never had it;
  3. only then opens the socket.

  It reconnects forever, with capped backoff and jitter, and on the browser's `online` event. The heartbeat now uses its own message type. `connect()` is synchronous, so StrictMode can't race it. Offline merge relies on Yjs state vectors, not a queue, so it works across reloads.
- `doc-session.ts` wires the parts together: Y.Doc, IndexedDB, seed, provider, a per-tab identity, and the token fetch.
- Presence: Lexical's cursors render into a container in the editor, `ActiveUsers` reads awareness, and `SyncStatus` shows opening, synced, offline and similar states.
- A production build without `NEXT_PUBLIC_WS_URL` runs local-only and says "Saved on this device".

**Seeds**
- `pnpm seed` runs headless Lexical through its own Yjs binding (`createBinding` and `syncLexicalUpdateToYjs`, the browser's code path) with a fixed client ID. It writes `public/seed/<doc>.yjs`, which is committed and served statically.
- Because every copy of a seed has the same client ID and clocks, the browser and the server can both apply it and the CRDT keeps one copy. A test checks this.
- `/api/seed`, `/api/doc/[id]/content`, `LoadContentPlugin`, the local fallback provider, the webpack aliases and the `yjs.mjs` patch script are gone.

**Room server**
- Room names must match `^doc-[a-z0-9-]+$`.
- When `LATTIQ_ROOM_SECRET` is set, a connection needs a token from `GET /api/collab-token?doc=<id>`. The token is an HMAC-SHA256 over the room name and expiry (one hour), and it only opens that one room. The route only signs documents that exist, so the server can't be used as a general relay.
- Without the secret the server is open and logs a warning. That is fine for localhost, not for production.
- Optional `ALLOWED_ORIGINS` refuses foreign browser origins before the upgrade.
- Rejections use close codes the client acts on: 4400 for an invalid room, 4401 for an unauthorised connection (one retry with a fresh token, then stop).
- The initial sync is diff-only, so a client that already has the book downloads nothing.
- Persistence writes atomically (a temp file, then rename). New rooms start from the seed. Dirty rooms are flushed on SIGTERM and SIGINT.
- Also added: a `/healthz` endpoint, ws-level pings to drop dead sockets, a cap of 50 clients per room and an 8 MB frame limit.
- Awareness ownership is tracked per socket, so leaving removes your cursor for everyone.

**Tests** (`pnpm test:e2e` against a production build: 5 tests, all passing)
1. Two contexts sync edits both ways; each sees two people; A's named caret appears in B's editor; when A leaves, B sees one person.
2. Both clients edit while the server is down; A reloads and still has its edit; on restart both converge to the same text containing both edits; a brand-new profile then loads the merged text from the server's persisted copy.
3. A seeded book applied by both browser and server appears exactly once (block count matches the seed).
4. The server rejects bad room names (4400), missing and forged tokens (4401), and a token used for the wrong room; a real token opens.
5. Pages load in a production build with no console errors.

## Measurements

From `pnpm bench`, with the raw results in [`bench/results.json`](https://github.com/Sammii-HK/lattiq/blob/main/bench/results.json).

**Setup:** a production build (`next start`) and the room server on localhost, with no throttling. The client is system Chrome 157, headless, through Playwright.

**Machine:** an Apple M3 (8 cores, 24 GB). Other work was running and the load average was 16 to 24, so treat these as conservative. The table shows the final run. The ranges cover the two runs before it that used the same method; they spread because of that load.

| Metric | Median | p95 | Range of medians |
|---|---|---|---|
| **Load, cold**: Pride and Prejudice (127,360 words, 2,509 blocks), empty IndexedDB, seed fetched over HTTP, server up. From navigation start until every block is in the editor DOM. | 269 ms | 350 ms | 269 to 414 ms |
| **Load, warm**: same document reloaded from IndexedDB, server up | 237 ms | 374 ms | 237 to 362 ms |
| **Load, warm, server down** | 213 ms | 270 ms | 213 to 403 ms |
| **Keystroke to remote**: keydown in client A until the character is in client B's DOM, via the room server, one keystroke in flight, n = 100 | 1.4 ms | 1.8 ms | 1.4 to 2.5 ms |
| **Offline merge**: two clients type about 190 characters each while the server is down; from both sockets being open again until both hold both edits, n = 5 | 21 ms | 24 ms | 18 to 21 ms |
| Offline merge, from server restart (includes reconnect backoff) | 786 ms | 949 ms | 786 to 1,818 ms |

What the numbers say:
- **Load is decode and render, not network.** Cold and warm loads are close because the network barely matters on localhost. The time goes into applying a 1.3 MB Yjs update (2,509 elements, about 37,700 structs) and rendering 2,509 Lexical nodes. The seed is 1.3 MB raw and 432 KB gzipped.
- **Latency is a localhost floor.** It measures the code path (Lexical to Yjs to socket to server to socket to Yjs to Lexical) with no real network. In production, add one round trip to wherever the room server is hosted.
- **Backoff dominates the restart number.** "From server restart" is mostly the client waiting for its next retry. The merge itself is the 21 ms row.

## What hosting collaboration needs

Vercel functions cannot hold sockets, so the room server needs somewhere long-lived with a persistent disk, such as Fly.io with a volume or a small VPS. It is one Node process behind `wss://`, with a shared secret for the room tokens, an origin allowlist and a data directory. Rooms live in memory, so it runs as a single instance; scaling out would mean routing by room or a shared backend such as y-redis.

## Known limits and follow-ups

- **Presence is anonymous.** Names are random per tab (for example "Amber Otter"). The token shows a connection came through the app; it doesn't identify a person.
- **One server instance only** (see above).
- **Very large documents.** For anything much bigger than Pride and Prejudice, the next steps would be Yjs V2 encoding, chunked rendering, or compacting IndexedDB on load.
- **Generator warnings.** `pnpm seed` prints Yjs 13.6's "Invalid access: Add Yjs type to a document before reading data", because `@lexical/yjs` 0.40 reads new types before inserting them. This is upstream and harmless.
