/**
 * One true, specific thing per follow-up post, per chart. Each fact names the
 * `focus` the chart page can open with ?focus=<id>, so the video lane can
 * record the detail the post is about. Every statement here is on the chart
 * itself and sourced in its footer; nothing is added from memory.
 */
export type Fact = { id: string; focus?: string; text: string };

export const FACTS: Record<string, Fact[]> = {
  "colour-spaces": [
    { id: "xyz-root", focus: "xyz", text: "Almost every colour space on the tree descends from CIE XYZ (1931), a linear transform of colour-matching experiments where people mixed three lights to match a test colour. Ninety years later, every conversion still goes through it." },
    { id: "hsl-lie", focus: "hsl", text: "HSL is from 1978 and was built to be cheap on 1978 hardware: hue, saturation and lightness from the max and min of the RGB channels. Its lightness is a formula, not a perception. 50% yellow and 50% blue are nowhere near equally bright." },
    { id: "lab-blue", focus: "ipt", text: "CIELAB has a blue problem: lower the chroma of a blue and it drifts purple. IPT (1998) fixed it by going through cone responses first, and that idea is the backbone of ICtCp for HDR video and, later, Oklab." },
    { id: "oklab-blog", focus: "oklab", text: "Oklab (2020) started as a blog post by Björn Ottosson: XYZ to LMS, a cube root, and a small matrix fitted so CAM16 lightness and IPT hue both come out right. CSS adopted it within two years. A formula short enough to memorise beat a committee." },
    { id: "css4", focus: "csscolor4", text: "CSS Color 4 (2022) is the moment the web stopped being sRGB-only: lab(), lch(), oklab(), oklch() and color(display-p3) as first-class colours, with gamut mapping defined. The colour ramps on the chart are drawn with them." },
  ],
  "why-hsl-lies": [
    { id: "twelve-x", focus: "50", text: "Ask HSL for 24 hues at 50% lightness and the brightest swatch has 12 times the luminance of the darkest. Ask OKLCH for the same and the row is flat within 1.2 times. Same number, very different light." },
    { id: "cube-root", focus: "50", text: "CIELAB and Oklab both take a cube root of a luminance-like quantity, which is why their lightness rows sit flat. HSL takes the mean of the largest and smallest RGB channel, which is why a saturated yellow and a saturated blue share an L while differing nine to one in luminance." },
  ],
  typography: [
    { id: "serif-line", focus: "humanist", text: "The serif lane of the typography genome is one unbroken line from Nicolas Jenson's roman in 1470: humanist to Garalde to transitional to Didone. Every book face you read descends from a Venetian printer's imitation of a scribe." },
    { id: "grotesque", focus: "grotesque", text: "The first sans serif in metal, Caslon's two-line English Egyptian of 1816, had capitals only and was named grotesque because it looked wrong. Akzidenz-Grotesk made it a working family in 1898; Helvetica tidied it in 1957." },
    { id: "univers-variable", focus: "univers", text: "Univers (1957) was the first typeface designed as a system: 21 variants on a numbered grid of weight and width. Variable fonts (2016) are that grid made continuous, in one file." },
    { id: "tech-lane", focus: "postscript", text: "The technology lane of the typography genome starts in 1984 with PostScript, when type stopped being metal and became maths, and now reaches back into every other lane: Fraunces, Recursive and Inter are variable fonts first and styles second." },
  ],
  communication: [
    { id: "press", text: "Six centuries of communication and type on one spine: Gutenberg's press (1440) and Blackletter share the first entry, because moveable type made typography possible in the same year." },
    { id: "telegraph", text: "The telegraph (1831) arrives on the spine alongside the first sans serifs and the fat faces: the same decades that compressed communication into wires compressed letters into posters." },
  ],
  keypress: [
    { id: "display-half", focus: "vsync", text: "On a 60 Hz screen, waiting for the next frame and then scanning it out costs about 17 ms on average, more than every stage of the browser put together. Refresh rate is the biggest latency knob most people never touch." },
    { id: "two-of-twelve", focus: "handler", text: "Of the twelve hops between a keypress and a pixel, the code you write is two: your event handlers and the style and layout they cause. The other ten are the keyboard, the OS, the browser's plumbing and the display." },
    { id: "polling", focus: "usb", text: "A USB keyboard polling at 125 Hz makes a keypress wait 4 ms on average before the computer even knows about it. Gaming keyboards poll at 1000 Hz and cut that to half a millisecond." },
  ],
  gamuts: [
    { id: "third", focus: "srgb", text: "sRGB, the web's default colour space, covers about a third of the colours a human can see. The horseshoe on the chart is all of them; the small triangle is the box every image without a profile lives in." },
    { id: "rec2020", focus: "rec2020", text: "Rec. 2020 puts its primaries on the spectral locus itself: pure single wavelengths at 630, 532 and 467 nanometres. It is the container for HDR video and no commercial display reaches it." },
    { id: "p3", focus: "p3", text: "Display P3 is DCI-P3's cinema primaries with sRGB's white point and transfer curve. It is what most phones and laptops have shown since about 2016, and the chart asks your screen whether it has it." },
  ],
  repaint: [
    { id: "two-cheap", focus: "transform", text: "Of 55 common CSS properties, six can change without a repaint, and two of those, transform and opacity, are the reason smooth animation exists at all. Everything else costs a paint or a layout." },
    { id: "top-left", focus: "top", text: "Animating top or left lays the page out on every frame. Animating transform: translate() moves the same pixels on the compositor and lays out nothing. Same motion, completely different cost." },
    { id: "font-weight", focus: "font-weight", text: "Changing font-weight changes glyph widths, so every line re-wraps: a layout. A variable font animates weight beautifully, but it still costs a layout each frame." },
  ],
  "event-loop": [
    { id: "1432", focus: "classic", text: "console.log('1'), a setTimeout of 0 that logs 2, a resolved promise that logs 3, console.log('4'). The console reads 1, 4, 3, 2, because microtasks drain the instant the script's stack empties, before any task can run." },
    { id: "raf", focus: "raf", text: "requestAnimationFrame is not a task. A rAF callback registered during a frame waits for the next one, a whole refresh later, while a 0 ms timeout runs in between." },
    { id: "starve", focus: "starve", text: "Every microtask queued while the queue is draining joins the same drain. Chain enough promises and the page never gets to render: that is how microtasks starve the loop." },
  ],
  "named-colours": [
    { id: "darkgray", focus: "darkgray", text: "darkgray is lighter than gray. CSS took gray (#808080) from HTML's sixteen VGA colours and darkgray (#a9a9a9) from X11, whose own gray was #bebebe. Two lineages, one name, and the dark one ended up brighter." },
    { id: "lime", focus: "lime", text: "Pure #00ff00 is called lime, not green. When CSS adopted the X11 names, HTML's green (#008000) kept its name and X11's brighter green had to become lime. Every named colour on the chart is resolved by your own browser." },
    { id: "rebeccapurple", focus: "rebeccapurple", text: "rebeccapurple (#663399) was added to CSS in 2014 in memory of Rebecca Meyer, Eric Meyer's daughter, who died at six. It is the only named colour with a story written into the standard." },
  ],
  "big-o": [
    { id: "n32", focus: "2n", text: "At n = 32, O(n log n) is 160 nanoseconds and O(2^n) is 4.3 seconds on a machine doing a billion operations a second. O(n!) at 32 is 8.4 × 10^18 years. Adding one item to an exponential problem doubles the work." },
    { id: "log-axis", focus: "nlogn", text: "The textbook Big O chart uses a linear axis, which hides everything below quadratic in a flat line. On a log axis the classes separate, and you can see that n log n is barely above linear until n is enormous." },
  ],
};
