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
    { id: "label", focus: "classic", text: "The most common loading-state bug: set the button to 'Saving…' then do the work in the same task. The label never appears, because the browser paints after the task ends, by which time it says 'Saved'. Give the loop a turn first (a frame, then a task) and it shows." },
    { id: "css-survives", focus: "classic", text: "Block the main thread for 400 ms and watch two animations: the CSS transform keeps moving, because the compositor runs it off the main thread; the JavaScript one stops dead. That is why transform and opacity animations survive a busy page." },
    { id: "1432", focus: "classic", text: "console.log('1'), a setTimeout of 0 that logs 2, a resolved promise that logs 3, console.log('4'). The console reads 1, 4, 3, 2, because microtasks drain the instant the script's stack empties, before any task can run." },
    { id: "raf", focus: "raf", text: "requestAnimationFrame is not a task. A rAF callback registered during a frame waits for the next one, a whole refresh later, while a 0 ms timeout runs in between." },
    { id: "starve", focus: "starve", text: "Every microtask queued while the queue is draining joins the same drain. Chain enough promises and the page never gets to render: that is how microtasks starve the loop." },
  ],
  "named-colours": [
    { id: "darkgray", focus: "darkgray", text: "darkgray is lighter than gray. CSS took gray (#808080) from HTML's sixteen VGA colours and darkgray (#a9a9a9) from X11, whose own gray was #bebebe. Two lineages, one name, and the dark one ended up brighter." },
    { id: "lime", focus: "lime", text: "Pure #00ff00 is called lime, not green. When CSS adopted the X11 names, HTML's green (#008000) kept its name and X11's brighter green had to become lime. Every named colour on the chart is resolved by your own browser." },
    { id: "rebeccapurple", focus: "rebeccapurple", text: "rebeccapurple (#663399) was added to CSS in 2014 in memory of Rebecca Meyer, Eric Meyer's daughter, who died at six. It is the only named colour with a story written into the standard." },
  ],
  url: [
    { id: "tls13", focus: "tls", text: "TLS 1.2 needs two round trips to agree keys; TLS 1.3 needs one, and HTTP/3 over QUIC folds the transport handshake into that same round trip. On a 200 ms 3G link that is 400 ms saved before a single byte of HTML arrives." },
    { id: "js-phone", focus: "exec", text: "400 KB of JavaScript costs about 100 ms to parse, compile and run on a laptop and about a second on a cheap phone. On the waterfall it is the one bar that stretches when you change the device rather than the network." },
    { id: "waiting", focus: "ttfb", text: "On a 3G connection, more than a second passes before the first byte of HTML arrives, and none of it is work: it is DNS, the handshakes and one request, each a round trip. Latency, not bandwidth, is what a slow page is made of." },
  ],
  "big-o": [
    { id: "includes", text: "The most common accidental quadratic in interface code is one line: array.includes (or indexOf, or find) inside a loop over another array. 40,000 items, half selected, is 800 million comparisons on the first keystroke. A Set built once makes it 40,000." },
    { id: "budgets", text: "Two budgets decide whether typing feels right: 16.7 ms per keystroke keeps 60 frames a second, 100 ms is the threshold for feeling instantaneous. The measured demo crosses both as the list grows, on your machine, in the keystroke handler." },
    { id: "n32", focus: "2n", text: "At n = 32, O(n log n) is 160 nanoseconds and O(2^n) is 4.3 seconds on a machine doing a billion operations a second. O(n!) at 32 is 8.4 × 10^18 years. Adding one item to an exponential problem doubles the work." },
    { id: "log-axis", focus: "nlogn", text: "The textbook Big O chart uses a linear axis, which hides everything below quadratic in a flat line. On a log axis the classes separate, and you can see that n log n is barely above linear until n is enormous." },
  ],
  springs: [
    { id: "interrupt", text: "The difference between a transition and a spring is invisible on one clean move and obvious the moment you interrupt it. The transition starts a fresh curve from where it was, at zero velocity: the hitch you feel in most interfaces. The spring carries its momentum into the new journey." },
    { id: "zeta", text: "One number describes a spring's character: the damping ratio ζ = c / (2√(km)). Under 1 it overshoots, over 1 it creeps in without crossing, exactly 1 is the fastest arrival with no bounce. react-spring's default (170, 26) is ζ ≈ 1.0." },
    { id: "no-duration", text: "A spring has no duration. It has a settle time, the moment it is within 0.1% of the target and nearly still, and that changes with how far it has to go and how fast it was already moving. Which is exactly what makes it feel physical." },
  ],
  stacking: [
    { id: "scope", text: "z-index only competes with siblings inside the same stacking context. The menu at 9999 loses to a section at 1 because the card between them, with a transform on it, became a context: the whole card paints as one unit at z 0." },
    { id: "accidental", text: "Six ways a card becomes a stacking context without anyone meaning it: any transform, any opacity below 1, any filter, will-change: transform, isolation: isolate, and position with z-index: 0. Zero is not auto." },
    { id: "portal", text: "Raising the card's z-index works and starts the next war: now it sits above the toolbar. The real fix is to leave the context: portal the menu to body, or use the top layer (popover, dialog.showModal), which sits above every context by definition." },
  ],
  contrast: [
    { id: "symmetric", text: "WCAG 2 contrast is symmetric: white on orange scores exactly what orange on white scores, 2.6:1. Your eyes disagree, and so does APCA, which gives 50 one way and 55 the other, because it knows which colour is the text." },
    { id: "dark-mode", text: "On black, WCAG 2 passes #8a8a8a text at 6.1:1. APCA rates it Lc 40, below even the headline threshold. That gap is why so many dark-mode interfaces with 'passing' secondary text are hard to read." },
    { id: "size", text: "APCA does not give a pass or fail. It gives a size: Lc 90 for comfortable body text, 75 minimum body, 60 for large or bold, 45 for headings. Contrast and type size were always the same decision; one method admits it." },
  ],
  specificity: [
    { id: "columns", text: "Specificity is not a score, it is three counts compared left to right: ids, then classes (with attributes and pseudo-classes), then types. One id beats a hundred classes. The doubling hack .btn.btn works because the same class counts twice." },
    { id: "where", text: ":where() always contributes zero specificity, and that is the whole reason it exists: a design system wraps its defaults in :where() so any plain selector in the product wins, without an id, an !important or a doubled class. Cascade layers do the same job with a name." },
    { id: "ladder", text: "Seven things get a say before specificity: running transitions, !important (with origins reversed), origin, cascade layers, the style attribute, and only then the three columns, then source order. Most 'my override doesn't apply' bugs are on that ladder, not in the columns." },
  ],
  seven: [
    { id: "mod", text: "The days of the week are named for the seven classical planets, but not in the planets' order. The ancients gave each hour to the next planet, slowest to fastest: Saturn, Jupiter, Mars, Sun, Venus, Mercury, Moon. 24 hours, 24 mod 7 = 3, so each day's first hour is three planets on. Saturn, Sun, Moon, Mars, Mercury, Jupiter, Venus. The week is a heptagram." },
    { id: "newton", text: "The rainbow has seven colours because Newton wanted it to. He saw a continuum, first divided it into five, then added orange and indigo so the spectrum would share a number with the musical scale. Opticks, 1704." },
    { id: "bellos", text: "Ask 44,000 people their favourite number and one in ten says seven, the most popular answer. Bellos's reason: of the first ten numbers it is the only one you can neither multiply nor divide within the group. It feels unique, so it feels complete." },
  ],
  layout: [
    { id: "floats", text: "Floats were made for wrapping text round an image. For a decade they were how every page was laid out, which is why every codebase had a clearfix hack and why columns were never equal height. Flexbox in 2013 was the first layout tool that was actually for layout." },
    { id: "flex-vs-grid", text: "Flexbox is one dimension at a time: a wrapped row of cards does not know about the row below it, so nothing lines up. Grid is two: rows and columns know each other, and repeat(auto-fill, minmax()) adds and removes columns as the width changes with no media query." },
    { id: "cq", text: "For 25 years 'responsive' meant the viewport. Container queries (2022) let a card ask how wide its own container is, so the same component is horizontal in the main column and stacked in the sidebar. Subgrid (2023) then lines its title and price up with the card next door." },
  ],
  "x-height": [
    { id: "box", text: "font-size does not set the size of the letters. It sets the em box, and nothing inside is required to be any size. Verdana's lowercase fills over half the box, Garamond's about two fifths. Measured on your machine, in the chart." },
    { id: "adjust", text: "font-size-adjust takes one number, the x-height as a fraction of the em, and scales any fallback family so its lowercase matches. It has been in every engine since 2024 and almost nobody uses it. It is the fix for the fallback font looking the wrong size while the web font loads." },
    { id: "line-box", text: "line-height: normal is not a number. It is the font's own ascent plus descent, which is different in every family, which is why the same line-height looks tight in one and loose in another, and why an icon next to text never quite centres." },
  ],
  unicode: [
    { id: "four", text: "A string has four lengths. One family emoji is 1 grapheme, 7 code points, 11 UTF-16 units and 25 UTF-8 bytes. JavaScript's .length gives you the third one, which is the one nobody means." },
    { id: "limit", text: "A '20 characters max' field written with .slice(0, 20) rejects a 20-letter Vietnamese name and can leave half an emoji at the end of a preview. Cut by grapheme with Intl.Segmenter, in every engine since 2024, and it cuts where a person would." },
    { id: "cafe", text: "There are two cafés that look identical, compare unequal and sort apart: one é is a single code point, the other is e plus a combining accent. Normalise before you compare, and let Intl.Collator sort." },
  ],
  "floating-point": [
    { id: "seam", text: "Three columns at 33.333% of 1001px are 333.667px each. The browser lays out in fractions and paints in whole device pixels, so the edges get snapped and a hairline of background shows through. The chart measures it with getBoundingClientRect, live." },
    { id: "fuzzy", text: "A 1px border on an element with transform: translateX(0.5px) looks out of focus; the same border with margin-left: 0.5px is crisp. Layout positions are snapped to the pixel grid before painting, transforms are rasterised between pixels. That is the whole blurry-animation bug." },
    { id: "price", text: "1.005.toFixed(2) is '1.00' and the browser is right: 1.005 cannot be stored, the nearest double is 1.00499999999999989. Money goes in integer pence or a decimal type, never a float." },
  ],
  "js-cost": [
    { id: "image", text: "The same bytes as a JPEG and as a bundle arrive in the same time and only one of them stops the page. The image is decoded off the main thread. The JavaScript is parsed, compiled and run on the thread that also handles your tap. The byte is not the cost; the thread is." },
    { id: "measured", text: "The chart generates a bundle of the size you pick and times parse, compile and first run on your own machine with new Function and performance.now(), then scales it ×4 for a mid-range phone. Press measure; the numbers are yours." },
    { id: "gzip", text: "Gzip helps the download and does nothing for parse and compile, which scale with the source you shipped, not the bytes on the wire. 1 MB of JavaScript is still 1 MB to the parser after it arrives as 280 KB." },
  ],
};
