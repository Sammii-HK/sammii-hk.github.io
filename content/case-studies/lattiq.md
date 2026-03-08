---
title: "Lattiq"
description: "A local-first collaborative rich text editor with real-time sync via CRDTs"
techStack: "Next.js, Lexical, Yjs, WebSockets, TypeScript"
---

## The problem

Most collaborative editors require a persistent connection to work. If you go offline, you lose your edits or face merge conflicts when you reconnect. I wanted to build an editor that saves locally first, works completely offline, and syncs seamlessly when a connection is available, with no conflict resolution UI.

## Architecture

### Local-first with IndexedDB

Every keystroke is saved to IndexedDB immediately. The editor works entirely offline with no server dependency for basic editing. This means the page loads instantly (content is already in the browser), and there is zero risk of data loss from network issues.

### Yjs CRDTs for conflict-free sync

Real-time collaboration uses Yjs, a CRDT (Conflict-free Replicated Data Type) library. CRDTs are a class of data structure where concurrent edits from multiple clients are guaranteed to converge to the same result without any central coordination. This is fundamentally different from operational transform (used by Google Docs), which requires a central server to resolve conflicts.

The practical benefit: two users can edit the same paragraph simultaneously, even while offline, and when they reconnect their changes merge automatically without overwriting each other.

### Custom WebSocket server

The collaboration server handles room management and client awareness. When a user opens a document, they join a room identified by the document ID. The server broadcasts Yjs update messages between all clients in the same room. It also tracks which clients are connected and where their cursors are, enabling live presence indicators.

The server is intentionally minimal. It does not store document state; it only relays messages between clients. All persistence happens client-side in IndexedDB. This makes the server stateless and trivially scalable.

### Lexical editor framework

The editor itself is built on Lexical, Meta's extensible text editor framework. Lexical provides the content model, selection handling, and undo/redo stack. The formatting toolbar supports headings, bold, italic, underline, lists, code blocks, quotes, and links.

Lexical was chosen over alternatives like ProseMirror and Slate for its cleaner API, better TypeScript support, and first-class React integration.

## Challenges

**Yjs and Lexical binding**: Connecting Yjs's shared data types to Lexical's internal state model required careful handling of update cycles. Yjs emits events when remote changes arrive, which need to be applied to Lexical's editor state without triggering Yjs to broadcast the same changes back. The solution uses a transaction flag that distinguishes local edits from remote sync updates.

**Offline to online transition**: When a client reconnects after being offline, it needs to sync its local Yjs document state with the server. Yjs handles this natively through state vectors: each client tracks what updates it has seen, and on reconnect it sends only the missing updates. The tricky part was ensuring IndexedDB persistence and Yjs state stayed in sync during this transition.

**Performance with large documents**: To stress-test the editor, I built a seeding system that loads full Gutenberg Project books into the editor. This revealed that naive rendering of large Lexical documents causes visible jank. The fix was virtualising the rendering so only visible paragraphs are in the DOM, while the full document model stays in memory.

## Outcome

Lattiq demonstrates local-first architecture with real-time collaboration in a production-quality editor. The core insight is that CRDTs eliminate an entire class of problems (conflict resolution, central authority, offline handling) by making the data structure itself convergent. Open two browser tabs, type in both, close one, reopen it, and everything is in sync with no manual intervention.
