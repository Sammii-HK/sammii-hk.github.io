---
title: "Local-first collaborative editing with Yjs CRDTs: an editor that survives the Tube"
description: >-
  Most collaborative editors break the moment the connection drops. Lattiq does
  not, because the source of truth is the user's own browser. This is how to
  wire Yjs CRDTs, IndexedDB persistence, and an optional WebSocket into an
  editor that works offline first, online second.
date: '2026-05-13'
tags:
  - typescript
  - crdts
  - yjs
  - local-first
  - collaborative-editing
draft: false
---
The question that started Lattiq: why do collaborative editors all feel so brittle? You open Google Docs on the Tube, it spins until you come back above ground, and sometimes it eats your last sentence on the way. The whole assumption is that the server is canonical. Your browser is a dumb terminal that happens to have some cached pixels.

Local-first reverses that assumption. The canonical document lives in your browser. The server, if there is one, is an optimisation: a way to sync with other collaborators when both of you happen to be online. When you go offline, nothing is lost because nothing was ever relying on the connection. When you come back, the CRDT handles the merge without a server arbitrating.

Lattiq is an editor built on that premise. Lexical handles the editing, Yjs handles the CRDT, IndexedDB handles the local persistence, and a thin WebSocket layer handles the sync. This post is how those pieces fit together and why each one is load-bearing.

---

## CRDTs in one paragraph

A CRDT is a data structure with a mathematical property: any two copies that have seen the same set of edits will converge to the same state, regardless of the order in which the edits arrived. You can make changes offline, I can make changes offline, we come back online, our two divergent copies merge automatically, and neither of us needs a central server to resolve the conflict. For text specifically, Yjs uses a position-based structure (Yjs calls it Y.Text, built on YATA) that keeps each insert pinned to its logical position, not its character index, so two people typing in the same paragraph do not overwrite each other.

The alternative is operational transform, which is what Google Docs uses. OT also converges, but only with a central server that orders every operation. If the server is down, you cannot meaningfully edit. CRDTs do not need that arbiter.

For a local-first editor, the CRDT choice is what makes the rest of the architecture possible. Without it you would have to build a conflict resolution UI, and nothing kills a collaborative product faster than a conflict resolution UI.

## The initialisation order

The whole thing hinges on getting one sequence right:

1. Create the Y.Doc (empty, in memory)
2. Load from IndexedDB into the Y.Doc
3. **Wait** for IndexedDB to finish loading
4. Only then render the editor
5. Only then connect the WebSocket

If you render the editor before IndexedDB has finished loading, Lexical bootstraps on an empty document. IndexedDB's content arrives a moment later and merges into the empty doc, which causes visible flicker, lost cursor position, and sometimes duplicated content. If you connect the WebSocket before IndexedDB loads, you get a race between remote content arriving and local content loading, and which one wins depends on network latency.

The Lattiq hook does this sequence explicitly:

```typescript
export function useCollaboration(docId: string) {
  const [isReady, setIsReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('loading-local');

  const docRef = useRef<Y.Doc | null>(null);

  useEffect(() => {
    const doc = new Y.Doc();
    docRef.current = doc;

    // Dynamic import because IndexedDB only exists in the browser
    import('y-indexeddb').then(({ IndexeddbPersistence }) => {
      if (docRef.current !== doc) return; // Guard against StrictMode

      const persistence = new IndexeddbPersistence(`lattiq-doc-${docId}`, doc);

      persistence.on('synced', () => {
        setIsReady(true);
        setSyncStatus('local-only');
        connectWebSocket(doc, docId); // Now, and only now
      });
    });

    return () => {
      docRef.current = null;
      doc.destroy();
    };
  }, [docId]);
}
```

Two small details worth flagging. The dynamic `import('y-indexeddb')` is because IndexedDB does not exist during server rendering in Next.js; a top-level import would crash the build. The guard `if (docRef.current !== doc) return` is for React StrictMode, which double-invokes effects in development to catch stale closures. Without the guard, the cleanup from the first invocation runs while the second invocation is still loading IndexedDB, and the wrong Y.Doc gets persisted.

Each document gets its own IndexedDB database, named `lattiq-doc-{id}`. This keeps them cleanly isolated and means deleting a document is a single `indexedDB.deleteDatabase` call.

## The Provider abstraction

Lexical's `CollaborationPlugin` takes a Provider, which is an object that implements `connect()`, `disconnect()`, event subscription, and exposes an `Awareness` instance for cursor state. The normal implementation is a WebSocket provider that talks to a Yjs-aware server. Lattiq uses two: a real WebSocket provider when the server is reachable, and a `LocalProvider` stub when it is not.

The `LocalProvider` looks like this:

```typescript
export class LocalProvider implements Provider {
  awareness: ProviderAwareness;
  private listeners = new Map<EventType, Set<EventCallback>>();

  constructor(doc: Doc) {
    this.awareness = new Awareness(doc) as unknown as ProviderAwareness;
  }

  connect(): void {
    setTimeout(() => {
      this.emit('status', { status: 'connected' });
      this.emit('sync', true);
    }, 0);
  }

  disconnect(): void {
    this.emit('status', { status: 'disconnected' });
  }

  // standard event emitter methods...
}
```

It immediately reports "synced" and "connected" because there is nothing to sync with. The Awareness instance is real, so even in offline mode the local cursor renders correctly. To the rest of the editor code, there is no difference between running offline against a `LocalProvider` and running online against a WebSocket provider. That interchangeability is the point of the abstraction.

The factory passed to Lexical picks one or the other:

```typescript
const providerFactory = useCallback((id, yjsDocMap) => {
  const doc = docRef.current!;
  yjsDocMap.set(id, doc);
  if (wsProviderRef.current) {
    return wsProviderRef.current as unknown as Provider;
  }
  const provider = new LocalProvider(doc);
  localProviderRef.current = provider;
  return provider;
}, []);
```

Both providers are backed by the same `Y.Doc`. Switching between them does not fork the document.

## The sync status state machine

Users need to know whether their changes are saved. The naive approach is a "saved" / "unsaved" boolean, which hides too much nuance. Lattiq exposes a five-state machine:

```typescript
export type SyncStatus =
  | 'loading-local'  // IndexedDB is loading saved content
  | 'local-only'     // Working offline, no server connection
  | 'syncing'        // WebSocket connected, initial sync in progress
  | 'synced'         // Fully synced with the server
  | 'offline';       // Was connected, now disconnected
```

The distinction between `local-only` and `offline` matters. `local-only` means we never successfully connected this session, so the user is offline but has not lost anything. `offline` means we were connected, then the connection dropped, so any changes made after the drop are queued locally and will upload on reconnect.

The state transitions are driven by the WebSocket provider's status events:

```typescript
provider.onStatus((status) => {
  switch (status) {
    case 'connected':
      setSyncStatus('syncing');
      break;
    case 'disconnected':
      setSyncStatus((prev) =>
        prev === 'synced' || prev === 'syncing' || prev === 'offline'
          ? 'offline'
          : 'local-only'
      );
      break;
  }
});

provider.onSync((synced) => {
  if (synced) setSyncStatus('synced');
});
```

Flickering between statuses on a flaky connection is worse than a wrong status, which is why `connecting` and `reconnecting` events do not change the UI. The display only updates on resolved transitions.

## Awareness: the forgotten half of CRDTs

Yjs ships with a second protocol on top of the document CRDT: Awareness. Awareness tracks ephemeral state (cursor position, user name, user colour, selection range) that does not need to be part of the persistent document. It broadcasts on the same WebSocket channel but is stored in memory, not in the Y.Doc.

The consequence is that when you reconnect, the document merges with the server, but the Awareness state resets. That is the right default: stale cursors from two hours ago are not useful. But it means you have to re-broadcast your Awareness state on every reconnect, which the providers handle automatically as long as you set it once on connect:

```typescript
provider.awareness.setLocalStateField('user', {
  name: `User ${doc.clientID % 100}`,
  colour: getRandomColour(),
});
```

`doc.clientID` is a random number Yjs assigns per document session. Using it modulo 100 gives a short, stable display name for the session without requiring auth. Real authentication would replace this with the user's actual name and a persistent colour per user.

One oddity worth knowing: `@lexical/yjs` internally expects the cursor colour field to be named `color` (American spelling, at the top level of awareness state) because that is what Lexical's `initLocalState` writes. Lattiq uses `colour` in its own `user` sub-object for the custom presence UI, but passes `color` via the CollaborationPlugin prop for the cursor rendering. Two spellings for the same value, different consumers, both required.

## What the WebSocket server has to do

The WebSocket server is surprisingly simple: it maintains one Y.Doc per room (in memory plus a backing store), and on each incoming Yjs binary message, it applies the message to the room's Y.Doc and broadcasts it to every other client in the room.

Yjs provides the `y-websocket` package, which is a reference implementation. Lattiq uses a thin wrapper over that plus a custom reconnection strategy (capped at `maxReconnectAttempts: 10`, exponential backoff) because the default tries forever and eats battery on mobile.

The room is namespaced by document ID (`doc-${docId}`), so different documents are completely isolated. A user in one document cannot see or affect another.

## What this architecture gets you

A flaky tube journey that would break a Google Docs session does nothing to a Lattiq session. The editor stays responsive the whole time. Changes save locally instantly. When the connection comes back, the sync happens in the background and the UI moves from `offline` to `syncing` to `synced` without interrupting the user.

More importantly, the offline case is not a degraded mode. It is the canonical mode. The server is the optimisation layer, not the source of truth. That inversion is what makes the whole architecture feel different from a traditional collaborative editor, and it is what makes local-first editors trustworthy in a way that purely online ones never quite are.

CRDTs are the thing that makes this possible. Everything else, IndexedDB, the Provider abstraction, the state machine, is just careful plumbing around the central guarantee: your edits converge with everyone else's, always, regardless of network conditions, and regardless of ordering.

An editor that survives the Tube is the minimum standard.
