---
title: "ScapeStudio"
description: "A browser photo editor that turns one cropped photograph into a colour crop, a greyscale print and transparent apparel artwork, at real print sizes"
techStack: "Next.js, TypeScript, Web Workers, OffscreenCanvas, Zustand, IndexedDB, JSZip, Capacitor"
---

## The problem

I photograph landscapes, and I wanted the same photographs to work as fine art prints and as t-shirt artwork. The steps are always the same: crop, convert to black and white, shape the tones with a curve, knock the darkest tones out to transparency so the shirt colour shows through, and export at 300 DPI at a few fixed print widths. Photoshop can do every step. What it cannot do is make that sequence one screen and one button, so each photograph was an action, an export, a rename and a repeat.

ScapeStudio is that one screen. You choose a JPG, PNG, WebP or HEIC photo, crop it, shape it, and download a ZIP holding three versions at every width you picked. Nothing leaves the device. It is live at [scapestudio.vercel.app](https://scapestudio.vercel.app), and I wrote about the worker architecture in more depth in [Browser photo editing in Web Workers](/blog/browser-photo-editing-web-workers/).

## One crop, three outputs

Every export produces three PNGs per print width, filed into three folders in the ZIP:

- **canvas**: the cropped photograph in full colour, untouched.
- **print**: greyscale with the tone curve applied.
- **tshirt**: the print version with dark tones knocked out to transparency.

They come from a single drawing of the crop, in order. The export worker draws the cropped region at the target size, saves that as the colour version, then reads the pixels back, applies greyscale and the curve, saves the print, clones the data and applies the knockout for the shirt. One crop state drives the preview, the export and all three files, so they can never disagree about framing.

## Two workers, two jobs

All pixel work happens off the main thread, in two separate Web Workers using OffscreenCanvas.

The preview worker exists to keep the editor responsive. It works on a copy scaled so its longest side is at most 2,000 pixels, and requests to it are debounced:

```ts
const PREVIEW_MAX_SIZE = 2000;
const DEBOUNCE_MS = 100;
```

Dragging a curve point fires a stream of changes, and only the last one in any 100 ms pause reaches the worker. The worker also builds a 256-bin luminance histogram from the colour data before converting it, and sends it back with the result, so the curves editor can draw the photograph's actual tonal distribution behind the curve. The histogram's buffer and both bitmaps are transferred rather than copied.

The export worker works at full output resolution and only runs when you export. Transferring an `ImageBitmap` to a worker detaches it from the sender, which would leave the editor holding a dead image, so the orchestrator makes a copy first:

```ts
// Create a copy of the source bitmap so the original in the store isn't consumed by transfer
const bitmapCopy = await createImageBitmap(sourceImage);
```

The worker reports progress after each file, which drives the progress bar, and closes its copy of the bitmap in a `finally` block whether the export succeeds or not.

## Greyscale and the tone curve

Greyscale uses the Rec. 601 luma weights, `0.299 R + 0.587 G + 0.114 B`, which give green the most weight because that is where the eye is most sensitive. The tone curve is then a lookup table: the curve is evaluated once at each of the 256 input levels, and every pixel becomes `lut[value]`. However complicated the curve, applying it costs one array read per pixel.

The curve itself has to pass exactly through the points you place and must not overshoot between them. An ordinary cubic spline overshoots: pull two points close together vertically and the curve bulges past them, which in a tone curve means tones reversing, a darker input producing a lighter output. ScapeStudio uses monotone cubic Hermite interpolation, the Fritsch-Carlson method.

Each segment between points is a cubic Hermite polynomial, defined by its two end values and the slopes at each end:

```ts
const h00 = 2 * t3 - 3 * t2 + 1;
const h10 = t3 - 2 * t2 + t;
const h01 = -2 * t3 + 3 * t2;
const h11 = t3 - t2;

const value = h00 * p0.y + h10 * h * tangents[seg] +
              h01 * p1.y + h11 * h * tangents[seg + 1];
```

All the care goes into choosing those tangents. At an interior point, if the slopes of the two neighbouring segments have opposite signs, or either is flat, the point is a peak, a valley or a plateau and its tangent is set to zero. Otherwise the tangent is a weighted harmonic mean of the two slopes, which leans towards the smaller slope and so never steers the curve too steeply. Then each segment is checked. With `α` and `β` as the end tangents divided by the segment's own slope, Fritsch and Carlson showed that the segment stays monotone if the point `(α, β)` lies inside a circle of radius 3:

```ts
const mag = alpha * alpha + beta * beta;
if (mag > 9) {
  const tau = 3 / Math.sqrt(mag);
  tangents[i] = tau * alpha * slopes[i];
  tangents[i + 1] = tau * beta * slopes[i];
}
```

If the tangents fall outside it, both are scaled back onto the circle. The result is a curve that looks smooth, goes through every point, and never inverts a tone. The built-in Noir preset is a good test: its points at (40, 5), (90, 55) and (200, 240) crush the shadows and lift the highlights steeply, and the curve between them stays a clean S.

The editor keeps the geometry valid as you drag. The two end points are locked to x 0 and 255, and an interior point is clamped one level inside its neighbours, so points can never cross. There are at most five points, and each has exact number inputs beneath the graph for anyone who would rather type than drag.

## Knockout by tone

The shirt version removes dark tones, not a background. It does not try to recognise a subject. Every pixel at or below the threshold minus the feather becomes fully transparent, and the feather is a ramp above that:

```ts
const lower = Math.max(0, threshold - feather);
if (lum <= lower) {
  data[i + 3] = 0;
} else if (lum <= threshold && feather > 0) {
  const alpha = ((lum - lower) / feather) * 255;
  data[i + 3] = Math.round(alpha);
}
```

So the feather is an interval in luminance rather than a blur in space. A pixel halfway between `lower` and the threshold gets half opacity. On a dark shirt, that turns a hard cut-out line into a soft fade where shadows meet the fabric, without blurring any detail in the photograph.

## Two bugs about alpha

Two early fixes, a day apart in February 2026, were both about transparency, and they taught me the same thing twice.

The first was a dull t-shirt preview. The worker had been writing pixels back with `putImageData` and then calling `transferToImageBitmap`. Canvas stores colour premultiplied by alpha, so a half-transparent feathered pixel lost precision on the way in and came back darker. Creating the bitmaps directly from the `ImageData` with `createImageBitmap` skips that round trip.

The second was dark fringes in the preview. The worker made a knocked-out bitmap at preview size, and the canvas then scaled it to fit the screen. Scaling interpolates between neighbouring pixels, and interpolating a transparent pixel with an opaque one drags the dark colour of the removed pixel into the edge. The fix was to change the order: the preview now scales the fully opaque print bitmap to display size first, and applies the knockout to the scaled pixels, then paints the chosen shirt colour behind it with `destination-over`. Nothing is ever resampled after it becomes transparent. The export avoids the same problem the same way, by drawing at the final size before any knockout.

## A print width must not stretch the photo

The first export took each size as a fixed square, 25, 50 or 70 cm on both sides, and drew the crop into it. Any crop that was not square came out stretched. The export now treats the size as a width, and lets the crop decide the height:

```ts
const widthPx = Math.max(1, Math.round((size.widthCm / 2.54) * size.dpi));
const heightPx = Math.max(
  1,
  Math.round(
    (widthPx * (source.height * crop.height)) / (source.width * crop.width),
  ),
);
```

Crop coordinates are stored as fractions of the image, so the crop's real aspect is the source size times the crop fraction in each direction. At 300 DPI a 25 cm width is 25 ÷ 2.54 × 300, which rounds to 2,953 pixels; a full 4:3 photograph then gets a height of 2,215. A test pins those numbers, checks a portrait crop doubles the height, and checks that a zero-sized crop or an invalid width is refused before a worker starts.

## Writing 300 DPI into the file

A PNG at the right pixel size is still not quite a print file. Without density metadata, many applications assume 72 DPI, at which a 2,953-pixel image is about a metre wide. `canvas.convertToBlob` cannot set density, so ScapeStudio writes the PNG `pHYs` chunk itself:

```ts
const density = Math.round(dpi / 0.0254);
```

PNG measures density in pixels per metre, so 300 DPI is 300 ÷ 0.0254, which rounds to 11,811. The chunk is 21 bytes: a length of 9, the type `pHYs`, the density twice for x and y, a unit byte of 1 for metres, and a CRC-32 computed over the type and data. The function walks the file's chunks, drops any existing `pHYs`, inserts the new one directly after the `IHDR` header, and refuses anything that does not start with the PNG signature or whose chunks run past the end of the file. The image data is never touched.

## Getting photos in

Most of my photographs live in Apple Photos, which turned out to be the hardest part of the upload. Photos often hands over HEIC files with an empty or generic MIME type, so the editor reads the first 12 bytes and looks for an `ftyp` box with a HEIC brand such as `heic` or `mif1`, then converts to JPEG in the browser. Dragging from Photos can also drop a URL rather than a file, so the drop handler checks `text/uri-list`, fetches it as a blob, and falls back to the drop's items.

Presets are saved in IndexedDB in the browser. Seven are built in, from Standard B&W to Noir, Silvertone and Dramatic, each a curve and a threshold, and your own sit alongside them.

For my own phone, the repository also wraps the editor in a small Capacitor app whose web view points at the live site, with an iOS share extension. Sharing a photo to it writes a JPEG into an App Group container and opens the editor with the photo already loaded, so a picture goes from the camera roll to the crop screen without an upload.

The editor itself is dark by design, like most photo tools, so the photograph is the brightest thing on screen; even the transparency checkerboard is drawn in two near-black greys so it does not compete with the image.

## What it taught me

Most of ScapeStudio is ordinary image processing, and the interesting parts were all at the edges: where the curve meets its points, where transparency meets resampling, where a pixel size meets a physical one. Each of those had a wrong version that looked fine at first. The curve needed real maths to stop inverting tones, the knockout needed the operations in the right order, and the export needed a crop-aware height and a 21-byte density chunk to be a file a print shop can use without asking questions.
