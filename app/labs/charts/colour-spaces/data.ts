/**
 * The family tree of colour spaces: what each one was for, who made it,
 * when, and what it descends from. Dates are the year of the defining
 * publication or standard. Lanes group by purpose, not by maths.
 */
export type Lane = "perceptual" | "appearance" | "display" | "broadcast" | "artist" | "print";

export type Space = {
  id: string;
  name: string;
  year: number;
  lane: Lane;
  by: string;
  what: string;
  why: string;
  /** ids this space is derived from or defined in terms of */
  parents: string[];
  /** a CSS colour expressing "the same red" in this space, where browsers can render it */
  css?: string;
  /** a ramp of equal-step colours in this space, for the side panel */
  ramp?: string[];
};

export const LANES: { id: Lane; label: string; note: string }[] = [
  { id: "perceptual", label: "Perceptual", note: "Spaces built to make equal steps look equal" },
  { id: "appearance", label: "Appearance models", note: "Predict what a colour looks like in context" },
  { id: "display", label: "Display and device", note: "What a screen can show; encoded RGB" },
  { id: "broadcast", label: "Broadcast and video", note: "Luma plus chroma, built for bandwidth" },
  { id: "artist", label: "Hue, saturation, lightness", note: "Cheap coordinates for picking colour by hand" },
  { id: "print", label: "Print and pigment", note: "Ink on paper, subtractive" },
];

const stepsHsl = Array.from({ length: 9 }, (_, i) => `hsl(${i * 40} 70% 55%)`);
const stepsLch = Array.from({ length: 9 }, (_, i) => `lch(62% 60 ${i * 40})`);
const stepsOklch = Array.from({ length: 9 }, (_, i) => `oklch(0.68 0.16 ${i * 40})`);
const stepsLab = ["lab(30% 40 -30)", "lab(40% 45 -20)", "lab(50% 50 -10)", "lab(60% 55 0)", "lab(70% 55 15)", "lab(78% 50 30)", "lab(85% 40 45)", "lab(90% 25 55)", "lab(94% 10 60)"];
const stepsP3 = Array.from({ length: 9 }, (_, i) => `color(display-p3 ${(1 - i / 8).toFixed(2)} ${(i / 8).toFixed(2)} 0.2)`);
const stepsSrgb = Array.from({ length: 9 }, (_, i) => `rgb(${Math.round(255 * (1 - i / 8))} ${Math.round(255 * (i / 8))} 51)`);

export const SPACES: Space[] = [
  { id: "munsell", name: "Munsell", year: 1905, lane: "perceptual", by: "Albert Munsell", what: "Hue, value and chroma arranged so that equal steps are equally different to the eye, measured by asking people.", why: "The first colour order system built from perception rather than from a device. Its spacing was later used to check CIELAB.", parents: [] },
  { id: "cierGB", name: "CIE RGB", year: 1931, lane: "display", by: "CIE, from Wright and Guild", what: "Colour matching functions from experiments where observers mixed three primaries to match a test light.", why: "The raw data every later space stands on: how much of three lights a standard observer needs to match any colour.", parents: [] },
  { id: "xyz", name: "CIE XYZ", year: 1931, lane: "perceptual", by: "CIE", what: "A linear transform of CIE RGB chosen so every real colour has positive coordinates and Y is luminance.", why: "The device-independent reference. Every space below is defined by how it converts to and from XYZ.", parents: ["cierGB"] },
  { id: "yiq", name: "YIQ", year: 1953, lane: "broadcast", by: "NTSC", what: "Luma plus two chroma axes, rotated so the axis the eye sees best gets the most bandwidth.", why: "Colour television that stayed compatible with black-and-white sets: the luma signal is the old picture.", parents: ["cierGB"] },
  { id: "yuv", name: "YUV / YCbCr", year: 1982, lane: "broadcast", by: "PAL, then CCIR 601", what: "Luma and two colour-difference signals, subsampled because the eye resolves brightness better than colour.", why: "Still how every JPEG, video codec and HDMI link carries colour.", parents: ["yiq"] },
  { id: "lab", name: "CIELAB", year: 1976, lane: "perceptual", by: "CIE", what: "XYZ passed through a cube root, then split into lightness and two opponent axes, a (green to red) and b (blue to yellow).", why: "The workhorse perceptual space for fifty years: colour difference, print profiles, and the reason 'delta E' means anything.", parents: ["xyz", "munsell"], css: "lab(55% 70 50)", ramp: stepsLab },
  { id: "luv", name: "CIELUV", year: 1976, lane: "perceptual", by: "CIE", what: "The other 1976 attempt: the same lightness, but a chromaticity diagram that keeps additive mixing on straight lines.", why: "Favoured for lights and displays because mixtures of two colours fall on the line between them.", parents: ["xyz"] },
  { id: "lch", name: "LCH", year: 1976, lane: "perceptual", by: "CIE", what: "CIELAB in polar coordinates: lightness, chroma, hue angle.", why: "The same space, but you can turn the hue dial and keep the lightness. This is what designers actually want.", parents: ["lab"], css: "lch(55% 86 36)", ramp: stepsLch },
  { id: "hsl", name: "HSL and HSV", year: 1978, lane: "artist", by: "Alvy Ray Smith; Joblove and Greenberg", what: "RGB re-expressed as hue, saturation and lightness or value with a few max and min operations.", why: "Cheap enough for 1978 hardware and intuitive enough for a colour picker. Lightness here is a lie: 50% yellow and 50% blue are nowhere near equally bright.", parents: ["cierGB"], css: "hsl(10 90% 55%)", ramp: stepsHsl },
  { id: "rec709", name: "Rec. 709", year: 1990, lane: "broadcast", by: "ITU-R", what: "The HDTV primaries, white point and transfer curve.", why: "Fixed the red, green and blue of every HD television, and by inheritance of every monitor.", parents: ["xyz", "yuv"] },
  { id: "srgb", name: "sRGB", year: 1996, lane: "display", by: "HP and Microsoft", what: "Rec. 709 primaries with a transfer curve matching a CRT, written down so the web and Windows agreed on what a colour number meant.", why: "The default colour space of everything for thirty years. Its gamut is the box every 'wide colour' space is measured against.", parents: ["rec709"], css: "rgb(230 60 40)", ramp: stepsSrgb },
  { id: "adobergb", name: "Adobe RGB", year: 1998, lane: "display", by: "Adobe", what: "sRGB's white point with a wider green primary, to cover more of what CMYK printers could reproduce.", why: "The photographer's working space, and the first time most people met the idea that RGB numbers need a profile.", parents: ["srgb"] },
  { id: "ipt", name: "IPT", year: 1998, lane: "perceptual", by: "Ebner and Fairchild", what: "XYZ to cone responses (LMS), a power curve, then intensity plus two opponent axes; hue lines that stay straight.", why: "Fixed CIELAB's blue problem, where lowering chroma turns blue purple. Later became the backbone of ICtCp.", parents: ["xyz"] },
  { id: "ciecam02", name: "CIECAM02", year: 2002, lane: "appearance", by: "CIE", what: "A colour appearance model: takes the colour, the white, the surround and the luminance level, and predicts lightness, chroma, hue, brightness, colourfulness and saturation.", why: "The first standard model of how context changes what you see. Too complex to type by hand, but it underpins later spaces.", parents: ["xyz"] },
  { id: "dcip3", name: "DCI-P3 / Display P3", year: 2007, lane: "display", by: "Digital Cinema Initiatives; Apple (2015)", what: "Wider red and green primaries for cinema projection; Display P3 keeps them and borrows sRGB's transfer curve and white.", why: "What your phone screen actually shows. About a quarter more colours than sRGB, mostly in the reds and greens.", parents: ["srgb"], css: "color(display-p3 0.92 0.25 0.12)", ramp: stepsP3 },
  { id: "hsluv", name: "HSLuv", year: 2012, lane: "artist", by: "Alexei Boronine", what: "CIELUV in polar coordinates with chroma rescaled per hue so 100% saturation always sits on the sRGB gamut edge.", why: "An HSL you can trust: equal lightness really is equal, and every value is displayable.", parents: ["luv", "hsl"] },
  { id: "rec2020", name: "Rec. 2020", year: 2012, lane: "broadcast", by: "ITU-R", what: "Ultra HD primaries on the spectral locus itself, covering three quarters of visible colours.", why: "The container for HDR and wide-gamut video. No display reaches it; it is the target everything aims at.", parents: ["rec709"] },
  { id: "ictcp", name: "ICtCp", year: 2016, lane: "broadcast", by: "Dolby, in Rec. 2100", what: "IPT rebuilt on the PQ curve for HDR: intensity, and two chroma axes that stay perceptually uniform across a huge luminance range.", why: "Rec. 2100's colour encoding for HDR video, where YCbCr's errors become visible.", parents: ["ipt", "rec2020"] },
  { id: "cam16", name: "CAM16 and CAM16-UCS", year: 2017, lane: "appearance", by: "Li et al.", what: "CIECAM02 with its numerical instabilities fixed, plus a uniform colour space derived from it.", why: "The appearance model under Google's HCT tonal palettes in Material You.", parents: ["ciecam02"] },
  { id: "jzazbz", name: "Jzazbz", year: 2017, lane: "perceptual", by: "Safdar et al.", what: "An HDR-capable perceptual space: PQ-encoded LMS, then an IPT-style split.", why: "Perceptual uniformity that holds from a dim room to a sunlit screen.", parents: ["ipt"] },
  { id: "oklab", name: "Oklab", year: 2020, lane: "perceptual", by: "Björn Ottosson", what: "XYZ to LMS, a cube root, then a small matrix fitted numerically so that CAM16 lightness and IPT hue both come out right.", why: "A blog post that fixed CIELAB's hue shifts with a formula short enough to memorise. Adopted by CSS within two years.", parents: ["xyz", "ipt", "cam16"], css: "oklab(0.62 0.19 0.12)" },
  { id: "oklch", name: "OKLCH", year: 2020, lane: "perceptual", by: "Björn Ottosson", what: "Oklab in polar coordinates: lightness, chroma, hue.", why: "The space design systems are moving to. Change the hue and the lightness holds, so a palette generated by formula stays even. Gamut is built on it.", parents: ["oklab", "lch"], css: "oklch(0.65 0.23 30)", ramp: stepsOklch },
  { id: "okhsl", name: "Okhsl and Okhsv", year: 2021, lane: "artist", by: "Björn Ottosson", what: "Oklab reshaped so its coordinates fill the sRGB gamut like HSL and HSV do.", why: "A colour picker with HSL's convenience and Oklab's honesty.", parents: ["oklch", "hsl"] },
  { id: "cmyk", name: "CMYK", year: 1906, lane: "print", by: "Eagle Printing Ink Company", what: "Cyan, magenta and yellow inks, plus black because the three together make brown, not black.", why: "Subtractive colour: ink removes light. Every print profile is a table from CMYK to Lab and back.", parents: [] },
  { id: "csscolor4", name: "CSS Color 4", year: 2022, lane: "display", by: "W3C CSS Working Group", what: "lab(), lch(), oklab(), oklch() and color(display-p3 …) as first-class CSS colours, with gamut mapping defined.", why: "The moment the web stopped being sRGB-only. The ramps on this page are drawn with it.", parents: ["oklch", "lab", "dcip3"] },
];

export const LINKS: { from: string; to: string; kind: "derived" | "influence" }[] = SPACES.flatMap((s) =>
  s.parents.map((p) => ({ from: p, to: s.id, kind: (p === "munsell" || (s.id === "oklab" && p !== "xyz") || (s.id === "hsluv" && p === "hsl") || (s.id === "okhsl" && p === "hsl") || (s.id === "oklch" && p === "lch")) ? "influence" as const : "derived" as const })),
);
