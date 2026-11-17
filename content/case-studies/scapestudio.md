---
title: "ScapeStudio"
description: "A browser photo editor that prepares fine art photographs for both prints and t-shirts in one pass"
techStack: "Next.js, TypeScript, Web Workers, OffscreenCanvas, Zustand, IndexedDB, JSZip, Capacitor"
---

## The problem

I sell my photography as fine art prints and t-shirts under Scape Squared. Every photograph needs two outputs: a grayscale print with careful tonal control, and a transparent version for screen printing, where the dark background is knocked out so the shirt shows through. Both need exporting at several physical sizes at 300 DPI.

Photoshop can do all of it, as a long sequence of manual steps repeated for every image and every size. ScapeStudio does the same work in the browser, from one interface, producing both outputs side by side.

## The pipeline

All pixel processing runs off the main thread, in a Web Worker drawing to an `OffscreenCanvas`. The page sends the worker the source image and the current settings, and the worker runs the pipeline:

1. Grayscale conversion.
2. A tone curve, applied through a 256-entry lookup table.
3. A threshold knockout for the t-shirt version.

Because the work happens in the worker, dragging a curve point re-runs the pipeline without freezing the interface. Nothing ever modifies the source image, so every setting can be changed in any order.

## The curve, and why it can't overshoot

The tone curve is drawn through control points you place by hand. The obvious spline choices bend past the points between them, which on a tone curve means a highlight briefly gets darker as you lighten it, or tones invert. For print, that's unacceptable.

So the curve uses monotone cubic Hermite interpolation (the Fritsch–Carlson method). It passes exactly through every point and never overshoots between them: if the points only go up, the curve only goes up. The result is baked into a 256-entry lookup table, so applying it to a full-size image is one table read per pixel.

## The knockout

For the t-shirt output, every pixel darker than the threshold becomes transparent. A hard cut looks harsh on fabric, so a feather control softens it: pixels in a band just above the threshold fade in linearly, from fully transparent to fully opaque. A split preview shows the print and the t-shirt version next to each other, so you can tune one without losing sight of the other.

## Presets and export

Tonal looks (curve plus threshold) save as presets in IndexedDB, with a set of built-in ones such as High Contrast, Soft & Airy and Noir. Export renders both versions at 25, 50 and 70 cm squares at 300 DPI, up to 8,268 pixels a side, in a separate export worker, and bundles everything into a single zip.

Real photographs come from real libraries, so it also reads HEIC files and accepts images dragged straight out of the macOS Photos app. A Capacitor build wraps it as an iOS app with a Photos share extension, so a photo can go from the camera roll into the editor straight from the share sheet.

## A second life: Darkroom

ScapeStudio's curve maths, presets and knockout now also power [Darkroom](https://prism.sammii.dev/showcase/darkroom), a demo built with my Prism component library. Rebuilding it there was a chance to fix what the original did badly. The curve editor in ScapeStudio is mouse-only: click to add a point, right-click to delete. In Darkroom every curve point is a focusable slider you can move with the arrow keys, dragging works the same with a finger, every edit can be undone, and split-toning picks its tints from Prism's colour system.

## Outcome

ScapeStudio replaced the Photoshop routine I used to prepare Scape Squared prints and t-shirts. One editor produces both outputs at every size, in the browser, with no server involved.
