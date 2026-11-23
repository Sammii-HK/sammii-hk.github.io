---
title: "Beyond Light VR"
description: "A WebXR reinterpretation of my 2017 MA installation: a dark room that travels through the visible spectrum from infrared to ultraviolet, where quotes that were always on the walls finally glow, before everything dissolves into white"
techStack: "Three.js, WebXR, GLSL, JavaScript, Vite"
---

## What it is

For my MA I built a room you walked into in darkness. Quotes about life, death and perception were on its walls in UV-reactive ink on acetate, invisible in ordinary light. You walked through the colours of the spectrum, and only when the light crossed into ultraviolet did the words appear. Nothing on the walls changed. What changed was the light you were standing in. I wrote about the installation, the ink and why the quotes were invisible in [Beyond the visible: UV, acetate, and the installation I painted](/blog/beyond-the-visible-uv-acetate-and-the-installation-i-painted/).

Beyond Light VR is that room rebuilt for the browser, at [beyond-light-vr.vercel.app](https://beyond-light-vr.vercel.app). You stand in the middle of a cube while it moves through nine phases, from infrared through red, orange, yellow, green, blue, indigo and violet into ultraviolet. Four quotes light up on the four walls. After a long reading window the light surges and the room dissolves into white. It works on a screen with a mouse, a finger or the keyboard, and in a headset through WebXR.

A screen cannot emit ultraviolet, so this is an interpretation, not a simulation. The site says so in its own About text. Colour and shaders stand in for light and ink. The decisions below are all about making that stand-in feel like the thing.

## A journey as data

The whole journey is one array. Each phase names its colour, the colour of the fog, whether the quotes are revealed, and how long it holds:

```js
{
  name: 'red',
  label: 'red  700nm',
  color: { r: 1,    g: 0,    b: 0    },
  fogColor: { r: 0.4,  g: 0,    b: 0    },
  intensity: 0.6,
  reveal: 0,
  duration: 4500,
},
```

Infrared is pure black for three seconds, which is the entrance: you begin in the dark, as you did in the physical room. The colour phases hold for three to four and a half seconds each. Ultraviolet is the only phase with `reveal: 1`, and its duration is `Infinity`, so the journey never moves past it on its own.

Between phases, every field is interpolated over 2.5 seconds with an ease in and out:

```js
const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
return lerpPhase(PHASES[transitionFrom], PHASES[currentPhase], eased);
```

That is a quadratic ease built from two parabolas that meet at the midpoint with the same slope, so the colour starts moving gently, crosses fastest in the middle and settles. Because `reveal` is one of the interpolated fields, the quotes fade in during the crossing from violet to ultraviolet rather than switching on.

The timings came from the history. The first version held each phase for eight to ten seconds. In an overhaul the same day I shortened them, because the spectrum is the approach, not the destination. With eight timed phases and eight crossings, the room now reaches settled ultraviolet in about 47.5 seconds.

## Painting the walls, not lighting them

The first version was an inside-out box with a near-black standard material, lit by an ambient light and two coloured point lights, with ACES tone mapping. The colour of the room came from light falling on a dark surface. The overhaul removed the lights and the tone mapping and painted the six walls directly with a shader, each a plane facing inwards, all sharing one colour uniform. The scene background and fog colour follow the phase too.

The wall shader is a vignette plus noise:

```glsl
float vignette = 1.0 - smoothstep(0.1, 0.68, dist * 1.5);
float noise = (fbm(vUv * 4.5) - 0.44) * 0.18;
float brightness = 0.16 + vignette * 0.72 + noise;
gl_FragColor = vec4(clamp(u_color * brightness, 0.0, 1.0), 1.0);
```

`dist` is the distance from the centre of the wall. The vignette is full strength up to a distance of about 0.07 and gone by about 0.45, so the middle of each wall glows at 0.88 of the phase colour and the edges and corners fall to 0.16. That reads as one lamp in the room, washing the centre of each wall. The noise is three octaves of smooth value noise, each octave 2.3 times finer and 0.48 times as strong as the last, starting at an amplitude of 0.52. Their sum tops out at about 0.89 and centres near 0.44, which is why the shader subtracts 0.44 before scaling: the texture adds and removes brightness evenly instead of only lightening. The commit message describes what I was after better than I can now: organic, not Minecraft, not AI-perfect.

## The fluorescence shader

The quotes are drawn once each onto a 2048 by 1024 canvas, white text on black, in Futura at weight 500 with fallbacks, left aligned with a 10% margin and the block centred vertically. Each canvas becomes a texture on a plane 45% of the room's width, set 0.05 units in front of its wall. The shader reads the red channel as a measure of how much letterform is under each pixel, and builds three layers from it:

```glsl
float halo     = smoothstep(0.0,  0.55, text);
float midGlow  = smoothstep(0.15, 0.75, text);
float core     = smoothstep(0.45, 0.85, text);
float pulse = 1.0 + sin(u_time * 0.9) * 0.06;
```

Because the canvas text is antialiased, the red value ramps from 0 at the edge of a stroke to 1 at its centre. A smoothstep starting at 0 catches the faintest edge pixels, so the halo spreads widest. One starting at 0.45 only catches the middle of a stroke, so the core is thin. Coloured UV purple, blue-white and white, the three layers give the look of fluorescent ink bleeding a little under blacklight, with a white-hot centre. The core breathes by six percent on a slow sine, like an LED that is not quite steady.

The reveal is eased with `u_reveal * u_reveal * (3.0 - 2.0 * u_reveal)`, the smoothstep polynomial `3t² - 2t³`, which has zero slope at both ends. Then the layers are combined:

```glsl
vec3 color = haloColor * haloAlpha
           + midColor  * midAlpha
           + coreColor * coreAlpha;
float alpha = max(max(haloAlpha * 0.5, midAlpha * 0.65), coreAlpha);
gl_FragColor = vec4(color / max(alpha, 0.001), alpha);
```

The sum is already weighted by each layer's own opacity, which is what premultiplied colour looks like. Three.js blends transparent materials as `rgb · a + background · (1 - a)`, so it is going to multiply by alpha again. Dividing by alpha first cancels that, and the light added to the room is exactly the sum of the three layers. The `0.001` floor keeps the division safe where there is no text at all.

## The reading window and the white-out

When ultraviolet has fully settled, a second timer starts. For fifty seconds nothing else happens: the words glow and you read. Then the bloom pass begins to rise:

```js
if (uvAge > QUOTE_READ_TIME) {
  const rampT = Math.min((uvAge - QUOTE_READ_TIME) / BLOOM_RAMP_TIME, 1);
  const eased = rampT * rampT * rampT;
  bloomStrength = eased * 3.5;
}
```

Over nine seconds the bloom strength follows a cube, so for most of the ramp it barely moves, and then it floods. Halfway through, it is only an eighth of the way there. The bloom's threshold is set at 0.18 so it catches the bright cores of the letters first, and its radius is kept tight so the glow hugs the letterforms before it overwhelms them. In the installation, white was the colour on the other side of the spectrum, and the room ends there.

Bloom is deliberately separate from the reveal, and the overhaul's commit message names the decision: bloom fully decoupled from the reveal, with a clean reading window first. The reveal makes the text readable; only once the reading window is over does the glow take it away. In a headset the scene is drawn with the plain renderer instead of the post-processing chain, so the dissolve is a screen effect and the headset view keeps the glowing text.

## A clock that waits for you

The first version timed everything with `performance.now()`. That is wall-clock time, so if you switched tabs for a minute during the reading window, you came back to a white room and had missed the quotes. The released version runs the journey on a virtual clock that only moves while the room is playing and visible:

```js
tick(now) {
  if (this.last !== null && !this.paused && !this.hidden) this.time += Math.max(0, now - this.last);
  this.last = this.last === null ? now : Math.max(this.last, now);
  return this.time;
}
```

Every timer in the journey, the phase durations, the crossings, the reading window and the bloom ramp, reads this clock. Pause and a hidden tab both freeze it, and `Math.max` means a clock sample that arrives out of order can never take time away. If your system asks for reduced motion, the journey starts paused and the reading window waits until you press Play. The tests check exactly these promises: paused reading time is kept on resume, a hidden tab cannot skip through the reading window, and Restart resets the journey without changing your pause choice.

Next phase needed one more rule. While the room is crossing between colours, Next is disabled, so a few quick clicks cannot pile up transitions. While paused, Next moves straight into the following phase and settles there, so you can step through the spectrum one colour at a time and stop in any of them. The rule lives in one small function so the button's disabled state and its action can never disagree.

## Quiet controls in a room that stays dark

Every page I make now follows the visitor's light or dark setting. This one deliberately does not. The room is the work, and a light page around it would undo the darkness you enter in. So the page declares `color-scheme: dark` in both its meta tag and its stylesheet, keeps a black background, and form controls follow.

The controls are text, like the original piece: small uppercase Georgia, letter-spaced, at low opacity that rises on hover and focus, centred at the bottom of the room. Pause, Play and Restart are words only. Next phase is the one primary action, with a thin hairline edge drawn inside its 44 pixel hit area, and a small Lucide arrow. The room gets bright in yellow, green and the final bloom, which could swallow pale type, so a pool of shade sits behind the title and the controls:

```css
header::before, footer::before {
  content: '';
  position: absolute;
  z-index: -1;
  pointer-events: none;
  background: rgba(0, 0, 0, 0.7);
  filter: blur(48px);
}
```

Blurred that far, it reads as shadow in the room rather than a panel. The header's shade runs off the top left corner and the footer's off the bottom edge, so neither has a visible boundary.

The canvas is focusable, with a label that tells you to drag or use the arrow keys. Each arrow turns the view by 0.15 radians, and looking up and down is clamped to just short of straight up and straight down, the same limit as dragging. The hint fades the first time you look around. While I was in there I removed a device orientation listener that had been storing the latest gyroscope event since the first commit without anything ever reading it.

## What it taught me

The physical cube was about a threshold: the words were there all along, and you needed the right light to see them. Rebuilding it, the threshold I kept running into was time. A web page has tabs, notifications and people who read slowly, and a journey run on wall-clock time quietly took the reading away from them. A virtual clock that only moves when you are there is a small piece of code, and I think it is the most faithful thing in the reconstruction: the words wait in the ultraviolet until you have actually stood in front of them. The rest taught me that the look of fluorescence is three smoothsteps and a division, and the feeling of it is almost entirely timing.
