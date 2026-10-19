/**
 * Touch targets, to scale. The guidelines are written in CSS pixels, points
 * and dp; fingers are in millimetres. A CSS pixel's physical size depends on
 * the screen: 25.4 mm divided by the CSS pixels the screen shows per inch,
 * which is its pixel density divided by its device pixel ratio. Screen
 * figures are from the makers' published specs. Sources in the page footer.
 */
export const MM_PER_IN = 25.4;
export const mmOf = (css: number, cssPerIn: number) => (css * MM_PER_IN) / cssPerIn;
export const cssOf = (mm: number, cssPerIn: number) => (mm * cssPerIn) / MM_PER_IN;

export type Target = { id: string; name: string; css: number; unit: string; rule: string; source: string };
export const TARGETS: Target[] = [
  { id: "wcag-min", name: "WCAG 2.2 minimum", css: 24, unit: "24 × 24 CSS px", rule: "Success criterion 2.5.8, level AA. Smaller targets pass only if a 24 px circle centred on each one touches no other target or circle.", source: "WCAG 2.2, 2.5.8 Target Size (Minimum)" },
  { id: "wcag-enh", name: "WCAG enhanced", css: 44, unit: "44 × 44 CSS px", rule: "Success criterion 2.5.5, level AAA, the stricter one, recommended for important controls.", source: "WCAG 2.2, 2.5.5 Target Size (Enhanced)" },
  { id: "apple", name: "Apple", css: 44, unit: "44 × 44 pt", rule: "A minimum hit region of 44 by 44 points (60 on visionOS). In Safari on iOS a point is a CSS pixel.", source: "Apple Human Interface Guidelines, Buttons" },
  { id: "material", name: "Material", css: 48, unit: "48 × 48 dp", rule: "At least 48 by 48 dp, separated by 8 dp or more; Google calls that about 9 mm whatever the screen. In Chrome on Android a dp is a CSS pixel.", source: "Android Accessibility Help, Touch target size" },
];

export type Finger = { id: string; name: string; mm: [number, number]; what: string; source: string };
export const FINGERS: Finger[] = [
  { id: "contact", name: "Fingertip contact", mm: [8, 10], what: "The patch of a fingertip that meets the glass on a tap.", source: "The MIT Touch Lab figure as given in Ubuntu's finger-UI design guide" },
  { id: "index", name: "Index finger, width", mm: [16, 20], what: "How wide an adult index fingertip is: what covers the target and hides it while you aim.", source: "MIT Touch Lab, as cited by Nielsen Norman Group and Smashing Magazine" },
  { id: "thumb", name: "Thumb, width", mm: [25, 25], what: "An average adult thumb, about an inch across. Most phone taps are thumbs.", source: "Smashing Magazine, Finger-friendly design" },
];

/** what studies and platform makers say a touch target should measure, in millimetres */
export const FINDINGS: { id: string; mm: number; what: string; source: string }[] = [
  { id: "parhi-discrete", mm: 9.2, what: "One-handed thumb taps on single targets: big enough for speed and accuracy, and what people preferred.", source: "Parhi, Karlson and Bederson, MobileHCI 2006" },
  { id: "parhi-serial", mm: 9.6, what: "The same, for a run of taps such as typing a code.", source: "Parhi, Karlson and Bederson, MobileHCI 2006" },
  { id: "nng", mm: 10, what: "Nielsen Norman Group's physical minimum, 1 cm by 1 cm, from the same study.", source: "Nielsen Norman Group, Touch targets on touchscreens (2019)" },
];

export type Screen = { id: string; name: string; cssPerIn: number; how: string };
export const SCREENS: Screen[] = [
  { id: "iphone", name: "iPhone 16", cssPerIn: 460 / 3, how: "460 ppi, 3 device pixels to a CSS pixel" },
  { id: "pixel", name: "Pixel 8", cssPerIn: 428 / 2.625, how: "428 ppi, 2.625 device pixels to a CSS pixel" },
  { id: "android", name: "Android baseline", cssPerIn: 160, how: "one dp is one pixel at 160 dpi, by definition" },
  { id: "macbook", name: "MacBook Air 13-inch", cssPerIn: (224 * 1470) / 2560, how: "224 ppi, shown at the default 1470 × 956" },
  { id: "monitor", name: "24-inch 1080p monitor", cssPerIn: Math.hypot(1920, 1080) / 24, how: "about 92 ppi, 1 device pixel to a CSS pixel" },
  { id: "css", name: "The CSS inch", cssPerIn: 96, how: "CSS defines 1in as 96px; few real screens match it" },
];

/** A bank card, ISO/IEC 7810 ID-1: the one object of known size most people have to hand. */
export const CARD_MM: [number, number] = [85.6, 53.98];

/** A first guess at this screen's CSS pixels per inch, before calibration. */
export function guessCssPerIn(coarse: boolean, dpr: number): { cssPerIn: number; why: string } {
  if (coarse) return { cssPerIn: 160, why: "a guess from touch input: phones sit between about 150 and 165" };
  if (dpr >= 2) return { cssPerIn: 128, why: "a guess from the pixel ratio, as on a MacBook Air, which shows about 129" };
  return { cssPerIn: 96, why: "a guess: the CSS inch, which a standard-density monitor roughly matches" };
}
