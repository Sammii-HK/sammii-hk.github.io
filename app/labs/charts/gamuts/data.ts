/**
 * CIE 1931 chromaticity (x, y) of the spectral locus at 5 nm steps, from the
 * CIE 1931 2° standard observer colour matching functions (the xyz table is
 * the Wyszecki and Stiles tabulation, rounded to four places), and the
 * primaries and white points of the common display gamuts.
 */
export const LOCUS: [number, number, number][] = [
  [380, 0.1741, 0.005], [385, 0.174, 0.005], [390, 0.1738, 0.0049], [395, 0.1736, 0.0049], [400, 0.1733, 0.0048], [405, 0.173, 0.0048], [410, 0.1726, 0.0048], [415, 0.1721, 0.0048], [420, 0.1714, 0.0051], [425, 0.1703, 0.0058], [430, 0.1689, 0.0069], [435, 0.1669, 0.0086], [440, 0.1644, 0.0109], [445, 0.1611, 0.0138], [450, 0.1566, 0.0177], [455, 0.151, 0.0227], [460, 0.144, 0.0297], [465, 0.1355, 0.0399], [470, 0.1241, 0.0578], [475, 0.1096, 0.0868], [480, 0.0913, 0.1327], [485, 0.0687, 0.2007], [490, 0.0454, 0.295], [495, 0.0235, 0.4127], [500, 0.0082, 0.5384], [505, 0.0039, 0.6548], [510, 0.0139, 0.7502], [515, 0.0389, 0.812], [520, 0.0743, 0.8338], [525, 0.1142, 0.8262], [530, 0.1547, 0.8059], [535, 0.1929, 0.7816], [540, 0.2296, 0.7543], [545, 0.2658, 0.7243], [550, 0.3016, 0.6923], [555, 0.3373, 0.6589], [560, 0.3731, 0.6245], [565, 0.4087, 0.5896], [570, 0.4441, 0.5547], [575, 0.4788, 0.5202], [580, 0.5125, 0.4866], [585, 0.5448, 0.4544], [590, 0.5752, 0.4242], [595, 0.6029, 0.3965], [600, 0.627, 0.3725], [605, 0.6482, 0.3514], [610, 0.6658, 0.334], [615, 0.6801, 0.3197], [620, 0.6915, 0.3083], [625, 0.7006, 0.2993], [630, 0.7079, 0.292], [635, 0.7140, 0.2859], [640, 0.7190, 0.2809], [645, 0.723, 0.277], [650, 0.7260, 0.2740], [655, 0.7283, 0.2717], [660, 0.73, 0.27], [665, 0.7311, 0.2689], [670, 0.732, 0.268], [675, 0.7327, 0.2673], [680, 0.7334, 0.2666], [685, 0.734, 0.266], [690, 0.7344, 0.2656], [695, 0.7346, 0.2654], [700, 0.7347, 0.2653],
];

export type Gamut = { id: string; name: string; year: number; r: [number, number]; g: [number, number]; b: [number, number]; white: [number, number]; note: string; mediaQuery?: string };

export const GAMUTS: Gamut[] = [
  { id: "srgb", name: "sRGB", year: 1996, r: [0.64, 0.33], g: [0.3, 0.6], b: [0.15, 0.06], white: [0.3127, 0.329], note: "Rec. 709 primaries, D65 white. The default of the web and of every image without a profile.", mediaQuery: "(color-gamut: srgb)" },
  { id: "p3", name: "Display P3", year: 2015, r: [0.68, 0.32], g: [0.265, 0.69], b: [0.15, 0.06], white: [0.3127, 0.329], note: "DCI-P3 primaries with sRGB's white and transfer curve. Most phones and laptops since about 2016.", mediaQuery: "(color-gamut: p3)" },
  { id: "adobe", name: "Adobe RGB", year: 1998, r: [0.64, 0.33], g: [0.21, 0.71], b: [0.15, 0.06], white: [0.3127, 0.329], note: "sRGB's red and blue with a much greener green, to cover the cyans and greens of CMYK print." },
  { id: "rec2020", name: "Rec. 2020", year: 2012, r: [0.708, 0.292], g: [0.17, 0.797], b: [0.131, 0.046], white: [0.3127, 0.329], note: "Ultra HD primaries on the spectral locus itself: pure single wavelengths at 630, 532 and 467 nm. No commercial display reaches it.", mediaQuery: "(color-gamut: rec2020)" },
];
