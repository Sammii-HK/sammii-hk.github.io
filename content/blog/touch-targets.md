---
title: "Touch targets, at the size your finger meets them"
description: >-
  WCAG 2.2's 24 pixel minimum is 4 mm square on an iPhone 16, and the patch of
  fingertip that lands on it is 8 to 10 mm. A chart that draws the common
  touch-target rules at their real physical size, calibrated with a bank card.
date: '2027-01-22T09:00:00+00:00'
tags:
  - charts
  - motion and interaction
  - accessibility
  - mobile
series: "Motion and interaction"
chart: "touch-targets"
draft: false
---

Hold your index finger against a 24 by 24 pixel button on an iPhone and the button disappears. Not figuratively: your fingertip covers all of it and a fair bit around it. That button passes WCAG 2.2. On an iPhone 16 it is 4.0 mm across, and the patch of fingertip that meets the glass on a tap is about 8 to 10 mm.

The guidelines are written in CSS pixels, points and dp. Fingers are measured in millimetres. So the same rule is a different physical size on every screen, and I wanted to see them at the size they really are: [labs.sammii.dev/charts/touch-targets](https://labs.sammii.dev/charts/touch-targets/).

## What you see

Four targets, drawn as squares, each with a dashed circle over it: a 9 mm fingertip contact, centred on the target. The four are:

- **WCAG 2.2 minimum**, 24 × 24 CSS px (success criterion 2.5.8, level AA)
- **WCAG enhanced**, 44 × 44 CSS px (2.5.5, level AAA)
- **Apple**, 44 × 44 pt
- **Material**, 48 × 48 dp

Below them, three fingers at their widths: the fingertip contact patch (8 to 10 mm), the width of an adult index fingertip (16 to 20 mm) and a thumb (about 25 mm). Above them, a millimetre ruler. Hover or tap any of them for the rule or the source.

## The screen you pick

The row of buttons at the top, "Show sizes as on", is the real control. "This screen" draws the targets as they are on whatever you are reading on. The others draw them as they would be on an iPhone 16, a Pixel 8, the Android baseline, a MacBook Air 13-inch, a 24-inch 1080p monitor, or the CSS inch.

The sentence above the drawing updates as you switch. On an iPhone 16, WCAG's 24 px minimum is 4.0 mm. The bigger rules move just as much: 44 CSS pixels are 7.3 mm on the iPhone 16 and 12.2 mm on the 24-inch monitor. The same guideline is at its most generous on the screen where the pointer is a one-pixel arrow, and at its tightest on the phones, where the pointer is a thumb.

There is also a "Life-size" and "3× for detail" switch, for when the small ones are too small to see properly.

## Calibrate with a card

"Life-size" is only true if the page knows how big your screen's pixels are, and without calibration it can only guess. So there is a "Calibrate with a card" button. Hold any bank card flat against the screen, top-left corner to the outline's corner, and drag the "Card size" slider until the outline matches the card's edges. A bank card is ISO/IEC 7810 ID-1, 85.60 × 53.98 mm: the one object of known size most people have to hand.

Once you have done it, the page keeps the figure in your browser only, and everything is drawn at true size. Then you can hold your finger up to the screen and feel the difference between 4 mm and 9 mm, which is a much more convincing argument than any table.

## The arithmetic

Physical size is 25.4 mm divided by the CSS pixels a screen shows per inch, and that is its pixel density divided by its device pixel ratio. The iPhone 16 is 460 ppi with 3 device pixels to a CSS pixel, so about 153 CSS pixels to the inch, which is how 24 px becomes 4.0 mm.

Android is the interesting one. A dp is defined as one pixel at 160 dpi, and real screens are rounded into density buckets, so a dp on a real phone is close to 1/160 inch but not exactly. Google says a 48 dp target is about 9 mm whatever the screen. At Android's own baseline of 160 dp to the inch it is 7.6 mm, and on a Pixel 8 (428 ppi at 2.625 device pixels to a CSS pixel), 7.5 mm.

Two tables at the bottom do this for every target and every screen. The first gives each target in millimetres. The second turns it round: what the studies ask for, in CSS pixels, on each screen.

## What the studies ask for

The finding I keep coming back to is from Parhi, Karlson and Bederson in 2006. They measured one-handed thumb use and found targets of about 9.2 mm were enough for single taps and 9.6 mm for runs of taps, like typing a code. On an iPhone 16 that is 56 and 58 CSS pixels. More than Apple's 44.

Nielsen Norman Group's physical minimum of 1 cm by 1 cm comes from the same study. The page notes add the useful corollary: accuracy matters more than the size of the finger, and a target can be larger than what is drawn. Padding counts, which is how a 24 dp icon carries a 48 dp target.

## What it does not do

Without calibration, "This screen" is a guess. The page looks at whether your input is coarse (touch) and at your device pixel ratio, and picks a figure from that. It says so on the page, and it can be well out.

Physical size also depends on things the page cannot see: the user's zoom and their text-size setting. A target that is 7.3 mm at default settings is a different size for someone who has turned everything up.

The finger figures are softer than the screen figures. The MIT Touch Lab's widely cited figure puts the average adult index fingertip at 1.6 to 2 cm wide. The 8 to 10 mm contact patch and the 25 mm thumb are the figures design guides give alongside it, Ubuntu's finger-UI guide and Smashing Magazine respectively, and the page notes are clear they are less directly sourced. I have drawn them anyway, because a rough finger next to an exact target is still more honest than no finger at all.

And it says nothing about spacing beyond what the rules themselves say: smaller targets pass 2.5.8 only if a 24 px circle centred on each one touches no other target or circle, and Material asks for 8 dp or more between targets.

Calibrate it, then put your thumb on the 24 px square: [labs.sammii.dev/charts/touch-targets](https://labs.sammii.dev/charts/touch-targets/?focus=iphone).

## Sources

- W3C, WCAG 2.2, Understanding 2.5.8 Target Size (Minimum) and 2.5.5 Target Size (Enhanced).
- Apple, Human Interface Guidelines, Buttons.
- Google, Android Accessibility Help, Touch target size.
- Dandekar, Raju and Srinivasan, 3-D finite-element models of human and monkey fingertips to investigate the mechanics of tactile sense, Journal of Biomechanical Engineering 125 (2003), MIT Touch Lab.
- Aurora Harley, Touch targets on touchscreens, Nielsen Norman Group (2019).
- Ubuntu's finger-UI guide (named in the page notes for the contact-patch figure).
- Anthony T, Finger-friendly design: ideal mobile touchscreen target sizes, Smashing Magazine (2012).
- Pekka Parhi, Amy Karlson and Benjamin Bederson, Target size study for one-handed thumb use on small touchscreen devices, MobileHCI 2006.
- ISO/IEC 7810, ID-1 card size (85.60 × 53.98 mm).
- CSS Values and Units Level 4 (1in = 96px).
