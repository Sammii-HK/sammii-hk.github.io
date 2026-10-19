/**
 * The 16.7 ms frame budget: the stages that share one frame, what each
 * does, and a handful of everyday frames costed stage by stage. The stage
 * names follow web.dev's pixel pipeline (JavaScript, Style, Layout, Paint,
 * Composite) with input handling in front, as in Chrome's
 * RenderingNG and INP documentation. Scenario costs are illustrative
 * figures for a mid-range laptop, not measurements, except where a source
 * is named; the live meter on the page measures your own machine.
 */
export type StageId = "input" | "js" | "style" | "layout" | "paint" | "composite";
export const STAGES: { id: StageId; name: string; what: string; thread: string }[] = [
  { id: "input", name: "Input", what: "The event reaches the page and waits for the main thread to be free. If a task is already running, it waits for that task to end: this wait is the input delay in INP.", thread: "Main thread" },
  { id: "js", name: "JavaScript", what: "Event handlers, requestAnimationFrame callbacks, timers, the framework re-rendering. Everything your code does lands here.", thread: "Main thread" },
  { id: "style", name: "Style", what: "Work out which CSS rules apply to every changed element and compute its final styles. Grows with the number of elements and the complexity of selectors.", thread: "Main thread" },
  { id: "layout", name: "Layout", what: "Work out the geometry: where every box sits and how big it is. A change to one box can move many others, and a larger DOM costs more.", thread: "Main thread" },
  { id: "paint", name: "Paint", what: "Record the drawing commands for each layer: text, colours, borders, shadows, images. Blurs and big areas cost the most.", thread: "Main thread, then raster threads" },
  { id: "composite", name: "Composite", what: "Hand the layers to the compositor, which rasterises tiles and draws the layers in the right order on the GPU. Transform and opacity changes can be done here alone, off the main thread.", thread: "Compositor thread and GPU" },
];

export type Scenario = { id: string; name: string; what: string; ms: Record<StageId, number>; source?: string };
export const SCENARIOS: Scenario[] = [
  { id: "transform", name: "A transform animation", what: "A card sliding in with transform, or fading with opacity. The compositor moves the existing layer; the main thread does nothing at all, which is why it stays smooth on a busy page.", ms: { input: 0, js: 0, style: 0, layout: 0, paint: 0, composite: 1 } },
  { id: "top", name: "Animating top from JavaScript", what: "The same slide done by setting style.top every frame. Every frame now restyles, lays out and repaints. Fine at 60 Hz on a laptop, and just over the line at 120.", ms: { input: 0, js: 1, style: 1, layout: 3, paint: 2.5, composite: 1 } },
  { id: "typing", name: "A keystroke in a framework input", what: "Typing into a field that a framework re-renders: the handler, the reconcile, a restyle and relayout of what changed. These are the keypress chart's typical figures. It fits a 60 Hz frame and misses a 120 Hz one.", ms: { input: 1, js: 6, style: 1, layout: 1, paint: 1, composite: 1 } },
  { id: "thrash", name: "Layout thrashing", what: "A loop that writes a style and then reads a size, over and over, forcing a fresh layout on every pass. web.dev's worked example spends more than 28 ms in layout per frame on a page of 1,618 elements.", ms: { input: 0, js: 2, style: 3, layout: 28, paint: 2, composite: 1 }, source: "Layout figure: web.dev, Avoid large, complex layouts and layout thrashing" },
  { id: "long-task", name: "A 50 ms task on click", what: "A click handler that parses, filters and renders in one go. 50 ms is where the browser starts calling a task long. The page cannot paint, scroll on the main thread or answer the next tap until it ends.", ms: { input: 1, js: 50, style: 2, layout: 2, paint: 2, composite: 1 }, source: "Long-task threshold: web.dev, Optimize long tasks" },
];

export const REFRESH = [
  { hz: 60, ms: 1000 / 60, note: "Most laptops, monitors and older phones." },
  { hz: 120, ms: 1000 / 120, note: "ProMotion iPhones and iPads, most recent Android flagships, many gaming monitors." },
] as const;

/** RAIL: aim for 10 ms of your own work per frame at 60 Hz; the browser needs about 6. */
export const RAIL_WORK_MS = 10;
export const RAIL_BROWSER_MS = 6;

/** frames that pass before a frame costing `cost` ms is shown, at a refresh interval of `budget` ms */
export const framesMissed = (cost: number, budget: number) => (cost <= budget ? 0 : Math.ceil(cost / budget) - 1);

export const CAUSES: { id: string; name: string; what: string; source: string; chart?: { slug: string; title: string } }[] = [
  { id: "long-tasks", name: "Long tasks", what: "One task over 50 ms holds every frame and every input queued behind it. The fix is to break the work up and yield between pieces.", source: "web.dev, Optimize long tasks", chart: { slug: "event-loop", title: "The event loop, for interfaces" } },
  { id: "input", name: "Slow handlers on input", what: "The time from a tap to the next frame is input delay, then your handlers, then the frame. INP calls 200 ms or less good; a single frame's worth is the goal for typing.", source: "web.dev, Interaction to Next Paint", chart: { slug: "keypress", title: "How a keypress becomes a pixel" } },
  { id: "layout-props", name: "Animating layout properties", what: "top, left, width, height and margin re-run layout and paint on every frame. transform and opacity skip both and can run on the compositor.", source: "web.dev, Rendering performance", chart: { slug: "repaint", title: "What a CSS property costs" } },
  { id: "thrash", name: "Forced layout in a loop", what: "Reading offsetHeight or getBoundingClientRect after a style write makes the browser lay out now, inside your script. In a loop, that is a layout per iteration. Read everything first, then write.", source: "web.dev, Avoid large, complex layouts and layout thrashing" },
  { id: "paint", name: "Expensive paint", what: "Paint is often the longest stage. Anything with a blur, like a large box-shadow or a backdrop filter, costs more than a flat fill, and a big repainted area costs more than a small one.", source: "web.dev, Simplify paint complexity and reduce paint areas", chart: { slug: "repaint", title: "What a CSS property costs" } },
  { id: "bundle", name: "Too much JavaScript to start", what: "Parsing, compiling and running a large bundle is main-thread time before the page can answer anything.", source: "Chrome for Developers, Inside look at modern web browser, part 3", chart: { slug: "js-cost", title: "What a byte of JavaScript costs" } },
];
