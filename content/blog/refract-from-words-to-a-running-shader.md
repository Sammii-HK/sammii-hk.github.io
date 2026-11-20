---
title: "Refract: from a sentence to a running shader"
description: "How Refract turns a visual description into GLSL, checks the result before replacing the canvas, and separates a successful generation from a successful picture."
date: '2026-11-20'
draft: true
tags: [design-engineering, webgl, glsl, ai, creative-coding]
lab_url: "https://refract.sammii.dev"
---

A sentence such as “deep ocean bioluminescence” leaves an enormous amount unspecified. How dark is the water? Are the lights drifting or pulsing? Does the movement fill the screen, or happen in small pockets? Those omissions are part of what makes the sentence useful. It describes an impression without prescribing every pixel.

[Refract](https://refract.sammii.dev) turns that kind of description into a moving shader. You give it words, a model produces GLSL, and the browser runs the result on a plane that fills the viewport. The interesting engineering sits between those steps: the contract the model has to satisfy, the checks the renderer can make, and the distinction between valid code and a convincing visual response.

The [implementation](https://github.com/Sammii-HK/refract) makes a useful small case study because the interface is deliberately narrow. There is a prompt, a generate button, a handful of starting suggestions and the image itself. A restrained interface makes mistakes in the underlying system much harder to hide.

## The model writes a programme

Refract sends a description to a server route, which calls a text model through the AI SDK. The route selects Groq's `llama-3.3-70b-versatile` model and caps the generated output at 1,024 tokens.

The response is shader source. It is not a downloaded image, a video or a deterministic palette generated from a hash of the text. Once the source reaches the browser, time keeps advancing and the same programme produces new frames.

That gives the system a useful division of labour. The model makes a bounded creative decision once. The GPU then evaluates the programme repeatedly. Continuous movement does not require continuous model calls.

The [server route](https://github.com/Sammii-HK/refract/blob/main/app/api/shader/route.ts) validates the request with a small schema: `description` must be a string between one and 500 characters. The system prompt constrains the output to raw GLSL with known uniforms, a defined entry point and no surrounding explanation. There is very little room for the rest of an application to leak into the response.

## Three inputs are enough to make something alive

The generated shader can read time, resolution and mouse position. Each has a clear job.

Time changes the image without needing a new prompt. Resolution lets the shader convert fragment coordinates into a useful space. Mouse position gives the viewer a possible influence on the result, although the generated programme has to use it for that influence to appear.

Here is a small illustrative shader using the same uniform names. It is written for this explanation, not presented as one of Refract's recorded generations:

```glsl
precision mediump float;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 p = (uv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);
  vec2 centre = vec2(sin(uTime * 0.4), cos(uTime * 0.3)) * 0.12;
  float glow = 1.0 - smoothstep(0.05, 0.4, length(p - centre));
  vec3 dark = vec3(0.01, 0.03, 0.05);
  vec3 light = vec3(0.1, 0.8, 0.65);
  gl_FragColor = vec4(mix(dark, light, glow), 1.0);
}
```

There is no animated object in that code. The programme evaluates distance from a moving centre and uses the result to choose a colour. A fragment shader can create the impression of objects through a calculation performed across the image. The [WebGL shader tutorial](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_shaders_to_apply_color_in_WebGL) provides the underlying distinction between vertex processing and fragment colour.

The unused mouse uniform is intentional in this example. Declaring an input makes it available; it does not prove the picture responds to it.

## Prompting includes visual boundaries

The prompt does more than demand valid syntax. It describes failures of visual interpretation that matter to this particular tool.

A description containing “void” should remain predominantly dark. A request for something soft should not silently become a harsh neon grid. A named colour should survive the generation. These are practical constraints on the visual result, because an impressive animation can still be a poor answer to the prompt.

The source includes technique examples for stars, soft colour fields and fire. They narrow the model's search space, but they are guidance, not a visual test. Nothing in the route measures whether the output actually resembles an ocean or whether its motion feels gentle.

That is a useful boundary to keep visible in any generative interface. Syntax can be checked mechanically. Visual fit still requires looking. The model's confident completion of its task does not collapse those into one judgement.

## Check the candidate before replacing the picture

The [canvas component](https://github.com/Sammii-HK/refract/blob/main/components/ShaderCanvas.tsx) starts with a default animated shader. When a new candidate arrives, it first asks the graphics context to compile a temporary fragment shader. If compilation fails, the component reports the error and leaves the previous material in place.

The important sequence, shortened from that component, is:

```typescript
const candidate = gl.createShader(gl.FRAGMENT_SHADER);
if (!candidate) throw new Error("Could not allocate a shader");

gl.shaderSource(candidate, source);
gl.compileShader(candidate);
const compiled = gl.getShaderParameter(candidate, gl.COMPILE_STATUS);
const message = gl.getShaderInfoLog(candidate);
gl.deleteShader(candidate);

if (!compiled) throw new Error(message || "Shader compilation failed");

material.fragmentShader = source;
material.needsUpdate = true;
```

This reduced example adds a defensive allocation check. It is not the whole renderer. In particular, compiling a fragment stage does not prove that the final programme will link correctly with its vertex stage, run cheaply, or produce the intended picture.

Keeping the old image is still a valuable interaction decision. A failed attempt does not need to erase a successful result. The same pattern applies to generated layouts, edited images and code previews: prepare the candidate, test what can be tested, then replace the working state.

The current page updates its prompt label when the API responds, before the renderer has accepted the candidate. That exposes another useful design question. A label that claims what is on screen should ideally belong to the accepted image, rather than merely the most recent request.

## A text repair is not a language parser

Before returning the source, the route removes Markdown fences and applies a regular expression intended to add decimal points to integer literals used in floating point expressions. That addresses a plausible generation mistake, but it is a heuristic.

GLSL has a grammar and types. A text substitution cannot reliably know whether a number belongs to a loop counter, an array index or a floating point expression. The compile check remains necessary after the repair. A more robust version would use structured generation or parsing, then feed a bounded compiler error back for a retry.

There is a version boundary here too. The prompt asks for WebGL 1 style shader syntax, while the repository depends on Three.js r183. Modern [Three.js WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html) uses WebGL 2. The requested shader vocabulary and the renderer's supported contexts are separate contracts; the prompt alone does not establish WebGL 1 browser support.

## Pixels have a cost and a coordinate system

Refract sets the renderer's pixel ratio from the device, while its resolution uniform uses the viewport's CSS dimensions. On a dense display those are different units. A shader using `gl_FragCoord` needs a resolution in drawing-buffer pixels, or it can interpret its coordinate range incorrectly. Three.js exposes `getDrawingBufferSize()` for precisely that physical-pixel measurement.

This is also a performance decision. Doubling both dimensions produces four times as many fragments. A complex generated shader can make a high-density fullscreen canvas expensive even though the JavaScript component is small. A pixel-ratio cap, a lower-resolution preview, a pause control and a limit on shader complexity would be sensible next constraints. I would measure before attaching a frame-rate claim to any of them.

Motion also needs an exit. The current source continuously advances time; it does not implement a reduced-motion mode. A static frame or an explicit play control would let the visual remain available without requiring everyone to watch an endless animation.

## What the experiment makes clear

Try two related descriptions in Refract: one that specifies only a subject, then another that adds palette, pace and density. Look separately at whether the result compiles, whether it preserves the request, and whether you actually like it. Those are three different evaluations.

The project makes the relationship between language and a visual system unusually direct. Words become a programme with a small set of inputs. The renderer decides whether parts of that programme are valid. A person decides whether it expresses anything worth keeping. The strongest next version would make each of those decisions equally visible.
