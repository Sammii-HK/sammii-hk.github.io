/**
 * Just enough colour maths for the charts, from first principles (the same
 * conversions Gamut uses): sRGB companding, OKLab/OKLCH (Ottosson 2020),
 * CIELAB (D65), HSL, and relative luminance (WCAG). All in [0,1] unless
 * stated. No dependencies, so the numbers on the page are checkable.
 */
export type RGB = [number, number, number];

export const srgbToLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
export const linearToSrgb = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

/** WCAG relative luminance of an sRGB colour (0 black, 1 white). */
export function luminance([r, g, b]: RGB): number {
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

export function hslToRgb(h: number, s: number, l: number): RGB {
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return [f(0), f(8), f(4)];
}

export function oklabToLinearRgb(L: number, a: number, b: number): RGB {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}
export function oklchToRgb(L: number, C: number, h: number): RGB {
  const rad = (h * Math.PI) / 180;
  const lin = oklabToLinearRgb(L, C * Math.cos(rad), C * Math.sin(rad));
  return lin.map(linearToSrgb) as RGB;
}

/** CIELAB (D65 white) to sRGB. */
export function labToRgb(L: number, a: number, b: number): RGB {
  const fy = (L + 16) / 116, fx = fy + a / 500, fz = fy - b / 200;
  const finv = (t: number) => (t ** 3 > 0.008856 ? t ** 3 : (t - 16 / 116) / 7.787);
  const X = 0.95047 * finv(fx), Y = 1.0 * finv(fy), Z = 1.08883 * finv(fz);
  const lin: RGB = [
    3.2404542 * X - 1.5371385 * Y - 0.4985314 * Z,
    -0.969266 * X + 1.8760108 * Y + 0.041556 * Z,
    0.0556434 * X - 0.2040259 * Y + 1.0572252 * Z,
  ];
  return lin.map(linearToSrgb) as RGB;
}
export const lchToRgb = (L: number, C: number, h: number) => labToRgb(L, C * Math.cos((h * Math.PI) / 180), C * Math.sin((h * Math.PI) / 180));

export const inGamut = (rgb: RGB) => rgb.every((c) => c >= -0.0005 && c <= 1.0005);
export const clamp = (rgb: RGB) => rgb.map((c) => Math.min(1, Math.max(0, c))) as RGB;
export const toCss = (rgb: RGB) => `rgb(${clamp(rgb).map((c) => Math.round(c * 255)).join(" ")})`;
export const toHex = (rgb: RGB) => "#" + clamp(rgb).map((c) => Math.round(c * 255).toString(16).padStart(2, "0")).join("");

/** sRGB (0..1) to Oklab, the inverse of oklabToLinearRgb (Ottosson 2020). */
export function rgbToOklab([r, g, b]: RGB): [number, number, number] {
  const lr = srgbToLinear(r), lg = srgbToLinear(g), lb = srgbToLinear(b);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
}
export function rgbToOklch(rgb: RGB): [number, number, number] {
  const [L, a, b] = rgbToOklab(rgb);
  const C = Math.hypot(a, b);
  let h = (Math.atan2(b, a) * 180) / Math.PI; if (h < 0) h += 360;
  return [L, C, C < 1e-4 ? 0 : h];
}
