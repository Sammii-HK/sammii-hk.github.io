/**
 * How long a line of text needs on screen, by several rules: the two in my
 * video app (TextBeatAssembler, in the PostReady codebase), measured silent
 * reading speed, and the subtitle standards. Every rule is a function of
 * the line itself, so the chart can price any line you type. Sources are
 * in the page footer.
 */
export type Line = { text: string; words: number; chars: number };
export const toLine = (text: string): Line => {
  const t = text.trim();
  return { text: t, words: t ? t.split(/\s+/).length : 0, chars: Array.from(t).length };
};

/** words / 4 + 0.3 s: TextBeatAssembler.noteReadableSeconds */
export const noteSeconds = (words: number) => words / 4 + 0.3;

/** The card floor in the same file, TextBeatAssembler.readableSeconds: max(1.8, words / 3 + 0.5), plus time for numbers, acronyms and long words, plus a 0.15 s fade in and out. */
export const CARD_FADE = 0.15;
export function cardSeconds(text: string): number {
  const words = text.trim() ? text.trim().split(/\s+/) : [];
  let s = Math.max(1.8, words.length / 3 + 0.5);
  for (const w of words) {
    // a letter is a character with case; close to Swift's isLetter for the Latin text this is written for
    const letters = Array.from(w).filter((ch) => ch.toLowerCase() !== ch.toUpperCase()).join("");
    if (/\d/.test(w)) s += 0.3;
    else if (letters.length >= 3 && letters === letters.toUpperCase()) s += 0.2;
    else if (letters.length >= 9) s += 0.15;
  }
  return s + 2 * CARD_FADE;
}
/** the card rule for a line of plain short words, for drawing the curve */
export const cardBaseSeconds = (words: number) => Math.max(1.8, words / 3 + 0.5) + 2 * CARD_FADE;

/** Brysbaert (2019): silent reading of English non-fiction averages 238 words a minute; most adults fall between about 175 and 300. */
export const SILENT_WPM = 238, SILENT_RANGE: [number, number] = [175, 300];
/** BBC Subtitle Guidelines: 160 to 180 words a minute, 0.33 to 0.375 s a word. */
export const BBC_WPM: [number, number] = [160, 180];
/** Netflix Timed Text Style Guide: up to 20 characters a second for adult programmes, 17 for children's. */
export const NETFLIX_CPS = 20, NETFLIX_KIDS_CPS = 17;
/** Netflix: no subtitle shorter than 20 frames (about 0.8 s). */
export const NETFLIX_MIN = 0.8;
export const FIXED_CARD = 2;

export const atWpm = (words: number, wpm: number) => (words * 60) / wpm;
/** the words a line can hold at a given rule before it outgrows a fixed card */
export const wordsThatFit = (seconds: number, perWord: (w: number) => number) => { let w = 0; while (perWord(w + 1) <= seconds) w++; return w; };

export type Rule = { id: string; name: string; who: string; seconds: (l: Line) => number; band?: (l: Line) => [number, number] };
export const RULES: Rule[] = [
  { id: "fixed", name: "A fixed 2 s card", who: "The default in a lot of templates: every line gets the same time, whatever it says.", seconds: () => FIXED_CARD },
  { id: "note", name: "My note rule", who: "A quarter of a second a word plus 0.3 s. The floor my video app gives each line of a silent text note, which loops, so a viewer gets a second pass.", seconds: (l) => noteSeconds(l.words) },
  { id: "silent", name: "Silent reading, 238 wpm", who: "The average for adults reading English non-fiction on a page, from 190 studies. Most adults fall between 175 and 300.", seconds: (l) => atWpm(l.words, SILENT_WPM), band: (l) => [atWpm(l.words, SILENT_RANGE[1]), atWpm(l.words, SILENT_RANGE[0])] },
  { id: "netflix", name: "Netflix, 20 characters a second", who: "The adult ceiling in Netflix's style guide; 17 for children's programmes. Counts characters, so long words cost more.", seconds: (l) => Math.max(NETFLIX_MIN, l.chars / NETFLIX_CPS), band: (l) => [Math.max(NETFLIX_MIN, l.chars / NETFLIX_CPS), Math.max(NETFLIX_MIN, l.chars / NETFLIX_KIDS_CPS)] },
  { id: "bbc", name: "BBC subtitles, 160 to 180 wpm", who: "The BBC's recommended subtitle speed: 0.33 to 0.375 s a word, with a target minimum of around 0.3 s a word.", seconds: (l) => atWpm(l.words, BBC_WPM[0]), band: (l) => [atWpm(l.words, BBC_WPM[1]), atWpm(l.words, BBC_WPM[0])] },
  { id: "card", name: "My card rule", who: "A third of a second a word plus 0.5 s, never under 1.8 s, with extra for numbers, acronyms and long words, and the fades on top. 180 wpm: the BBC's faster rate.", seconds: (l) => cardSeconds(l.text) },
];

export const SAMPLES = [
  "Nobody reads that fast.",
  "The caption vanished before I reached the end.",
  "Two seconds is plenty for six words and not enough for twelve.",
  "Silent readers manage about 240 words a minute on a page, and fewer when the words sit over moving video.",
];
