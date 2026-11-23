---
title: "Conjure"
description: "An image-prompt studio that turns one brief into three directions for Midjourney, FLUX or DALL·E, keeps a library in the browser or an account, and places prompts into Midjourney from a Chrome extension"
techStack: "Next.js, TypeScript, Turborepo, Groq (Llama 3.3 70B), Vercel AI SDK, Zod, Prisma, Better Auth, Chrome Extension MV3"
---

## What it is

Conjure is the prompt studio I use for my own image work. I write a brief in plain English, choose an image tool and a composition, and it gives me three directions: a straightforward one, a creative one and an experimental one. I can refine any of them with a follow-up instruction, save the ones I like, rate them, favourite them and remix them later. There is also a Chrome extension that opens the same studio as a side panel on midjourney.com and can place a prompt straight into Midjourney's prompt field.

It is live at [conjure-two.vercel.app](https://conjure-two.vercel.app). The thinking behind the per-model prompt guidance is in [Prompt engineering for Midjourney, FLUX, and DALL-E: where they diverge](/blog/prompt-engineering-diverges-by-model/).

The interesting work in Conjure is not the model call, which is a few lines. It is everything around it: making the model's output a contract rather than a hope, deciding which part of a prompt the model is allowed to write, letting someone without an account keep a library, and getting text from an extension iframe into someone else's page without trusting every message that passes by.

## One monorepo, two clients

Conjure is a pnpm and Turborepo monorepo with two apps. `apps/web` is the Next.js studio and API. `apps/extension` is a Manifest V3 extension built with Vite and React. The extension has no generation logic of its own: it calls the same `/api/generate` endpoint as the studio, so there is exactly one place where prompts are made.

## The model returns data, and the data is checked

Generation runs on Llama 3.3 70B through Groq, using the Vercel AI SDK's `generateText` with a ceiling of 2,000 tokens. The system prompt asks for a JSON object with exactly three labelled variations. Asking is not the same as getting, so the reply goes through a Zod schema before anything reaches the browser:

```ts
const modelOutput = z
  .object({
    variations: z
      .array(
        z.object({
          label: promptLabel,
          prompt: z.string().trim().min(1).max(8000),
        }),
      )
      .length(3),
  })
  .refine((value) => new Set(value.variations.map((v) => v.label)).size === 3);
```

The array has to have three items, and the `refine` makes sure they are three different labels, so two "creative" variations and no "safe" one is rejected rather than shown. The parser also accepts a reply wrapped in a Markdown code fence, because models do that even when told not to, and it returns the variations in a fixed order, safe, creative, experimental, whatever order the model used. If any of this fails, the route answers with a 502 and a plain sentence: the model did not return all three prompt directions, try again.

The first version was more forgiving. If `JSON.parse` failed, it grabbed the first thing that looked like an object with `text.match(/\{[\s\S]*\}/)` and mapped over whatever `variations` it found. It worked most of the time, which is the worst kind of working: when it failed, it failed somewhere further down. Moving the check to the boundary turns a bad reply into one clear error instead of a broken card.

The extension panel repeats a lighter version of the same check on what the API sends back, so it says the reply was incomplete rather than rendering half a result.

## The model writes the image, code writes the syntax

Midjourney wants its aspect ratio as a flag at the end of the prompt. That flag is not creative work, and a language model asked to include it will sometimes get it subtly wrong. So the system prompt tells the model not to write technical parameters at all, and code appends them afterwards:

```ts
export function appendParams(prompt: string, platform: Platform, orientation: Orientation) {
  const params = PLATFORM_PARAMS[platform][orientation];
  return platform === "midjourney"
    ? `${prompt.replace(/\s*--(?:ar|aspect)\s+\d+(?:\.\d+)?:\d+(?:\.\d+)?/g, "").trim()} ${params}`
    : prompt;
}
```

The regular expression is there because instructions are not always followed. If the model slips in its own `--ar` or `--aspect`, with whole or decimal ratios, it is removed before the chosen one is added, so a prompt never carries two conflicting ratios. Portrait is `--ar 9:16`, square `--ar 1:1`, landscape `--ar 16:9`.

FLUX and DALL·E get nothing appended. Their prompts are natural language, and the system prompt for each says so: FLUX is told to avoid Midjourney syntax entirely, DALL·E to be concrete and explicit about style. For every tool the composition still goes into the user prompt as words, "portrait, 9:16" and so on, along with a line saying the image dimensions are chosen in the image tool itself.

This is one of the places where the history is useful. The first version appended `--ar 9:16 --v 6.1 --stylize 750` to every Midjourney prompt, and `--ar` flags to FLUX prompts as well. That pinned a model version and a stylisation value I had picked once, on every prompt, and gave FLUX a flag it does not read. The released version appends only the one parameter that follows directly from a choice the person made.

The first system prompt also described the safe direction as one that "will definitely work". Nothing about a text prompt can promise that, so it now says what it is: a straightforward interpretation of the brief, and not a guarantee of image quality.

## Style profiles

The style profile dropdown adds a short line of art direction to the system prompt. Each profile is a plain string, one per social account I make images for, for example "cosmic astrology visuals, deep space blues and purples, celestial bodies, modern minimal spiritual, clean editorial" for Lunary. The request schema is an enum of the profiles that exist, so the field cannot be used to put arbitrary text into the system prompt.

## Refining without losing the brief

Refinement sends the original brief and settings back with two extra fields: `basePrompt`, the variation being refined, and `refinement`, the instruction. The user prompt is assembled from those parts (shortened here):

```ts
return `Brief: ${input.brief}\nComposition: ${composition}.${input.basePrompt ? `\nReference prompt: ${input.basePrompt}` : ""}${input.refinement ? `\nRefinement: ${input.refinement}` : ""}\nReturn three prompt directions. ...`;
```

So a refinement is three new directions anchored to both the brief and the prompt I liked. The studio refines from the settings of the original generation rather than whatever the form says now, so changing the dropdowns after generating does not quietly change what a refinement is based on. Remix in the library uses the same `basePrompt` field: a saved prompt opens the studio with its text as the reference.

## A library for people without an account

The original generation route had a comment saying persistence would come with auth. Without a signed-in user it returned IDs like `temp_` followed by a timestamp, which the save endpoint had no way to store. The save button existed, and saving could not work.

The released version treats the browser as a real storage tier rather than a missing one. A response is either `storage: "account"` with database IDs, or `storage: "browser"` with IDs prefixed `guest_`. Browser saves live in `localStorage` under `conjure-library-v1`, and every record is validated with Zod when it is read back.

Saving is idempotent. The ID is built from the iteration and the label:

```ts
const id = `local:${iterationId}:${variation.label}`;
const existing = prompts.find((item) => item.id === id);
if (existing) return existing;
```

Pressing save twice gives one entry, not two. If the stored JSON is corrupt, the read throws a sentence that says the saved prompts could not be read and have not been overwritten, and nothing writes over them. If the browser refuses a write, usually because storage is full, the message suggests copying the prompt somewhere else.

The client functions take a prompt and branch on its storage, so the library UI does not care where a prompt lives: rating, favouriting and removing call the same function either way. The library page reads browser saves first and shows them straight away, then asks `/api/prompts` for account saves. A 401 there just means nobody is signed in, and the browser list stays as it is.

## Accounts, and checking who owns what

Accounts use Better Auth with email and password, on Prisma and PostgreSQL. Every database query includes the user ID, not just the record ID:

```ts
const changed = await prisma.prompt.updateMany({
  where: { id, userId },
  data: patch,
});
```

`updateMany` with both fields returns a count, so a prompt that belongs to someone else looks exactly like a prompt that does not exist: a 404. The same rule covers generation sessions, iterations and collections. When a signed-in refinement names a session, the route checks that the session belongs to the user first, and the session and its new iteration are written in one transaction.

The auth route checks its own configuration. If the auth secret or the database URL is missing, it answers with a 503 that says accounts are unavailable and saved prompts are still in this browser, and the studio carries on in browser mode. In the same spirit, without a Groq key the studio still loads and says generation is unavailable, instead of failing on every click.

The handlers take their dependencies as arguments: who the user is, whether a session is owned, how to persist, how to generate. The routes pass in Prisma and Groq; the tests pass in small fakes, so ownership, guest IDs, rejected model output and refinement context are tested without a database or a model call.

## The Chrome extension

The extension's content script runs on midjourney.com. It adds a toggle button and an iframe that loads the extension's own panel page. The panel is a small React app with the same brief, profile, tool and composition fields, three results, copy, refine, and a button labelled "Place in Midjourney".

The first version of the content script loaded `http://localhost:3000` into the iframe, which only worked on my machine, and listened for messages like this:

```ts
window.addEventListener("message", (event) => {
  if (event.data?.type === "CONJURE_INJECT_PROMPT") {
    injectPromptIntoMidjourney(event.data.prompt);
  }
});
```

Any script on the page, or any other frame, could post that message and write into the prompt field. The released version bundles the panel inside the extension and checks both ends of the conversation:

```ts
export function trustedMessage(event, source, origin): boolean {
  return (
    source !== null &&
    event.source === source &&
    event.origin === origin &&
    typeof event.data === "object" &&
    event.data !== null
  );
}
```

The content script only accepts messages whose source is its own iframe's window and whose origin is `chrome-extension://` plus the extension's ID. The panel only accepts the reply when it comes from its parent window with the origin `https://www.midjourney.com`. Each side also posts with an explicit target origin instead of `"*"`. The prompt itself must be a non-empty string of at most 10,000 characters, and the tests cover the hostile cases: another window, another origin, a null source and a null payload.

Placing the text has its own catch. Midjourney's field is controlled by a framework, so setting `input.value` directly can be undone by the framework's own state. The released script calls the native value setter from the prototype and then dispatches an `input` event, which is the event a framework listens for:

```ts
Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")
  ?.set?.call(input, prompt);
input.dispatchEvent(new Event("input", { bubbles: true }));
```

For a `contenteditable` field it sets the text and sends an `InputEvent` with `inputType: "insertText"`. It never presses enter or clicks anything. The panel tells you the prompt has been placed and to review it before generating an image, and if the field cannot be found it says so and suggests copying instead. Midjourney's markup is not mine and can change, so the honest fallback matters as much as the happy path.

The manifest is narrow. The only permission is `storage`, used to remember whether the panel was open. Host permission covers only `conjure-two.vercel.app`, which is what lets the panel call the API from an extension page, and the content script and web-accessible resources match only midjourney.com. The toggle carries `aria-expanded`, Escape closes the panel and returns focus to the toggle, and the hidden panel is also set `inert` so keyboard focus cannot wander into it. It is built from the repo and loaded as an unpacked extension.

## Light and dark

The studio follows the visitor's system setting. Colours are RGB triplets in CSS custom properties, with the original dark palette as the default and a lavender-white palette under `prefers-color-scheme: light`. Tailwind reads them as `rgb(var(--accent) / <alpha-value>)`, which matters because the interface uses opacity modifiers like `bg-accent/15` throughout, and those only work if the colour is stored as channels rather than a finished hex value. Form controls have their own, stronger border token in the light scheme, because a border that reads well on a dark card disappears on white. The browser's `theme-color` is set per scheme too, so the address bar matches.

## What it taught me

Conjure taught me to draw lines around the model. The model writes the creative part of a prompt and nothing else; code decides the syntax, checks the shape of the reply and decides what happens when it is wrong. It also taught me that "no account" is a design decision, not an absence. The first version treated a guest as someone whose work could not be saved. The released one gives them a real library, with the same buttons and the same error handling, that simply lives in their browser.
