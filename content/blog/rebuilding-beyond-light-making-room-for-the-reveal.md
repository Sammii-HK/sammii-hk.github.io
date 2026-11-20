---
title: "Rebuilding Beyond Light: making room for the reveal"
description: "The Three.js implementation behind Beyond Light: a room made from planes, text revealed in a shader, and separate clocks for reading and bloom."
date: '2026-11-20'
tags: ['creative-coding', 'three-js', 'webxr', 'art']
draft: true
lab_url: 'https://beyond-light-vr.vercel.app'
---

The central event in Beyond Light is a change in what you can perceive. A room moves through colour, and writing that was hidden becomes visible. Rebuilding that event in a browser meant deciding which parts of the installation needed geometry, which needed a shader, and which depended on timing.

I have already written about [the original installation and its ideas](https://sammii.dev/blog/beyond-the-visible-uv-acetate-and-the-installation-i-painted). This is the implementation companion: how the [interactive version](https://beyond-light-vr.vercel.app) creates the room, stages the reveal and gives the viewer time to read before the desktop ending grows brighter.

The most consequential number in the renderer is not a colour value. It is the fifty-second reading interval between the ultraviolet phase settling and the bloom effect beginning. Making the text visible and making it overwhelm the image are separate events. They need separate clocks.

## Give the room only the geometry it needs

The scene is built from six inward-facing planes: four walls, a floor and a ceiling. The camera starts at the centre. This creates an enclosed space without importing a detailed architectural model or reconstructing every material of the physical installation.

The room in the current source is fourteen scene units wide. Those are coordinates for this implementation, not a statement about the dimensions of the original work. Four additional planes carry the text, sitting slightly inside the walls so their surfaces do not occupy exactly the same depth.

That small offset avoids making the renderer choose between coincident surfaces. Each text material is transparent and has `depthWrite: false`, so transparent parts of the text plane do not fill the depth buffer as though they were an opaque wall.

The walls use a custom fragment shader. A radial vignette makes the centre brighter than the edges, and three layers of smooth noise add variation. This gives the colour some texture without requiring a large photographic material.

It is deliberately economical geometry. Most of the experience comes from what changes across those surfaces and when it changes.

## Represent the journey as data

The spectrum sequence lives in a table of phase objects. It begins with a dark infrared phase, moves through seven visible colour labels, and ends in an ultraviolet-labelled phase. Each phase carries colour values, a reveal value and a duration. Transitions last 2,500 milliseconds and use an eased interpolation.

Keeping the sequence in data makes the timing available for inspection. Red has a longer hold than several of the following phases. The final phase has an infinite duration, so the journey does not immediately cycle back to the beginning. A separate advance control lets the viewer move the sequence forward.

The labels describe the artwork's progression. A conventional RGB display is rendering visible colours; it is not reproducing ultraviolet illumination or exposing the viewer to the wavelengths printed in the interface. The reveal is a visual interpretation of the installation's behaviour.

This distinction keeps the technical brief manageable. The browser needs to convey a transition from hidden writing to luminous writing. It does not need a physically complete model of fluorescent pigment to make that transition intelligible.

The [phase module](https://github.com/Sammii-HK/beyond-light-vr/blob/91636b3172d960aecd17d9e21a9b8a0af5da363e/src/journey.js) separates that sequence from the room and text rendering. Changing a duration does not require editing the shader. Changing the letter treatment does not require rewriting the order of the journey.

## Turn text into a mask the shader can read

Each passage is first drawn onto a 2048 by 1024 canvas, with white text on a black background. The canvas becomes a Three.js `CanvasTexture`, mapped onto its wall plane. The geometry stays simple while the texture provides the shape of the letters.

The fragment shader samples the texture's red channel as a mask. Dark pixels represent empty space; bright pixels represent letterforms. The reveal uniform controls how much of that mask becomes visible.

A simplified version of the idea is:

```glsl
// Illustrative reduction of the layered reveal shader.
uniform sampler2D u_text;
uniform float u_reveal;
varying vec2 vUv;

void main() {
  float mask = texture2D(u_text, vUv).r;
  float reveal = smoothstep(0.0, 1.0, u_reveal);
  vec3 ink = vec3(0.92, 0.95, 1.0);
  gl_FragColor = vec4(ink, mask * reveal);
}
```

The [actual shader](https://github.com/Sammii-HK/beyond-light-vr/blob/91636b3172d960aecd17d9e21a9b8a0af5da363e/src/shaders/uvReveal.frag) builds three contributions from different thresholds of the same mask: a purple edge, a blue-white middle and a bright core. A slow, small modulation changes the core's intensity over time.

Those threshold operations do not perform a spatial blur. They reshape the sampled values around the letter edges. The larger glow that eventually spreads through the desktop image comes from a separate bloom pass. Treating the two effects separately makes both the code and the timing easier to reason about.

The canvas approach also carries a limitation. Text rendered into an image is not automatically selectable or available as ordinary document text. A more accessible version would keep a semantic text alternative alongside the visual treatment. That is a further interface decision, rather than something the shader can solve.

## Start the reading clock when the reveal settles

The transition into the final phase changes the reveal value from zero to one. Once that transition completes, the application records the time of entry into the settled ultraviolet state.

Only then does the reading interval begin. Bloom remains at zero for fifty seconds. After that, it ramps over nine seconds using a cubic curve, reaching a strength of 3.5 in the current configuration.

Here is the timing calculation as a standalone function, adapted from the animation loop:

```js
function bloomStrengthAt(uvAgeMs) {
  const readingTime = 50_000;
  const rampTime = 9_000;

  if (uvAgeMs <= readingTime) return 0;

  const progress = Math.min(
    (uvAgeMs - readingTime) / rampTime,
    1
  );

  return 3.5 * progress ** 3;
}
```

At fifty seconds it is still zero. Halfway through the nine-second ramp, the strength is 0.4375, only one eighth of the final value. At fifty-nine seconds it reaches 3.5. The cubic curve holds back early and gathers intensity towards the end.

This structure expresses the intended sequence directly: reveal, read, then brighten. Tying bloom to the reveal value alone would collapse those events together. The same value that makes the letters legible could immediately begin to obscure them.

Fifty seconds is a design choice, not proof that every viewer has finished reading all four walls. A pause, a replay control or an explicit “continue” after the reveal would give people more control over that interval. The current fixed window makes the sequence predictable, but it is not the only reasonable treatment.

## Desktop and headset rendering take different paths

The desktop image goes through an `EffectComposer`: a scene render, an `UnrealBloomPass` and an output pass. Bloom starts with zero strength. Its radius and threshold shape how the brighter parts of the image contribute once the timed ramp begins.

WebXR is enabled on the renderer, and Three.js provides the VR entry button. The project uses `renderer.setAnimationLoop`, which is the pattern described in the [Three.js WebXR guide](https://github.com/mrdoob/three.js/blob/dev/manual/pages/webxr-basics.html). This allows the renderer to supply the animation loop appropriate to the current presentation mode.

There is an important difference in the final render call. The current source explicitly branches:

```js
if (renderer.xr.isPresenting) {
  renderer.render(scene, camera);
} else {
  composer.render();
}
```

The headset path draws the scene directly. It includes the room and the shader-based writing reveal, but it bypasses the composer's bloom effect. The desktop's growing glow and white-out ending should therefore not be described as an identical headset effect.

This is a boundary of the implementation, not a reason to pretend the two outputs are interchangeable. A future version that needs the same ending in XR would need an XR-compatible approach and testing on the target hardware. The existence of an entry button is not a substitute for that verification.

## Let the camera serve the work

On a desktop, dragging changes yaw and pitch. Touch dragging provides the corresponding interaction on mobile. The pitch is clamped so the view does not freely tumble, and those manual camera updates are skipped during an XR session.

The interaction is about looking around a room rather than navigating a large world. There is no need to add locomotion simply because the rendering library can support it. The writing and colour sequence already provide the reason to turn.

The renderer caps its pixel ratio at two, and resize handling updates the camera, renderer and composer together. These are practical controls on image size and layout; they do not establish a frame-rate or comfort claim for a particular phone or headset.

The implementation also makes a useful design question visible: which details need to survive a change of medium? The physical work depended on material and illumination. The browser version depends on a texture mask, colour interpolation and a timeline. The experience can still preserve the relationship between waiting and discovering without claiming those mechanisms are physically equivalent.

That is what the separate clocks protect. The reveal has time to become readable before the desktop effect begins to dissolve it. You can [try the reconstruction](https://beyond-light-vr.vercel.app), then return to [the installation essay](https://sammii.dev/blog/beyond-the-visible-uv-acetate-and-the-installation-i-painted) for the ideas that gave those technical choices their purpose.
