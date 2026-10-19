/**
 * The electromagnetic spectrum by wavelength, in metres, and the ranges
 * other animals see or sense, in nanometres. Band edges follow ISO 21348
 * (2007) where it gives them; microwave and radio follow the usual
 * engineering convention, because ISO's own are specific to solar
 * irradiance. Every animal range is from the source in its `src`, and
 * ranges that the sources give only roughly are marked `approx`.
 */
export type Band = { id: string; name: string; lo: number; hi: number };

/** The full axis: 10 fm (the top of ISO's gamma band) to 100 km. */
export const FULL = { lo: 1e-14, hi: 1e5 };
export const VISIBLE = { lo: 380e-9, hi: 760e-9 };

export const BANDS: Band[] = [
  { id: "gamma", name: "Gamma", lo: 1e-14, hi: 1e-12 },
  { id: "xray", name: "X-rays", lo: 1e-12, hi: 1e-8 },
  { id: "uv", name: "UV", lo: 1e-8, hi: 400e-9 },
  { id: "ir", name: "Infrared", lo: 760e-9, hi: 1e-3 },
  { id: "micro", name: "Microwave", lo: 1e-3, hi: 1 },
  { id: "radio", name: "Radio", lo: 1, hi: 1e5 },
  { id: "visible", name: "Visible", lo: 380e-9, hi: 760e-9 },
];

/** The closer views: where eyes see (250 nm to 1 µm), and where heat senses work (1 to 30 µm). */
export const ZOOM = { lo: 250e-9, hi: 1e-6 };
export const HEAT = { lo: 1e-6, hi: 30e-6 };
export const ZOOM_BANDS: Band[] = [
  { id: "uvc", name: "UV-C", lo: 100e-9, hi: 280e-9 },
  { id: "uvb", name: "UV-B", lo: 280e-9, hi: 315e-9 },
  { id: "uva", name: "UV-A", lo: 315e-9, hi: 400e-9 },
  { id: "visible", name: "visible", lo: 380e-9, hi: 760e-9 },
  { id: "ira", name: "IR-A", lo: 760e-9, hi: 1400e-9 },
  { id: "irb", name: "IR-B", lo: 1.4e-6, hi: 3e-6 },
  { id: "irc", name: "IR-C", lo: 3e-6, hi: 1e-3 },
];

/** Reference lines on the closer views, in nm. */
export const MARKERS = [
  { id: "uva", short: "MA cube", at: 355, text: "UV-A, 315 to 400 nm (ISO 21348), the band a blacklight emits. It is where the quotes in my MA cube, painted in ultraviolet-reactive ink, became readable: the paint absorbs it and re-emits visible light." },
  { id: "body", short: "37 °C", at: 9343, text: "A body at 37 °C radiates most strongly at 9.3 µm (Wien's displacement law, b = 2.898 × 10⁻³ m·K). Skin is a little cooler, so a little longer." },
];

export type Seer = {
  id: string;
  name: string;
  kind: "eye" | "heat";
  how: string;
  /** nm */
  lo: number;
  hi: number;
  /** receptor peak sensitivities, nm */
  peaks?: number[];
  approx?: boolean;
  what: string;
  note?: string;
  src: string;
};

export const SEERS: Seer[] = [
  {
    id: "human", name: "Human", kind: "eye", how: "Eyes, three cone types", lo: 380, hi: 760, peaks: [420, 534, 563],
    what: "The visible band as ISO 21348 draws it, 380 to 760 nm. Three kinds of cone, peaking at about 420, 534 and 563 nm, and rods at about 498 nm for dim light.",
    note: "The edges are soft: the CIE puts the lower limit anywhere from 360 to 400 nm and the upper from 760 to 830 nm, depending on how bright the light is.",
    src: "ISO 21348:2007; Bowmaker and Dartnall 1980, J Physiol 298:501; CIE S 017:2020, 17-21-003.",
  },
  {
    id: "aphakic", name: "Human, without a lens", kind: "eye", how: "Eyes, after the lens is removed", lo: 315, hi: 760,
    what: "The lens, not the retina, is what stops us seeing ultraviolet: it lets through less than 5% of light shorter than 400 nm. People whose lens has been removed (aphakia) detect light down to about 315 nm, the limit set by the cornea.",
    note: "Measured in dim light, 8.8° from the centre of gaze, in four aphakic eyes against five with lenses. The receptors could always see it; the lens was in the way.",
    src: "Griswold and Stark 1992, Vision Res 32:1739; van Norren and Vos 1974, Vision Res 14:1237.",
  },
  {
    id: "bee", name: "Honeybee", kind: "eye", how: "Compound eyes, three receptor types", lo: 300, hi: 650, peaks: [344, 436, 544], approx: true,
    what: "Ultraviolet, blue and green receptors, peaking at about 344, 436 and 544 nm. Bees see into the ultraviolet and lose red: the range is usually given as about 300 to 650 nm, where the green receptor's sensitivity fades.",
    note: "Many flowers carry ultraviolet patterns we cannot see; Bjørn Rørslett's ultraviolet photographs of flowers show them.",
    src: "Hempel de Ibarra, Vorobyev and Menzel 2014, J Comp Physiol A 200:411 (after Menzel and Backhaus 1991); range from Garcia et al. 2020, Front Plant Sci 11:601700, after Peitsch et al. 1992.",
  },
  {
    id: "bird", name: "Birds with UV cones", kind: "eye", how: "Eyes, four single-cone types", lo: 310, hi: 700, peaks: [355, 380], approx: true,
    what: "Four kinds of colour cone where we have three. In ultraviolet-sensitive species the fourth peaks between about 355 and 380 nm, and their eye media pass half the light at wavelengths as short as 310 to 343 nm.",
    note: "The two ticks mark the range of the ultraviolet cone's peak across species, not two cones. The 700 nm upper edge is the convention modellers use, not a measured cut-off.",
    src: "Hart and Hunt 2007, Am Nat 169:S7; Ödeen and Håstad 2013, BMC Evol Biol 13:36; Lind et al. 2014, Proc R Soc B 281:20132209; Venable, Gahm and Prum 2022, Commun Biol 5:576.",
  },
  {
    id: "mantis", name: "Mantis shrimp", kind: "eye", how: "Compound eyes, twelve receptor types", lo: 300, hi: 720,
    what: "Twelve photoreceptor types, each sampling a narrow slice from deep ultraviolet to far red, 300 to 720 nm, and the first animal shown to see circularly polarised light.",
    note: "Twelve channels and, tested, surprisingly poor at telling close colours apart: the researchers think it recognises colours by scanning rather than comparing them. More receptors is not more seeing.",
    src: "Thoen, How, Chiou and Marshall 2014, Science 343:411; Chiou et al. 2008, Curr Biol 18:429.",
  },
  {
    id: "viper", name: "Pit viper", kind: "heat", how: "Pit organs, a heat sense", lo: 3000, hi: 15000, approx: true,
    what: "Not an eye. The pit organ is a thin membrane warmed by radiation and read by heat-sensitive TRPA1 channels, so it has no pigment and no sharp band. It responds most strongly at about 3 to 15 µm, where warm bodies glow, and rattlesnakes have found a mouse-sized warm target a metre away with no visual cues.",
    note: "A body at 37 °C radiates most strongly at 9.3 µm (Wien's law). The 3 to 15 µm range is the least well sourced figure on the chart: it comes from a review, with strongest absorption measured at 8 to 12 µm in pythons.",
    src: "Gracheva et al. 2010, Nature 464:1006; Grace et al. 1999, Biosens Bioelectron 14:53; Goris 2011, J Herpetol 45:2; Ebert and Westhoff 2006, J Comp Physiol A 192:941.",
  },
];

/** Where to stop counting, for the linear-frequency fraction. Energies in eV. */
export const CUTOFFS: { id: string; name: string; label: string; eV: number; src: string }[] = [
  { id: "xray", name: "the end of X-rays", label: "the shortest X-ray in ISO 21348 (1 pm, 1.24 MeV)", eV: 1.2398e6, src: "ISO 21348:2007 puts the boundary between hard X-rays and gamma rays at 0.001 nm. Photon energy is hc/λ." },
  { id: "gamma", name: "the end of ISO's gamma rays", label: "the shortest gamma ray in ISO 21348 (10 fm, 124 MeV)", eV: 1.2398e8, src: "ISO 21348:2007 lists gamma rays from 0.00001 to 0.001 nm. Photon energy is hc/λ." },
  { id: "lhaaso", name: "1.4 PeV, LHAASO 2021", label: "a 1.4 PeV photon, among the most energetic ever detected", eV: 1.4e15, src: "Cao et al. (LHAASO) 2021, Ultrahigh-energy photons up to 1.4 petaelectronvolts from 12 γ-ray Galactic sources, Nature 594:33. In 2026 LHAASO reported photons from Cygnus X-3 at up to about 3.7 PeV (Natl Sci Rev, arXiv:2512.16638), which would make the fraction smaller still." },
];
