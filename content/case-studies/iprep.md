---
title: "iPrep"
description: "A learning playground for engineers that teaches before it tests, runs real JavaScript and TypeScript in the browser, keeps private work in sync, and still has a home for spoken interview practice"
techStack: "Next.js, React, TypeScript, Web Workers, TypeScript compiler API, Prisma, PostgreSQL, Cloudflare R2, Sign in with Apple, Llama 3.3 70B, Whisper"
---

## What it is

iPrep began in November 2025 as an interview coach: you answer a question out loud, it transcribes you, and it gives feedback on what you said and how you said it. I wrote about that first version in [I built an AI interview coach that scores your delivery and your answers](/blog/i-built-an-ai-interview-coach-that-scores-your-delivery-and-your-answers/). Saying an idea well turned out to be the last step. The steps before it are understanding the idea, trying it, getting it wrong in an instructive way, and returning to it with less help.

So iPrep is now a learning playground for engineers at [iprep-five.vercel.app](https://iprep-five.vercel.app), with interview practice alongside it: a Daily Mix, Quick Five or Deep Dive across frontend, AI engineering, design systems and architecture; missions that follow one problem through several roles; a feature studio with a real TypeScript model, React component and CSS; and a systems studio where you break and repair a small delivery pipeline. You can try the playground without an account.

## Teach first, then ask

The first playground was built around hints: a puzzle, and up to three nudges if you were stuck. Using it myself, I found it confusing, getting stuck was not fun, and hints did not reliably teach the idea. A hint helps you finish one puzzle; it does not give you a model of why the answer is right.

The rewrite follows one sequence everywhere: a clear goal and a first action, a worked example on different data, a small action of your own, feedback that explains the cause of what you saw, and only later, unfamiliar practice on your own. The worked examples are deliberately not your board, so following one cannot be the same as solving yours. Here is the start of the tree example:

```ts
example: 'A different tree: why can 12 be wrong even though it is larger than its parent 5?',
steps: [
  { picture: '      10\n     /  \\\n    5    15\n     \\\n      12', why: 'The root is 10. Everything anywhere in its left subtree must stay below 10.' },
```

Feedback explains the exact tile you chose using the puzzle's own rule, not just whether it was in the answer. For the binary search tree, `explainStructureTile` walks from the root to your tile carrying lower and upper bounds, so it can say a node is larger than its parent but breaks an ancestor's limit. Tiles are named by number, row and column, because labels can repeat.

## Evidence of how much help you used

Once a lesson can teach, the scheduler has to tell the difference between "you did this" and "we did this together". Every completion records hints, misses and whether a code scaffold was shown, and the spacing depends on it:

```ts
const independent = draft.hints === 0 && draft.misses === 0 && !draft.scaffold;
...
const interval = independent
  ? [1, 3, 7, 14][Math.min(days.length - 1, 3)] * 86400000
  : 4 * 3600000;
```

An independent completion schedules the next review one, three, seven, then fourteen days out, depending on how many distinct days you have managed it alone. A supported one comes back in four hours. The record is also split by skill, so a pattern puzzle tracks recognition and reasoning separately and a slip in one does not hide progress in the other.

The mix comes from a priority score: anything due scores 200 plus a point per day overdue, unseen lessons get 80, a chosen focus adds 50, and lessons where you often needed help get up to 40. Each round is a trio of a visual activity, a coding exercise and a recall or transfer exercise, from three disciplines where possible. Ties are broken by a hash seeded with the date and the sessions you have finished, so the order changes from day to day, and prerequisites are checked before a lesson can be picked.

## Running your code without trusting it

The coding exercises run real JavaScript, which means running code I did not write inside my own site. It never runs in the page. Each run creates a hidden iframe with `sandbox="allow-scripts"` and no `allow-same-origin`, so it has an opaque origin with no access to cookies or storage. Its document carries a strict content security policy, inherited by the worker it starts:

```ts
export const RUNNER_CSP =
  "default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' blob:; worker-src blob:; connect-src 'none'; img-src 'none'; form-action 'none'; base-uri 'none'";
```

The page talks to the frame through a `MessageChannel`, and the frame runs your function in a Web Worker against each test case. An infinite loop is a common mistake, so the worker is terminated after 1.8 seconds with a nudge to check your loop boundaries, and the page abandons the frame after five. The result coming back is validated too, so a malformed reply is a runner error, never a pass.

Two details make the feedback more useful. Tests marked `unchanged` compare the inputs before and after the call, so a solution that sorts the array it was given fails with "Input mutated" even if its answer is right. And when two values differ beyond the visible preview, the message says so.

## A real TypeScript compiler in a worker

The feature studio goes further. You edit a model file and a React view, and the studio type-checks them with the actual TypeScript compiler, running inside a worker with an in-memory compiler host and bundled declarations for the standard library and React. There is no file system. `getSourceFile`, `readFile` and `writeFile` are all backed by a plain object.

The compiler runs in strict mode and refuses two shortcuts with their own diagnostics: `any`, and `@ts-ignore` or its relatives. Once it compiles, the worker renders your component into a linkedom DOM and drives it with real events: ticking a checkbox, submitting, delaying a save, replaying a slow reply.

The guided path has five checkpoints: local choice, controlled input, captured submission, reply ownership and accessible feedback. A check must return exactly the cumulative results it expects, and if your source changed while it ran, the result is discarded. A pass is stored as a receipt tied to the checked source and marked `assisted: true`; the full assessment stays separate, so guided work never counts as independent evidence.

## Which reply owns the screen

The homepage asks a question I like a lot: you type "cat", then "caterpillar", and the reply for "cat" arrives last. Which one should the screen show? The streaming lab teaches the same idea for AI answers that arrive in pieces. Its model is small enough to quote whole:

```ts
export function streamStep(state:StreamState,event:StreamEvent):StreamState {
  if(event.type==='start')return {...state,generation:state.generation+1,status:'streaming',text:'',sequence:0,error:null};
  if(event.generation!==state.generation||state.status!=='streaming')return state;
  if(event.type==='chunk'){
    if(event.sequence!==state.sequence+1)return state;
    return {...state,text:state.text+event.text,sequence:event.sequence};
  }
```

Each answer gets a generation number. A callback from an older generation cannot write into the new one, nothing reopens an answer that is complete, cancelled or failed, and only the next chunk in sequence is accepted, so a replayed event cannot repeat text. The lab runs the same scripted events through three policies, so you can see exactly which frame each weaker rule gets wrong.

The systems studio applies the same thinking to a backend: orders that commit stock, a receipt and an outbox entry together, events delivered twice when an acknowledgement is lost, and a worker that retries and finally dead-letters. A repeated order key with a different payload is a conflict, not a second order.

## Spoken practice and feedback

The original practice flow is still there: Whisper Large V3 Turbo transcribes through DeepInfra and Llama 3.3 70B assesses the answer, with OpenAI models as the fallback. One small module decides which provider and model are used, so the model that scored an answer and the record of which model scored it cannot drift apart.

Delivery is measured in code, not by the model. Filler detection is context-aware: "um", "erm" and "you know" always count, but "like" only counts when it is not a comparison, so "looks like a database" is fine and "it was like, um" is not. "So" only counts at the start of a sentence, and "well" not in "as well". Long pauses come from word timestamps: a gap over 600 milliseconds counts once, and every further half-second past 1.5 seconds counts again. The threshold used to be 800 milliseconds and was lowered to catch more pauses.

The scoring prompt is also told when not to use STAR. Situation, task, action and result fit "tell me about a time when", but not "what is a closure", so factual and definition questions are scored on clarity, completeness and organisation instead.

## Private audio

Each question bank can have a study episode, an MP3 and transcript generated ahead of time with Kokoro text-to-speech and stored in Cloudflare R2. The key is built only from an authorised bank id, and even an admin does not inherit access: the route only finds a bank owned by the signed-in user, and responses are `private, no-store`.

The route supports a single byte range, parsed strictly, so the iOS player can seek without downloading the whole episode. It reads the object's ETag first and passes it as `IfMatch` on the read, so if an episode is regenerated halfway through someone listening, the request fails rather than splicing bytes from two different files.

## Private workspaces that sync

Mission notes, feature studio source and systems studio progress are private workspaces, saved in the browser and, if you opt in, synced to your account. The server refuses any code or notes until you have.

The client decides what to do with a three-way comparison between your local copy, the last revision both sides agreed on, and the server's copy:

```ts
if (localHash === incoming.hash) return { kind: 'aligned', baseline: { revision: incoming.revision, hash: incoming.hash } };
if (!baseline) return workspaceHasWork(document) ? { kind: 'conflict', local: document, remote: incoming } : { kind: 'pull', remote: incoming };
if (incoming.revision === baseline.revision) return { kind: 'push', baseRevision: baseline.revision, document };
if (localHash === baseline.hash) return { kind: 'pull', remote: incoming };
return { kind: 'conflict', local: document, remote: incoming };
```

Client clocks never choose a winner: if both sides changed, it is a conflict and you keep both. Locally, the baseline is only a revision id and a SHA-256 hash, not a second copy of your work.

On the server, every write names the revision it was based on and carries a fresh mutation id. It runs in a serialisable transaction and only succeeds if that revision is still current. A retry with the same id and content gets the original receipt back; the same id with different content is refused. Stored documents are checked against their hash on every read, and an epoch number lets sync history be reset safely. Each request also carries the account id the browser expects, and the server pauses sync if the signed-in account has changed underneath it. Almost every error message ends the same way: your local work is kept.

## Sign in with Apple, once for web and native

Sign in with Apple on the web shares one account resolver with the native app. A known identity signs straight in; a new one needs an invitation or a short-lived link code from an account already signed in on the web, so accounts are never joined by matching email addresses.

The web flow uses Apple's form post response mode, which taught me something about cookies:

```ts
// Apple returns a cross-site POST, so Lax would silently discard the browser binding.
response.cookies.set(APPLE_WEB_COOKIE, sealAppleFlow(flow, process.env.JWT_SECRET!), { httpOnly: true, secure: true, sameSite: 'none', path: '/', maxAge: APPLE_WEB_TTL });
```

The cookie holds a signed record of the state, a browser binding and a nonce. On the way back, the request is claimed atomically before the code is exchanged, so a replayed or parallel callback cannot sign anyone in, and it never silently switches you from another signed-in account.

## Light and dark

iPrep follows the system setting by default, with a System, Light or Dark choice. A tiny script in the document head sets the theme before the first paint, and still respects the system if storage is blocked. After that, a provider built on `useSyncExternalStore` listens to the colour scheme media query and to `storage` events, so a change in another tab applies here, and keeps the `theme-color` meta tags in step. The feature studio preview needed its own fix: its sandboxed frame showed a white canvas in dark mode until it declared `color-scheme: light dark` and used the system `Canvas` and `CanvasText` colours.

## A bug the strictness caught

Saved state is validated against a schema, and progress that does not match the current lessons is refused rather than quietly awarded. That strictness has bitten me once: a finished streaming session failed to save because a perfectly good 136-character explanation ran into a 100-character limit. The limit is now 1,000 characters, with a comment saying why, and the session recovered without a reset.

## What it taught me

iPrep taught me that a learning product is mostly bookkeeping about honesty. The interesting engineering is everything that keeps the record true: a worked example that cannot pass as your answer, a hint that changes the schedule, a stale reply that cannot take the screen, a sync that would rather show you two copies than guess, and a run that cannot touch the page it came from.
