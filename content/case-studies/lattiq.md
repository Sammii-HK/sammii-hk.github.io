---
title: "Lattiq"
description: "A collaborative rich text editor designed local-first around Yjs CRDTs"
techStack: "Next.js, Lexical, Yjs, WebSockets, TypeScript"
---

## The problem

Take a collaborative editor offline mid-sentence and most of them fall over: either the edit disappears, or you're staring at a merge conflict dialog the second the connection comes back. That's the deal most tools ask you to accept. Lattiq is designed to remove it: edits land locally first, editing keeps working with no network at all, and when a connection reappears the document reconciles with everyone else's changes, with no conflict resolution screen for the user to sit through.

## Architecture

### Yjs: convergence instead of conflict resolution

Sync is built on Yjs, a CRDT (Conflict-free Replicated Data Type) library. The property that matters is that concurrent edits from different clients are guaranteed to converge to the same result with no central authority adjudicating them. That's a different model from operational transform, which needs a server in the loop to resolve conflicting edits. It means two people can edit the same paragraph at the same time, even while one of them is offline, and when they reconnect the changes merge without either side's work being overwritten.

### A provider built for bad connections

Rather than use the stock WebSocket provider, Lattiq has its own. It reconnects with exponential backoff, sends heartbeats so a dead connection is noticed rather than assumed alive, and buffers updates made while offline so they are sent once the connection is back. Yjs state vectors do the rest: on reconnect each side sends only the updates the other has not seen.

### A room server

The collaboration server's job is rooms and relay. A document ID is the room; clients that open the same document join the same room, and the server relays Yjs updates between them. It also persists each document's Yjs state to disk, so a room survives everyone leaving.

### Why Lexical

The editor is built on Lexical, Meta's text editor framework, which supplies the content model, selection handling, and undo/redo stack. The toolbar covers headings, bold, italic, underline, lists, code blocks, quotes, and links. Lexical won out over ProseMirror and Slate on a cleaner API, stronger TypeScript support, and React integration that didn't need extra glue.

## Where it stands

The pieces above are built, but the binding between Lexical and Yjs is not live. Lexical's CollaborationPlugin hit a bundling bug between its dependency lib0 and webpack, so the live demo currently runs the editor with Lexical's own undo history and no sync. Rebuilding that binding is the next piece of work, and it is the hard part: remote Yjs changes have to be applied to Lexical's state without Lexical then broadcasting the same change back out.

Once it is live, the plan is to measure it rather than describe it: load time for a full-length book, the delay from a keystroke to it appearing on another client, and how edits made offline merge when a client reconnects.
