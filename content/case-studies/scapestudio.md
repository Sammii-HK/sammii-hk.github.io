---
title: "ScapeStudio"
description: "Browser-based photo editor for fine art print and t-shirt preparation"
techStack: "Next.js, TypeScript, Web Workers, Canvas 2D, Zustand, JSZip"
---

## The problem

Preparing photographs for fine art prints and t-shirt production requires a specific workflow: convert to grayscale with precise tonal control, knock out backgrounds using threshold with feathered edges, and export at 300 DPI in multiple predefined sizes. Photoshop does all of this, but it is slow for batch work, expensive, and requires switching between tools. I wanted a browser-based editor purpose-built for this pipeline, with all processing running off the main thread.

## Architecture

### Web Worker pipeline

All image processing runs in a dedicated Web Worker using OffscreenCanvas. The main thread sends the source image and current parameter values; the worker applies the full pipeline (grayscale conversion, curves adjustment, threshold knockout) and returns the processed result. This keeps the UI responsive even with large images. Moving a curves handle triggers a new pipeline run without blocking scrolling or button clicks.

### Non-destructive editing

The pipeline is non-destructive: the original image data is never modified. Each step reads from the previous step's output buffer. Changing a parameter reruns only that step and everything downstream. The curves adjustment uses a cubic spline interpolated from user-placed control points, evaluated per-pixel against the luminance channel.

### Threshold knockout with feathering

The knockout system converts the image to pure black and transparent based on a luminance threshold. The feather control applies a gaussian blur to the alpha channel after thresholding, creating soft edges rather than hard pixel boundaries. This is critical for t-shirt production where hard edges look unnatural on fabric.

### Batch multi-size export

The export system takes the processed image and renders it at multiple predefined sizes (A4, A3, A2, square crop variants) at 300 DPI. All sizes are generated in the worker, compressed as PNGs, packed into a zip file using JSZip, and downloaded as a single archive.

## Challenges

**OffscreenCanvas browser support**: At the time of building, OffscreenCanvas had inconsistent support. The worker checks for OffscreenCanvas availability and falls back to transferring ImageData arrays if unavailable. The fallback is slower (no GPU-accelerated canvas operations) but functionally identical.

**Curves spline interpolation**: The interactive curves editor needed to feel like Photoshop's curves. Catmull-Rom splines through user control points, clamped to the 0-255 range, with real-time preview. Getting the spline to not overshoot at extreme control point positions required adding tension parameters.

**Memory management**: Processing large images (8000x6000 from a DSLR) creates multiple full-resolution buffers. The worker explicitly nulls intermediate buffers after each pipeline stage and calls garbage collection hints to avoid running out of memory in the browser tab.

## Outcome

ScapeStudio handles the full print preparation workflow in the browser. A typical batch of 20 photographs can be processed, reviewed with split preview, and exported at multiple sizes in under five minutes. The entire application runs client-side with no server dependency.
