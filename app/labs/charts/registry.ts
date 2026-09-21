/** Every chart on labs.sammii.dev/charts, in series order. The index page and the Labs index read this. */
export type Chart = { n: string; slug: string; title: string; blurb: string; stack: string; series: string };

export const CHARTS: Chart[] = [
  { n: "01", slug: "colour-spaces", title: "The family tree of colour spaces", series: "Colour and perception", stack: "SVG, React, CSS Color 4", blurb: "25 colour spaces from Munsell and CIE XYZ to OKLCH and CSS Color 4 on a timeline in six lanes, the derivations drawn in, live ramps in each space, and the poster to download." },
  { n: "02", slug: "why-hsl-lies", title: "Why HSL lies", series: "Colour and perception", stack: "First-principles colour maths", blurb: "Twenty-four hues at one nominal lightness in HSL, CIELCH and OKLCH, with the measured luminance under every swatch. The skyline versus the flat line." },
  { n: "04", slug: "typography", title: "The typography genome", series: "Typography", stack: "Lineage tree, live specimens", blurb: "Latin type as a family tree from Textura to variable fonts, five lanes, every node shown in a live stand-in font. Serif is one unbroken line from Jenson." },
  { n: "05", slug: "keypress", title: "How a keypress becomes a pixel", series: "The browser and the machine", stack: "Latency flow, four knobs", blurb: "Twelve hops between a finger and the glass, drawn to their share of the time. The code you write is two of them; the display is three." },
  { n: "03", slug: "communication", title: "Six centuries of communication and type", series: "Typography", stack: "Scroll timeline, 65 entries", blurb: "Gutenberg to ChatGPT on one spine, inventions on the left and typefaces on the right, so the two histories read against each other." },
];

export const chartHref = (slug: string) => `https://labs.sammii.dev/charts/${slug}/`;
