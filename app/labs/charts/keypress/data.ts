/**
 * How a keypress becomes a pixel: every hop between a finger and the glass,
 * with a typical latency for each, in milliseconds. Ranges are typical for a
 * modern laptop; the interactive knobs change the ones that depend on
 * hardware. Sources in the page footer.
 */
export type Hop = {
  id: string;
  stage: "input" | "os" | "browser" | "render" | "display";
  name: string;
  what: string;
  /** typical ms; may be a function of the knobs */
  ms: (k: Knobs) => number;
  range: string;
  note?: string;
};
export type Knobs = { pollHz: 125 | 250 | 500 | 1000; refreshHz: 60 | 120 | 144 | 240; work: "light" | "typical" | "heavy"; panel: "fast" | "typical" | "slow" };

export const STAGES: { id: Hop["stage"]; label: string }[] = [
  { id: "input", label: "Keyboard" },
  { id: "os", label: "Operating system" },
  { id: "browser", label: "Browser" },
  { id: "render", label: "Rendering" },
  { id: "display", label: "Display" },
];

const WORK = { light: 2, typical: 6, heavy: 14 };

export const HOPS: Hop[] = [
  { id: "switch", stage: "input", name: "Switch travel and debounce", what: "The key moves about 2 mm to its actuation point, then the controller waits for the contact to stop bouncing before it believes the press.", ms: () => 5, range: "1 to 10 ms", note: "Mechanical switches bounce for a few milliseconds; firmware debounce is often 5 ms." },
  { id: "scan", stage: "input", name: "Matrix scan", what: "The keyboard controller scans its rows and columns in a loop; the press is noticed on the next pass.", ms: () => 1, range: "0.5 to 2 ms" },
  { id: "usb", stage: "input", name: "USB polling", what: "The host asks the keyboard for a report at a fixed rate. The press waits for the next poll: on average half the interval.", ms: (k) => 1000 / k.pollHz / 2, range: "0.5 to 4 ms", note: "125 Hz is the common default (8 ms interval); gaming keyboards poll at 1000 Hz." },
  { id: "hid", stage: "os", name: "HID stack and event queue", what: "The OS turns the report into a key event, applies layout and repeat rules, and posts it to the focused window's queue.", ms: () => 1, range: "0.5 to 3 ms" },
  { id: "ipc", stage: "os", name: "Delivery to the app", what: "The event crosses from the window server into the application process.", ms: () => 1, range: "0.5 to 2 ms" },
  { id: "dispatch", stage: "browser", name: "Event dispatch", what: "The browser process forwards the event to the renderer process for the tab; the main thread must be free to receive it.", ms: () => 1, range: "0.3 to 2 ms", note: "If the main thread is busy running JavaScript, the event waits. This is where jank starts." },
  { id: "handler", stage: "browser", name: "JavaScript handlers", what: "keydown, keypress, input: your listeners run, frameworks reconcile, state updates are scheduled.", ms: (k) => WORK[k.work], range: "1 to 20 ms", note: "Light: a native input. Typical: a framework re-render. Heavy: a big list, a spreadsheet cell, an editor." },
  { id: "style", stage: "render", name: "Style and layout", what: "Changed nodes are restyled and the boxes that depend on them are laid out again.", ms: (k) => ({ light: 1, typical: 2, heavy: 5 })[k.work], range: "0.5 to 8 ms", note: "Layout thrash (read, write, read) multiplies this." },
  { id: "paint", stage: "render", name: "Paint and composite", what: "Dirty layers are rasterised, then the compositor stacks them into a frame and hands it to the GPU.", ms: (k) => ({ light: 1, typical: 2, heavy: 4 })[k.work], range: "0.5 to 6 ms" },
  { id: "vsync", stage: "display", name: "Waiting for the next frame", what: "The finished frame waits for the display's next refresh. On average, half a frame.", ms: (k) => 1000 / k.refreshHz / 2, range: "2 to 8 ms", note: "60 Hz: a 16.7 ms frame. 120 Hz halves the wait. This is the biggest single cost on most machines." },
  { id: "scanout", stage: "display", name: "Scan-out", what: "The panel is refreshed top to bottom; a pixel in the middle of the screen updates half a frame after the top.", ms: (k) => 1000 / k.refreshHz / 2, range: "2 to 8 ms" },
  { id: "response", stage: "display", name: "Pixel response", what: "Liquid crystal takes time to turn; OLED is near instant.", ms: (k) => ({ fast: 1, typical: 4, slow: 12 })[k.panel], range: "0.1 to 15 ms", note: "OLED: under 1 ms. A good IPS: 4 ms. A cheap or old LCD: 10 ms plus." },
];
