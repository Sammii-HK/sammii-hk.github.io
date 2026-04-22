---
title: "Building a beauty filter pipeline for iOS that doesn't melt faces"
description: >-
  TikTok-style face beauty filters are harder than they look. Face mesh
  tracking, bilateral skin smoothing, expression-aware adjustments, and the
  specific bugs that make your eyes drift off your cheeks if you get any of
  it wrong. Here is how the PostReady pipeline works.
date: '2026-06-03'
tags:
  - ios
  - swift
  - mediapipe
  - gpupixel
  - video
draft: false
---
Beauty filters look easy until you build one. Blur the skin, brighten the cheeks, done. The first time someone turns their head, the lipstick stays where their mouth used to be, the eyes blur into soft putty, and the jawline picks up a halo that looks like a 240p render. None of that is a painting problem. It is a tracking, compositing, and colour space problem, stacked.

PostReady is the iOS app I have been building. Short pitch: CapCut for busy people. The beauty pipeline took longest to get right, because tiny mistakes are immediately visible on a human face. This post is how it actually works.

---

## The four stages

Four stages, each with its own failure mode.

1. Face detection and landmark tracking, every frame.
2. Skin mask construction, combining landmarks with person segmentation.
3. Filter application, split between a GPU filter graph for reshape and makeup and a CPU pass for skin smoothing.
4. Compositing the filtered output back against the untouched original, through the mask.

Every tutorial shows step three and skips the rest. That gives you the melted face. The real work is in one, two, and four.

## Face detection: two libraries, two roles

PostReady uses two face detectors at the same time. GPUPixel's built-in Mars detector drives the GPU filter graph. Apple Vision's `VNDetectFaceLandmarksRequest` drives the skin mask. Different landmark conventions, different jobs, you need both.

GPUPixel's reshape and makeup filters are written against its own 106-point landmark layout. `FaceReshapeFilter`, `LipstickFilter`, and `BlusherFilter` all consume those internally, so you cannot swap the detector without rewriting the filters.

Vision is what the skin mask uses, because Vision also gives you `VNGeneratePersonSegmentationRequest`, a neural net trained to separate humans from backgrounds. The mask needs both: landmarks tell you what to exclude (eyes, brows, lips, nostrils), segmentation tells you where the skin cannot possibly be (walls, chairs, hair tips).

Vision runs on a dedicated queue in `SkinMaskCompositor` with frame-skipping so it does not compete with the main render loop:

```swift
nonisolated func updateVisionDetection(pixelBuffer: CVPixelBuffer) {
    guard !isProcessingVision else { return }
    isProcessingVision = true
    // copy buffer, dispatch to visionQueue, run Vision, update mask
}
```

Vision updates land about 10 times per second. The GPU filter chain still runs every frame at 30fps, consuming the last-known mask. Faces do not move fast enough between frames for 10Hz mask updates to look stale, and Vision at 30Hz would eat the CPU.

## Skin mask: radial gradient times blurred segmentation

The first mask I built used Vision's face contour directly: take the jawline, close the top over the forehead, fill the polygon, blur the edges. It looked correct in isolation, terrible in practice. The blurred polygon extended a few pixels past the real skin boundary, picking up hair and background, and every frame the halo was faintly visible on the wall behind me.

What actually works is a radial gradient intersected with a heavily blurred person segmentation. The gradient gives smooth falloff centred on the face. The segmentation stops the gradient extending into anything that is not a person.

```swift
let gradient = CIFilter(name: "CIRadialGradient", parameters: [
    "inputCenter": CIVector(x: cx, y: cy),
    "inputRadius0": faceSize * 0.32,
    "inputRadius1": faceSize * 0.55,
    "inputColor0": CIColor.white,
    "inputColor1": CIColor.black
])!.outputImage!.cropped(to: frameBounds)

let personBlurred = personCI
    .clampedToExtent()
    .applyingGaussianBlur(sigma: 12.0)
    .cropped(to: frameBounds)

let mask = gradient.applyingFilter("CIMultiplyCompositing", parameters: [
    kCIInputBackgroundImageKey: personBlurred
])
```

Two numbers matter here. The inner radius at 0.32 of the face size keeps smoothing centred on cheeks and forehead. The gaussian sigma at 12 is aggressive on purpose: person segmentation has surprisingly sharp edges at hair and jawline, and any sharp edge composited over skin becomes a visible line. Blur it until there is no edge left, then let the radial gradient provide the shape.

All of this stays in CIImage coordinate space. The moment you render through `UIGraphicsImageRenderer` you get UIKit's top-left origin fighting CIImage's bottom-left origin, and a mask flipped vertically for no obvious reason. I learned that the hard way on an earlier version.

## Bilateral smoothing, not gaussian

A gaussian blur treats every pixel the same. Run it over a face and you get skin smoothing plus blurred eyelashes, blurred nostrils, blurred lip edges, and a blurred transition between shadow and skin. A bilateral filter is edge-preserving: it blurs pixels that are similar in colour and preserves boundaries where colour changes sharply. Skin softens, edges stay sharp.

PostReady uses the `SkinSmoothingFilter` SPM package from `shima11/SkinSmoothingFilter`, a Core Image wrapper around a bilateral implementation. The thing worth knowing, which cost me an afternoon, is that `inputAmount` does not control smoothing. It controls sharpening. `inputRadius` is the one that actually controls how soft the skin gets.

```swift
smoothingFilter.inputRadius = retouchSmooth * maxRadius
smoothingFilter.inputSharpness = 0
```

Sharpness is zero because the sharpen step amplifies the halo at mask edges. You want the smoothing to be smooth and nothing else. Sharpening, if you want it, goes after the composite and applied globally, not inside the filter running on masked skin.

The bilateral pass runs on CPU through Core Image. It holds 30fps at 1080p on an iPhone 13. 4K drops to about 22fps, which is fine for offline render.

## Compositing: the move that stops the face melting

The bilateral output is not what you show the user. You blend it against the original unfiltered frame, through the skin mask, and show the blend.

```swift
blendFilter.setValue(filtered, forKey: kCIInputImageKey)
blendFilter.setValue(original, forKey: kCIInputBackgroundImageKey)
blendFilter.setValue(mask.cropped(to: original.extent), forKey: kCIInputMaskImageKey)
return blendFilter.outputImage
```

`CIBlendWithMask` is a per-pixel linear interpolation: mask at 1 gives the filtered pixel, mask at 0 gives the original, the middle is a mix. The mask falls off smoothly from cheek out to jawline, so the transition between filtered skin and untouched mouth and eyes is invisible. The mask is clipped to the blurred segmentation, so the background stays sharp.

This is where the colour space trap hides. `CIImage(image: UIImage)` is tagged sRGB. `CIImage(cvPixelBuffer:)` is tagged device RGB. Build your original from one and your filtered from the other, and the blend is silently wrong: Core Image converts as it composites and you get a faint halo at the mask boundary. Both paths have to go through `CIImage(cvPixelBuffer:)`. This was the single most frustrating bug in the pipeline, because the halo was faint enough to look like a rendering artefact rather than a colour space mismatch.

## Reshape and makeup: GPUPixel's filter graph

Non-skin effects run on GPUPixel, a C++ library with an OpenGL filter graph and built-in face reshape and makeup filters. The PostReady chain:

```
SourceRawData → LipstickFilter → BlusherFilter → FaceReshapeFilter → SinkRawData
```

All three consume the Mars landmarks GPUPixel produces internally. Reshape subtly widens eyes and narrows jaw. The makeup filters overlay LUT textures anchored to lip and cheek regions. Because they track landmarks every frame, they stay locked through head turns. Pure paint-over cannot do this.

GPUPixel has two gotchas that cost real hours.

First, PNG corruption at build time. GPUPixel ships LUT PNGs like `lookup_skin.png`. Even with `COMPRESS_PNG_FILES=NO`, Xcode runs `pngcrush` and re-encodes them into Apple's CgBI format, which breaks GPUPixel's texture loader and produces wildly wrong colours. Rename the PNGs to `.dat` in the bundle and copy them back to `.png` at first launch:

```objc
NSArray<NSString *> *resFiles = @[
    @"lookup_gray", @"lookup_origin", @"lookup_skin",
    @"lookup_custom", @"lookup_light", @"blusher", @"mouth"
];
for (NSString *name in resFiles) {
    NSString *src = [[NSBundle mainBundle] pathForResource:name ofType:@"dat"];
    NSString *dst = [resDir stringByAppendingPathComponent:
                     [name stringByAppendingString:@".png"]];
    [fm copyItemAtPath:src toPath:dst error:nil];
}
```

The second is that GPUPixel's `SinkView` reads `UIView.bounds` from a background thread, which trips Xcode's main thread checker and causes sizing glitches. Use `SinkRawData` and feed the output through your own `UIImageView` or Metal preview layer.

## Why BeautyFaceFilter got removed

An earlier build used GPUPixel's `BeautyFaceFilter` for skin smoothing. It produced a blanket blur across the whole frame, no mask, plus a visible halo around the edge of the face where the blur ran up against sharp edges. It also kept the soft look on walls and hair behind the subject.

Replacing it with Vision-driven masking plus the bilateral smoother was the biggest single quality jump. The lesson is not that BeautyFaceFilter is broken. The lesson is that a generic face-beauty shader cannot know where your specific user's face ends, and the only way to mask precisely is with something that actually ran a segmentation network on the image.

## Spot removal, bounded by landmarks

On top of smoothing there is a CPU spot removal pass in `GPUPixelBridge.mm`. It scans for small dark blobs inside the jawline bounding box and inpaints them with surrounding pixel averages. Two passes: a 3-pixel ring for fine spots, a 10-pixel ring for blemishes.

The critical piece is the exclusion list. Spots are only removed outside these zones:

- Eyes (landmarks 66 to 77), 50% padding
- Eyebrows (33 to 42), 30% padding
- Lips (84 to 95), 20% padding
- Nose (43 to 50), 20% padding

Without those exclusions the algorithm classifies nostrils and iris edges as spots and inpaints them, giving a face with no nostril definition and oddly smooth eyes. Landmark-bounded exclusion is what keeps it targeted.

## What still needs work

Honest list.

Frequency separation smoothing, where high-frequency skin detail is separated from low-frequency colour and only the low layer gets softened, would kill the remaining bilateral halo entirely. Needs a Metal shader pair. On the list, not built.

Zone-based smoothing intensity is partly there (under-eye and nose have reduced intensity constants defined) but the zone map rendering is UIKit-based and suffers from coordinate flips. The fix is a custom CIKernel in CIImage space, which I have not done yet.

Account presets, saving per-channel beauty intensity and applying automatically on import, are scoped but not implemented. Five static presets for now.

End-to-end device testing of the b-roll flow, which runs the same beauty pipeline over imported footage, has only been done on simulator and Mac. iOS device testing is next.

---

None of this is exotic. Vision has been on iOS for years, GPUPixel is an open-source C++ library, `CIBlendWithMask` is a decade old. The interesting bit is the order you put them in, the colour spaces you keep them in, and the masks you run the effects through. Get those right and the face looks like a face with nice skin. Get them wrong and the face melts.
