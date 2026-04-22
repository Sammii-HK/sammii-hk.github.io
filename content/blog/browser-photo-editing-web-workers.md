---
title: "Browser photo editing in Web Workers: 60fps on large images"
description: >-
  A purpose-built browser photo editor for fine art prints and t-shirts, with
  the entire image pipeline running in a Web Worker. OffscreenCanvas, cubic
  spline curves, non-destructive editing, and how to keep the UI responsive
  while processing 10-megapixel images.
date: '2026-06-24'
tags:
  - typescript
  - web-workers
  - canvas
  - image-processing
draft: false
---
Photoshop can do everything ScapeStudio does. That is not the point. Preparing photographs for fine art prints and t-shirt production is a specific pipeline: greyscale, curves, threshold knockout with feathered edges, export at 300 DPI across fixed paper and garment sizes. In Photoshop that is opening each file, running an action, exporting, renaming, repeating. Twenty photographs is an afternoon.

ScapeStudio does those four steps, nothing else, and the entire pixel pipeline runs in a Web Worker. Dragging a curves handle has to re-render the preview in under 16ms or the feel is gone. Main-thread processing on a 24-megapixel shot cannot hit that. A worker with an OffscreenCanvas can.

---

## Why the main thread loses

Canvas 2D is not slow in itself. Every pixel operation on the main thread competes with layout, paint, input handling, React reconciliation. Luminance conversion on an 8000x6000 image is 48 million pixels, 192 million byte operations. On a warm JIT, around 150ms. For the duration of that loop the UI is frozen, scrolling halts, the curves handle stops tracking.

Most web editors work around this by downsampling aggressively and processing the thumbnail, only running the full pipeline on export. That gets interactive curves but what you see is not what you get. Shadow clipping and highlight roll-off are invisible in a 400-pixel preview.

ScapeStudio processes a 2000-pixel preview in a worker on every parameter change, and runs the full-resolution pipeline only at export. The worker does not block the main thread, so the curves handle drags smoothly while the pipeline works.

## The worker contract

The message shape between the main thread and the processing worker is deliberately tight:

```typescript
export interface ProcessMessage {
  type: "process";
  imageBitmap: ImageBitmap;
  curveLUT: Uint8Array;
  threshold: number;
  feather: number;
  previewMaxSize: number;
}

export interface ProcessResult {
  type: "result";
  printBitmap: ImageBitmap;
  tshirtBitmap: ImageBitmap;
  histogram: Uint32Array;
}
```

Two details are load-bearing. The image moves as an `ImageBitmap`, not raw `ImageData`: `ImageBitmap` is a transferable reference to decoded pixel memory, so `postMessage` hands the GPU-side resource across thread boundaries without copying. The curves state is pre-baked into a 256-entry `Uint8Array` lookup table on the main thread before sending. The worker never sees the user's control points; it just indexes the LUT.

This is the serialisation gotcha that kills naive worker pipelines. Send four control point objects and expect the worker to rebuild the spline every frame, you pay spline evaluation per frame. Send a `Uint8Array` of 256 bytes, the worker runs one array lookup per pixel and the spline maths happens once per parameter change, on the main thread, where it is cheap.

## OffscreenCanvas is the whole trick

A normal `<canvas>` is a DOM node. Its 2D context reaches into layout, compositor, and the DOM in ways that only exist on the main thread. You cannot instantiate one in a worker. For years, image processing in workers meant shuttling raw `Uint8ClampedArray` buffers through `postMessage`, which either copies (slow) or transfers (you lose the buffer on the sender side).

`OffscreenCanvas` exists in the Web Worker global scope. Its `getContext("2d")` behaves like the DOM canvas context and can produce `ImageBitmap` via `transferToImageBitmap`. The pipeline is built around that:

```typescript
const canvas = new OffscreenCanvas(width, height);
const canvasCtx = canvas.getContext("2d")!;
canvasCtx.drawImage(imageBitmap, 0, 0, width, height);

const imageData = canvasCtx.getImageData(0, 0, width, height);

applyGrayscale(imageData.data);
applyCurveLUT(imageData.data, curveLUT);

const printBitmap = await createImageBitmap(imageData);
```

Everything after `drawImage` operates on a single `Uint8ClampedArray` that never leaves the worker. `createImageBitmap` returns a transferable bitmap handed back to the main thread by reference. The only bytes that actually cross the worker boundary are the 256-byte LUT in and a pointer-sized bitmap handle out.

## The pipeline stages

**Greyscale** uses luminosity weighting, not an RGB average:

```typescript
function applyGrayscale(data: Uint8ClampedArray): void {
  for (let i = 0; i < data.length; i += 4) {
    const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    data[i] = lum;
    data[i + 1] = lum;
    data[i + 2] = lum;
  }
}
```

Coefficients from Rec. 601 match how the eye perceives brightness. Naive `(R + G + B) / 3` loses shadow detail in greens and blows out blues. For fine art prints, weighted luminance is non-negotiable.

**Curves** is a pre-baked 256-entry LUT applied to the luminance channel:

```typescript
function applyCurveLUT(data: Uint8ClampedArray, lut: Uint8Array): void {
  for (let i = 0; i < data.length; i += 4) {
    const v = lut[data[i]];
    data[i] = v;
    data[i + 1] = v;
    data[i + 2] = v;
  }
}
```

One array lookup per pixel. No branches, no arithmetic. Fastest possible tonal transformation.

**Threshold with feathering** modifies the alpha channel based on luminance:

```typescript
function applyThreshold(
  data: Uint8ClampedArray,
  threshold: number,
  feather: number
): void {
  const lower = Math.max(0, threshold - feather);

  for (let i = 0; i < data.length; i += 4) {
    const lum = data[i];

    if (lum <= lower) {
      data[i + 3] = 0;
    } else if (lum <= threshold && feather > 0) {
      const alpha = ((lum - lower) / feather) * 255;
      data[i + 3] = Math.round(alpha);
    }
  }
}
```

Pixels below `lower` go fully transparent. Pixels between `lower` and `threshold` get a linear alpha ramp. Pixels above `threshold` are untouched. For t-shirt prep this knocks out studio backdrops while leaving hair and fabric edges soft, rather than the jagged bitmap look of a pure binary threshold.

## Cubic splines, done properly

The obvious way to wire up a Photoshop-style curves tool is Catmull-Rom splines through the user's control points. Mostly works, except when two adjacent points have a steep slope difference: Catmull-Rom overshoots. Drag a shadow point down, the curve dips below zero before recovering. The LUT clamps negatives, so you get a flat black region where you wanted a gentle toe.

ScapeStudio uses monotone cubic Hermite interpolation via the Fritsch-Carlson method, which guarantees no overshoot:

```typescript
tangents[0] = slopes[0];
tangents[n - 1] = slopes[n - 2];

for (let i = 1; i < n - 1; i++) {
  if (slopes[i - 1] * slopes[i] <= 0) {
    tangents[i] = 0;
  } else {
    tangents[i] = (3 * (dx[i - 1] + dx[i])) /
      ((2 * dx[i] + dx[i - 1]) / slopes[i - 1] +
       (dx[i] + 2 * dx[i - 1]) / slopes[i]);
  }
}

// Restrict tangents to the circle of radius 3
for (let i = 0; i < n - 1; i++) {
  const alpha = tangents[i] / slopes[i];
  const beta = tangents[i + 1] / slopes[i];
  const mag = alpha * alpha + beta * beta;
  if (mag > 9) {
    const tau = 3 / Math.sqrt(mag);
    tangents[i] = tau * alpha * slopes[i];
    tangents[i + 1] = tau * beta * slopes[i];
  }
}
```

The harmonic mean of slopes plus the radius-3 restriction is what makes it monotonic. The curve still passes through every control point exactly, still feels like Photoshop. It just cannot dip outside the range you drew. 256 evaluations per parameter change, a few microseconds total.

## Non-destructive by buffer layout

Each pipeline stage reads from the previous stage's output and writes to its own buffer. The source `ImageBitmap` is never touched. That matters for two reasons.

First, parameter changes only need to rerun from the earliest affected stage. Adjusting feather does not retouch the curves result; it clones the post-curves pixel data and applies threshold to the copy. After curves run, the print output is captured, then a fresh `Uint8ClampedArray` is allocated and thresholded independently for the t-shirt preview.

Second, the original image is still available at full resolution for export. The preview pipeline works on a downsampled 2000-pixel version for interactive feel; the export worker re-ingests the original bitmap, applies the same LUT and threshold values at full resolution, writes PNGs at 300 DPI. Same pipeline, different sampling.

## The debounce window

The main-thread glue is deliberately thin but does one thing that matters: it debounces worker dispatch by 100ms:

```typescript
export function processImage(
  sourceImage: ImageBitmap,
  curves: CurvePoints,
  threshold: number,
  feather: number,
  onResult: ProcessCallback
): void {
  if (debounceTimer) clearTimeout(debounceTimer);

  debounceTimer = setTimeout(() => {
    currentCallback = onResult;
    const lut = generateCurveLUT(curves);
    const w = getWorker();
    w.postMessage({ type: "process", imageBitmap: sourceImage, curveLUT: lut, threshold, feather, previewMaxSize: 2000 });
  }, 100);
}
```

Without this, dragging a slider fires dozens of worker dispatches per second. The worker processes one at a time, a queue builds, the preview falls behind. 100ms is long enough to coalesce a drag gesture, short enough that the output feels live.

One worker instance is reused across the session. Worker startup costs a few hundred milliseconds; you only pay it once.

## Batch export via JSZip

The export worker is the same pipeline at full resolution, looped over configured sizes, written into a zip client-side:

```typescript
for (const size of sizes) {
  const canvas = new OffscreenCanvas(widthPx, heightPx);
  const canvasCtx = canvas.getContext("2d")!;
  canvasCtx.drawImage(sourceImageBitmap, srcX, srcY, srcW, srcH, 0, 0, widthPx, heightPx);

  const imageData = canvasCtx.getImageData(0, 0, widthPx, heightPx);
  applyGrayscale(imageData.data);
  applyCurveLUT(imageData.data, curveLUT);

  canvasCtx.putImageData(imageData, 0, 0);
  const printBlob = await canvas.convertToBlob({ type: "image/png" });
  files.push({ name: `print/${fileName}_${label}_${widthPx}px.png`, blob: printBlob });
}
```

Each size gets a fresh `OffscreenCanvas` at target pixel dimensions (cm at 300 DPI), the cropped source draws into it, the pipeline runs, `convertToBlob` produces a PNG. The t-shirt output clones the buffer, thresholds, exports separately. All blobs go into a JSZip folder and save as one archive. No server round trip. A 20-photograph batch at six sizes produces 240 PNGs and never leaves the browser.

## What 60fps actually demands

The interactive budget is 16.6ms per frame. The worker pipeline on a 2000-pixel preview takes 30-50ms depending on image and device. Over budget for a single frame, which is why the main thread never waits on it. The drag gesture updates React state at 60fps from input events; the worker processes the latest coalesced state on its own clock; the result paints when it arrives. The preview trails the drag by one or two frames, the UI never stutters.

Moving the pipeline off the main thread is not an optimisation. It is the architectural choice that makes everything else possible. Once pixel loops live in a worker, the main thread only schedules messages and paints bitmaps. The curves handle stays under your cursor. The tab does not beachball on a 24-megapixel shot.

Purpose-built beats general-purpose. Four things, in a worker. Enough.
