---
title: "Lattiq"
description: "A local-first writing room with a working editor, readable device-only saving and separately documented collaboration experiments."
techStack: "Next.js, Lexical, Yjs, IndexedDB, WebSockets"
updated: "2026-11-20"
status: "Unreleased local d7071fe: device-only editor, reload persistence and formatting verified; hosted collaboration was not exercised."
---

<!-- Kept in step with the canonical structured study in lattiq.json. -->

Unreleased local d7071fe: device-only editor, reload persistence and formatting verified; hosted collaboration was not exercised.

## The promise had to work

Lattiq puts a document on the device before it depends on a server. The current local writing-room pass checks the visible product: opening a scratch pad, editing and formatting a labelled synthetic sample, reloading it, and reading a shipped public-domain book. It runs with no WebSocket URL and accurately shows device-only storage. Earlier collaboration and benchmark evidence is kept separately below; this pass did not re-certify it.

_Unreleased local writing room. Component presentation captured before the dependency-only d7071fe update; its source was unchanged. No collaboration server is connected._

## From the room to a saved page

The scratch pad opens through the writing-room navigation. A visibly labelled synthetic sample survived reload, and Heading 1 applied through the real toolbar became a heading in the document. Tabbing from Link reached the editable Document field; All documents returned to the room. On a 390px screen the eleven formatting buttons wrapped into two rows with at least 44px targets and no document overflow. These checks establish browser-local persistence and formatting, not a backup guarantee.

_Actual editor from the final local d7071fe build. Synthetic sample writing, saved only on the review origin; no private document or remote collaborator._

_Final local editor at 390px. Reload persistence and selected-text heading formatting were checked after the compatible dependency update._

## A shelf that opens the actual editor

The reading-shelf link reaches the library section. Opening The Yellow Wallpaper loads its shipped public-domain text into the editable document. The shelf, room and editor share navigation and a restrained editorial palette. The shelf arrow is Lucide. No private library, account or remote storage was used.

_Actual local public-domain shelf, unchanged by the dependency-only update. Opening The Yellow Wallpaper was verified; the capture does not demonstrate a hosted reading library._

> The current d7071fe pass has normal lint, the 11 shared icon regressions and the production build with TypeScript passing; the final dependency audit reports zero findings. It does not re-certify collaboration, offline reconnect merging, older timing benchmarks or assistive-technology conformance. The captures are unreleased local views, not a deployment.

## Earlier collaboration repair: follow an edit across the stack

1. **Editor binding:** Lexical’s CollaborationPlugin maps the visible document into Yjs. The document is loaded before network collaboration starts, and undo uses the collaborative history. [Implementation](https://github.com/Sammii-HK/lattiq/blob/dbabae3/src/components/editor/CollaborativeEditor.tsx)
2. **Persistence and transport:** The provider restores IndexedDB state and negotiates missing updates with Yjs state vectors. Heartbeats use a separate message type from presence. [Implementation](https://github.com/Sammii-HK/lattiq/blob/dbabae3/src/lib/yjs/collaboration-provider.ts)
3. **Room boundary:** The server validates room names and optional expiring room tokens, owns socket presence, and writes room state through a temporary file and rename. [Implementation](https://github.com/Sammii-HK/lattiq/blob/dbabae3/server/index.ts)
4. **Visible honesty:** The status surface distinguishes device-only saving from collaboration. No WebSocket URL means the deployed editor stays local rather than showing pretend collaborators. [Implementation](https://github.com/Sammii-HK/lattiq/blob/dbabae3/src/components/editor/SyncStatus.tsx)

The earlier release report verifies this collaboration path on localhost. The current writing-room pass used no room server. Hosted collaboration still needs a long-lived service with persistent storage.

## A protocol error disguised as a bundling problem

- **What happened:** Collaboration had been removed after a lib0 decoder error, leaving a standalone editor without the promised sync.
- **Why:** The server answered a heartbeat with a byte the client interpreted as an awareness message, then tried to decode a payload that was not there. The report reproduces this without a bundler.
- **Fix:** Give heartbeat traffic its own message type, restore CollaborationPlugin inside LexicalCollaboration, and use Lexical’s own Yjs binding to build valid seeds.

## Persist the document, not an outgoing queue

An in-memory offline buffer disappears on reload. A convincing offline demo must survive closing and reopening the page.

- **Queue unsent messages in memory:** Works only while the tab stays alive.
- **Persist Yjs state in IndexedDB (chosen):** Load local state and apply the seed after the binding is ready, then connect and exchange missing state using Yjs state vectors.

Offline edits survive reload. A browser and server applying the same deterministic seed retain one copy. Undo follows the collaborative document rather than treating remote changes as local history.

## A bounded room server

The room server validates document names and can require expiring, room-scoped HMAC tokens. Presence belongs to a socket and is removed when it leaves. Disk writes use a temporary file and rename. This is a single-instance design with anonymous per-tab identities, not a multi-tenant permissions system.

## Earlier localhost measurements

- **Cold book load:** 269 ms median (127,360 words; empty IndexedDB; navigation to all blocks in the DOM). Source: docs/live-sync-report.md and bench/results.json, release branch, 20 November 2026
- **Warm load with server down:** 213 ms median (The same book loaded from IndexedDB). Source: docs/live-sync-report.md, Measurements table
- **Keystroke to remote DOM:** 1.4 ms median (100 single-keystroke samples on localhost; not internet latency). Source: docs/live-sync-report.md, Measurements table
- **Offline merge after sockets reopen:** 21 ms median (5 samples; excludes reconnect backoff. From server restart: 786 ms median.). Source: docs/live-sync-report.md, Measurements table

## What those numbers establish

The earlier measurement report uses a production build and headless Chrome on an Apple M3, without network throttling. It measures that local code path, not the current writing-room pass or hosted internet latency. That report records two-way edits, presence removal, offline reload and convergence, seed deduplication, token rejection and console errors. The current device-only review did not start a room server or repeat those benchmarks.

> The current local build runs device-only with an empty WebSocket URL. A hosted collaboration service would require a long-lived room server with persistent disk. Earlier local collaboration evidence is not a production service or a re-certification by the current room/editor/shelf pass.

## Explore the work

- [Open the editor](https://lattiq.sammii.dev)
- [Read the measurement report](https://github.com/Sammii-HK/lattiq/blob/claude/lattiq-live-sync-c33f52/docs/live-sync-report.md)
