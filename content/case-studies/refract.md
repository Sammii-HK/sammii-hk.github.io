---
title: "Refract"
description: "A shader workshop: start from a hand-written GLSL study, describe a mood and let a model write a fragment shader, or edit the source yourself, with every change compiled before it replaces the one that works"
techStack: "Next.js, TypeScript, Three.js, GLSL, WebGL 2, Vercel AI SDK, Groq"
---

## What it is

Refract is a small workshop for fragment shaders. You can open one of three studies I wrote by hand, describe a little atmosphere and have a language model write a shader for it, or open the source and change it yourself. Whichever you choose, the preview only ever shows a shader that compiled. If the new one fails, the last working one keeps playing and the compiler tells you why.

It lives at [refract.sammii.dev](https://refract.sammii.dev).

The interesting part is not the generation. It is everything around it: how much to trust text that a model says is GLSL, how to swap one GPU program for another without a blank frame, and how a well-meant regular expression taught me that shader source has types a string search cannot see.

## Three studies, written by hand

The workshop opens on a study rather than a prompt. All three share one header that declares the contract every shader in Refract follows: GLSL ES 1.00 style, writing to `gl_FragColor`, with three uniforms.

```ts
const uniforms = `precision mediump float;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;`;
```

Iridescent drift mixes a near-black ink with a lavender light along a slow diagonal sine wave. Soft rings is the one that listens to the pointer: it shifts its centre by a small fraction of the cursor offset, `p-=(uMouse-0.5)*0.12;`, so the rings lean towards you without chasing you. Copper bands is the one that matters for this story, because it has a loop:

```glsl
for(int i=0;i<4;i++){
 float band=sin(uv.y*10.0+float(i)*0.7+sin(uv.x*3.0+uTime*0.2));
 lines+=pow(max(0.0,band),12.0)*0.15;
}
```

The counter is an `int`, the arithmetic is `float`, and the conversion between them is explicit. That is exactly how GLSL ES 1.00 wants it. Raising each band to the twelfth power turns a soft sine into a thin bright line, so four of them read as engraved copper rather than a gradient.

The studies are labelled as mine in the interface, and their source is local. The preview label tells you where the current shader came from: a study, model output with the description you gave, or a local edit.

## The route that asks the model

Generate posts your description to `/api/shader`. The route is deliberately thin. Everything it decides is in a separate handler that takes the model call as a parameter, so the rules can be tested without ever reaching a provider:

```ts
return handleShaderRequest(request, {
  available: !!apiKey,
  generate: async (description) => {
    const groq = createGroq({ apiKey });
    const result = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system: SYSTEM_PROMPT,
      prompt: `Create a GLSL fragment shader for: ${description}. Match its colours and mood. Output raw GLSL only.`,
      maxOutputTokens: 2048,
      maxRetries: 0,
      abortSignal: AbortSignal.timeout(20000),
    });
    return result.text;
  },
});
```

Before the model is asked anything, the handler checks the body is JSON and that the description, once trimmed, is between 1 and 500 characters. If there is no API key configured, it answers 503 and says the studies and the editor still work. There are no retries and a twenty second ceiling. A timeout comes back as a 504 with its own message, and any other failure becomes a 502 with a generic one, so whatever the provider said internally never reaches the page. Both of those messages end the same way: your last valid preview is still here.

The system prompt is where most of the constraint lives. It names the three uniforms exactly, fixes the entry point, asks for raw source with no markdown, and then spends most of its length on matching the mood: dark descriptions keep a dark background, soft ones stay pastel, and nothing defaults to a rainbow grid. It includes short technique examples for stars, mist and fire, because a worked pattern steers a model further than an adjective does.

## Checking what came back

A model that is told to output raw GLSL will still sometimes wrap it in a code fence, or answer with prose. The normaliser accepts exactly one shape of wrapping and nothing else:

```ts
const fenced = source.match(
  /^```(?:glsl|frag|fragment)?\s*\n([\s\S]*?)\n?```$/i,
);
if (fenced) source = fenced[1].trim();
if (source.length > 50000)
  throw new ShaderResponseError("The shader source is too large to preview.");
if (!/\bvoid\s+main\s*\(/.test(source) || !source.includes("gl_FragColor"))
  throw new ShaderResponseError(
    "The response is not a WebGL 1 fragment shader.",
  );
```

The fence has to enclose the whole response. A shader with a `main` and a `gl_FragColor` passes; anything else is refused before it gets to the browser. The page runs the same function again on what it receives, so a response cannot skip the check by taking another path. The comment above the function is the whole lesson of the next section: remove only a whole response fence, and never guess the types of GLSL literals.

## The regular expression that broke loops

The first version of Refract, in March, cleaned model output with two global replaces that stripped every fence marker anywhere in the text. Nine minutes after the first build commit I was fixing a new problem: the model kept writing `2` where GLSL wanted `2.0`, and WebGL 1 does not convert between int and float for you. My fix had two halves. One was a rule in the prompt. The other was this, run over every response:

```ts
// Ensure all numeric literals used in float arithmetic have a decimal point.
glsl = glsl.replace(/([+\-*\/,(=<>]\s*)(\d+)(?!\.\d*|\d)(\s*[+\-*\/,);])/g, "$1$2.0$3");
```

It finds a run of digits between an operator and another operator or bracket, and appends `.0`. It does turn `uv.x * 2 + 1.0` into `uv.x * 2.0 + 1.0`. The trouble is that it has no idea what type the surrounding expression needs. Had my Copper bands loop gone through that route, it would have come out like this:

```glsl
for(int i=0.0;i<4.0;i++){weights[i]=float(i)*1e-3.0;}
```

`int i=0.0` assigns a float to an int. `i<4.0` compares an int with a float. Both are compile errors in GLSL ES 1.00, so a correct loop became a broken one. `1e-3` became `1e-3.0`, which is not a number at all. And because each match consumes the operator after it, the next literal cannot use that operator as its own prefix: `uv.x * 2 + 1;` becomes `uv.x * 2.0 + 1;`, fixing one literal and missing the next. The rewrite broke valid code and still left invalid code behind.

A regex sees characters. Whether `4` should be `4` or `4.0` depends on the declared type of the thing it is compared with, which is a question for a parser, and the only parser that matters here is the GPU driver's. So the current version does not touch literals at all. The prompt rule grew a second half that tells the model to keep loop counters, array sizes and indexes as integers and convert with `float(i)` when mixing them in, and the compiler is the judge. The test for the normaliser feeds it a shader with an integer loop, an indexed array and an exponent literal, and asserts it comes back byte for byte identical, with and without a fence around it.

## Compile, link, then swap

The preview compiles before it swaps, and it does it twice. The first check uses the raw WebGL context to compile both stages and link them into a program, and always releases what it allocated, whatever happens:

```ts
program = gl.createProgram();
if (!program) return "The GPU could not allocate a shader program.";
for (const shader of shaders) gl.attachShader(program, shader);
gl.linkProgram(program);
return gl.getProgramParameter(program, gl.LINK_STATUS)
  ? null
  : gl.getProgramInfoLog(program) || "Shader linking failed.";
```

The original March version only compiled the fragment stage, showed the first line of the log, and then set the new source on the live material. If Three.js then failed to build its own program, there was nothing left to fall back to. Three.js does build its own program: on WebGL 2 it wraps the source in its own prelude, so a shader that passes the raw check is not guaranteed to pass inside the renderer. The second check renders one frame with the candidate material while listening on Three's shader error hook:

```ts
renderer.debug.onShaderError = (gl, program, vertex, fragment) => {
  pipelineError =
    [
      gl.getProgramInfoLog(program),
      gl.getShaderInfoLog(vertex),
      gl.getShaderInfoLog(fragment),
    ]
      .filter(Boolean)
      .join("\n") || "The renderer could not link this shader.";
};
```

If that reports anything, the mesh gets its previous material back, the candidate is released, the old shader is redrawn and the full log goes to the page. Only when both checks pass does the new material become current and the old one get disposed.

That gives the page three separate pieces of source: the draft in the editor, the candidate being checked, and the active shader on screen. Typing never touches the preview until you press Apply. Save shader downloads the active source as `refract.frag`, so it can only ever save something that compiled, never the broken draft you were halfway through.

## Owning the GPU work

Every Three.js object the preview creates is registered with a small resource scope. `own()` hands back a release function that is safe to call twice, and disposing the scope releases everything in reverse order, catching each failure so one bad disposer cannot keep the rest alive. The renderer's own entry forces a context loss on the way out, so a remount does not leave an old WebGL context behind.

The animation loop holds at most one frame request, and it draws at most thirty times a second:

```ts
if (last !== null)
  elapsed += Math.min(0.1, Math.max(0, (now - last) / 1000));
last = now;
if (lastDraw === null || now - lastDraw >= 1000 / 30) {
  lastDraw = now;
  runtime.draw(elapsed);
}
```

Shader time is accumulated rather than read from a clock, and each step is clamped to a tenth of a second, so a stalled frame cannot make `uTime` jump. Pause and a hidden tab both cancel the pending frame, so a paused preview costs nothing. Pixel ratio is capped at 1.5, and `uResolution` is read from the drawing buffer rather than the CSS size, so `gl_FragCoord.xy / uResolution.xy` covers exactly zero to one. Pausing stops time but not the pointer: moving over a paused preview still updates `uMouse` and redraws once, so Soft rings can be nudged while it is still. If you ask your system for reduced motion, the preview starts paused and follows that setting if it changes.

When WebGL 2 is not available at all, the preview says so and the source editor still works. If the context is lost later, the loop stops and the page asks for a reload rather than drawing into nothing.

## Light and dark

The workshop follows the visitor's colour scheme. Its colours are tokens on `:root`, with a lavender paper version under `prefers-color-scheme: light` and `color-scheme: light dark` so form controls and scrollbars follow. The one thing that does not change is the preview frame. A shader's background is part of the artwork, and Iridescent drift on a white surround reads as a different piece, so the frame keeps its dark gradient and border in both schemes. That decision is written into the stylesheet as a comment, which is where the next person to touch it will look.

## What it taught me

Refract started as a text box and a full-screen canvas. What it became is mostly about trust boundaries. Model output is a candidate, not a shader, until a compiler agrees. The editor's draft is a draft until it links. The only source you can save is the one already running. And the most instructive commit in the history is a fix that made things worse: a regular expression cannot know that `0` in `int i=0` is correct, because the information it needs is a type, and types live in the grammar, not in the characters.
