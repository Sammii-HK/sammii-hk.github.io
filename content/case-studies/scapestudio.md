---
title: "ScapeStudio"
description: "A focused image-to-print workflow: crop and shape tone locally, then export proportional colour, grayscale and transparent artwork."
techStack: "Next.js, TypeScript, Web Workers, OffscreenCanvas, Zustand, IndexedDB, JSZip"
updated: "2026-11-20"
status: "Live prototype; the reviewed local release candidate is not yet deployed"
---

<!-- Kept in step with the canonical structured study in scapestudio.json. -->

Live prototype; the reviewed local release candidate is not yet deployed

## One image, three material outcomes

ScapeStudio focuses on preparing a photograph for a print or apparel workflow. The source stays on the device. Crop and tonal decisions feed a colour crop, a grayscale print and a transparent version with dark tones removed. The interface makes those different outputs visible before export.

_Original daisy-photo editor view restored. Later local functional checks are documented separately._

## Keep editing responsive without pretending every stage is incremental

Pixel processing and several large output canvases can compete with the interface for time and memory.

- **Run pixel loops on the interface thread:** Simple to begin, but expensive image work competes with input and rendering.
- **Separate preview and export workers (chosen):** Preview processing is debounced by 100 milliseconds and bounded to a 2,000-pixel maximum dimension. Export works from a copy of the original bitmap at the requested output dimensions.

The original remains available for later edits. The current preview reruns the processing pipeline when its inputs change; it is not a cached, stage-by-stage editor.

## A curve that stays within its control points

Tone control uses a 256-entry lookup table generated from monotone cubic Hermite interpolation with Fritsch-Carlson slope limiting. That keeps individual segments from overshooting. The local refinement adds pointer input for touch, exact input/output fields and keyboard-accessible add/remove controls beside the drawn histogram.

## Transparency follows tone, not object recognition

The apparel output removes pixels at or below a dark-tone threshold. A feather interval ramps alpha between the lower boundary and the threshold. This is luminance-based knockout, not a Gaussian blur or an AI background remover. Light and dark regions inside a subject follow the same rule, which is why a dedicated apparel preview matters.

## A print width must not stretch the image

The previous exporter forced a square canvas and labelled it 300 DPI while browser PNG metadata described 96 DPI.

- **Resize every crop into preset rectangles:** Convenient dimensions would distort a non-square crop.
- **Choose physical width and preserve the crop ratio (chosen):** The local exporter derives height from the actual crop, calculates pixels at 300 DPI and writes a PNG pHYs density chunk.

Two actual downloaded ZIPs were decoded and inspected. The full study produced 2,953 by 2,215 PNGs at approximately 300 DPI. A 600 by 400 pixel crop produced 2,953 by 1,969 PNGs at the same print width and density. The full-study apparel file contained transparent and opaque pixels; the bright edited crop stayed opaque. These are particular desktop runs, not a large-image benchmark or cross-browser certification.

## Keep the photo workflow direct

The upload screen opens directly into choosing a photograph, and the original daisy remains the showcase. The workspace stacks controls beneath the canvas on narrow screens, gives frequent controls larger targets, names threshold fields and reports export failures in the interface. Presets use local IndexedDB; they do not upload an image.

## One crop state drives the preview and export plan

In the local browser pass, swapping the original 1,200 by 900 crop orientation changed its bounds to 675 by 900. Exact width and height edits then changed both the selection and the export dimensions. A curve point was added, edited and removed while the endpoints remained. At a measured 390-pixel layout, dragging a crop handle changed the selection without horizontal document overflow. This was pointer input in a phone-sized browser, not a physical touchscreen test. A saved tone preset was also available after a reload.

## What still needs proving

Large-source memory behaviour, HEIC conversion across browsers and native iOS delivery need further verification. There is no measured twenty-photo throughput claim, undo-history feature or automatic print-profile certification in this review. The local improvements must be released before the live tool is described as having them.
