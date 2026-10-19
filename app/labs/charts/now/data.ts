/**
 * How long "now" takes: brain, machine and whole-person timings in
 * milliseconds, on one axis. Machine figures for the frame and the
 * keypress pipeline are computed on the page (the keypress one from the
 * keypress chart's own hops); everything else is from the source in `src`.
 * Brain figures are averages with wide spreads between people, tasks and
 * methods; `lo` and `hi` draw a range where the source gives one.
 */
export type Mark = {
  id: string;
  kind: "machine" | "brain" | "behaviour";
  name: string;
  /** ms; the frame and keypress rows are computed from the refresh knob */
  ms: number;
  lo?: number;
  hi?: number;
  /** draw only the span from lo to hi: the source gives a range, not a typical value */
  rangeOnly?: boolean;
  what: string;
  note?: string;
  src: string;
};

export const MARKS: Mark[] = [
  {
    id: "touch", kind: "behaviour", name: "Lag you can feel under a dragging finger", ms: 6, lo: 2, hi: 11,
    what: "On a touchscreen built to respond in 1 ms, people dragging an object could tell the difference from as little as 2 to 11 ms of added lag, about 6 ms on average.",
    note: "Your sense of now runs tens of milliseconds behind, yet you can feel a few milliseconds between your finger and the thing it moves. One way to read it: the lag in perception is shared by everything you perceive, while a gap between finger and object is a difference you can compare directly. Tapping is far more forgiving: in the same group's later work, people could not tell 1 ms from about 64 ms on touch-down.",
    src: "Ng, Lepinski, Wigdor, Sanders and Dietz 2012, UIST; Jota, Ng, Dietz and Wigdor 2013, CHI; Ng et al. 2014, CHI",
  },
  {
    id: "frame", kind: "machine", name: "One frame on your display", ms: 16.7,
    what: "The time between refreshes: 1000 ms divided by the refresh rate. Anything that misses a frame waits for the next one.",
    src: "Arithmetic",
  },
  {
    id: "lgn", kind: "brain", name: "Signal reaches the thalamus (macaque LGN, fast pathway)", ms: 33,
    what: "After light hits the retina, the first visual responses in the lateral geniculate nucleus, the relay between eye and cortex, arrive about 33 ms later in the fast magnocellular layers and 50 ms in the slower parvocellular ones.",
    note: "Recorded in anaesthetised macaques shown flashed stimuli. Human latencies are longer.",
    src: "Schmolesky et al. 1998, J Neurophysiol 79:3272; summarised in Culham 1998, Trends Cogn Sci 2:473",
  },
  {
    id: "keypress", kind: "machine", name: "Keypress to pixel, a typical laptop", ms: 44,
    what: "The sum of the twelve hops in chart 05, How a keypress becomes a pixel, with its default settings and this chart's refresh rate: switch, USB polling, the operating system, the browser, rendering and the display.",
    note: "Typical figures, not a measurement of your machine. Change the refresh rate above and both machine rows move.",
    src: "Charts 05, How a keypress becomes a pixel",
  },
  {
    id: "v1", kind: "brain", name: "Signal reaches primary visual cortex (macaque V1)", ms: 66,
    what: "The average onset of responses in V1, the first stage of visual cortex. Areas further along respond later: about 104 ms on average in V4.",
    note: "Anaesthetised macaques, flashed stimuli; the order of areas is the robust finding, the exact numbers less so.",
    src: "Schmolesky et al. 1998, J Neurophysiol 79:3272; Culham 1998, Trends Cogn Sci 2:473",
  },
  {
    id: "postdiction", kind: "brain", name: "Window the brain waits on before settling what happened", ms: 80,
    what: "In the flash-lag effect, what people report seeing at the moment of a flash depends on what the moving object does in roughly the 80 ms after it. Eagleman and Sejnowski called this postdiction: the brain decides what happened at a moment after the moment.",
    note: "Eagleman later argued the brain waits about 80 ms for its slowest signals, which puts perception at least that far behind reality, and treats 80 ms as a minimum: other estimates of the time to awareness run from 100 to 500 ms. Why flash-lag happens is still argued over.",
    src: "Eagleman and Sejnowski 2000, Science 287:2036; Eagleman 2010, in Space and Time in Perception and Action, Cambridge University Press",
  },
  {
    id: "p100", kind: "brain", name: "Visual evoked potential, P100", ms: 100,
    what: "Show someone a reversing checkerboard and the biggest, most reliable wave in the EEG over the back of the head peaks at about 100 ms. Clinics use its timing to check the visual pathway.",
    note: "Each lab sets its own normal range; 100 ms is the name and the typical value.",
    src: "ISCEV standard for clinical visual evoked potentials, 2025 update, Doc Ophthalmol 151:97",
  },
  {
    id: "instant", kind: "behaviour", name: "Feels instantaneous", ms: 100,
    what: "About 0.1 s is the limit for a system's response to feel instantaneous, the first of Nielsen's three response-time limits (then 1 s to keep a train of thought, 10 s to keep attention).",
    note: "Nielsen was restating Miller (1968), who asked for a keypress to show its character within 0.1 to 0.2 s. It is a usability threshold, not a perceptual one: see the first row.",
    src: "Nielsen 1993, Usability Engineering; Miller 1968, AFIPS Fall Joint Computer Conference 33:267",
  },
  {
    id: "mhp", kind: "brain", name: "Perceptual processor cycle (Model Human Processor)", ms: 100, lo: 50, hi: 200,
    what: "The HCI textbook model of a person as three processors: perception takes about 100 ms per cycle (50 to 200), cognition 70 and the motor system 70. In the model, events within one cycle can fuse into one.",
    note: "An engineering model from 1983, not a measurement of the brain, but it is where interface designers first met the idea that now has a width. It gets shorter as stimuli get brighter.",
    src: "Card, Moran and Newell 1983, The Psychology of Human-Computer Interaction",
  },
  {
    id: "categorise", kind: "brain", name: "Brain tells animal from no animal in a flashed photo", ms: 150,
    what: "Photos were flashed for 20 ms and people decided whether each held an animal. The brain's responses for the two kinds of picture had already separated by about 150 ms.",
    note: "150 ms is when the difference appears in the EEG, not when anyone answers.",
    src: "Thorpe, Fize and Marlot 1996, Nature 381:520",
  },
  {
    id: "luu", kind: "machine", name: "Keypress to screen, measured on 2014 to 2017 machines", ms: 50, lo: 50, hi: 200, rangeOnly: true,
    what: "Dan Luu filmed keypresses at 240 frames a second and timed them to the character appearing in a terminal. Machines from 2014 to 2017 ranged from 50 to 200 ms; an Apple IIe from 1983 managed 30.",
    note: "One unit per machine, and the terminal app matters, but it is end to end: everything the keypress chart adds up, measured.",
    src: "Luu 2017, Computer latency: 1977 to 2017, danluu.com",
  },
  {
    id: "rt", kind: "behaviour", name: "Simple reaction time to a light, in a lab", ms: 213,
    what: "1,469 people aged 18 to 65 pressed a button when a light appeared: 231 ms on average, 213 ms once the test hardware's own delay is taken out. It slows by about half a millisecond a year.",
    note: "Of the 213 ms, the authors estimate about 131 ms is spent detecting the stimulus; the rest is deciding and moving.",
    src: "Woods, Wyma, Yund, Herron and Reed 2015, Front Hum Neurosci 9:131",
  },
  {
    id: "online", kind: "behaviour", name: "Reaction time online, through people's own machines", ms: 273,
    what: "The median of over 81 million clicks on Human Benchmark's reaction test. The site says its scores include the latency of your computer and monitor, and that they have got slightly slower over the years as input and display technology changed.",
    note: "Not a controlled comparison with the lab figure above, but the 60 ms between them is about the size of a machine's keypress-to-screen time.",
    src: "Human Benchmark, Reaction Time Test statistics, read 19 October 2026",
  },
];
