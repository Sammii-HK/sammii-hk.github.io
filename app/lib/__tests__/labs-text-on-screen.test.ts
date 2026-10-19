import { describe, it, expect } from "vitest";
import { BBC_WPM, FIXED_CARD, SAMPLES, SILENT_WPM, atWpm, cardSeconds, noteSeconds, toLine, wordsThatFit } from "../../labs/charts/text-on-screen/data";

// Chart 36 ports two rules from the video app (TextBeatAssembler.swift) and
// quotes their results in its copy and facts. These pin both.

describe("the app's rules, ported", () => {
  it("note rule: words / 4 + 0.3 s", () => {
    expect(noteSeconds(12)).toBeCloseTo(3.3);
    expect(noteSeconds(20)).toBeCloseTo(5.3);
  });
  it("card rule: max(1.8, words / 3 + 0.5), the extras, and two 0.15 s fades", () => {
    expect(cardSeconds("Read this first.")).toBeCloseTo(1.8 + 0.3); // three words: the 1.8 s floor
    expect(cardSeconds(SAMPLES[2])).toBeCloseTo(4.5 + 0.3); // 12 plain words
    expect(cardSeconds("we shipped 3 builds")).toBeCloseTo(Math.max(1.8, 4 / 3 + 0.5) + 0.3 + 0.3); // a number
    expect(cardSeconds("check the LUFS meter")).toBeCloseTo(Math.max(1.8, 4 / 3 + 0.5) + 0.2 + 0.3); // an acronym
    expect(cardSeconds("an extraordinary week")).toBeCloseTo(1.8 + 0.15 + 0.3); // a long word
  });
});

describe("the numbers the page quotes", () => {
  it("samples have 4, 8, 12 and 20 words", () => {
    expect(SAMPLES.map((s) => toLine(s).words)).toEqual([4, 8, 12, 20]);
  });
  it("a 2 s card on 12 words is 360 wpm, and holds 6, 7 and 6 words by the three rules", () => {
    expect((12 / FIXED_CARD) * 60).toBe(360);
    expect(wordsThatFit(FIXED_CARD, noteSeconds)).toBe(6);
    expect(wordsThatFit(FIXED_CARD, (w) => atWpm(w, SILENT_WPM))).toBe(7);
    expect(wordsThatFit(FIXED_CARD, (w) => atWpm(w, BBC_WPM[1]))).toBe(6);
  });
  it("a 12-word line is 4 to 4.5 s at the BBC's rate", () => {
    expect(atWpm(12, BBC_WPM[1])).toBeCloseTo(4);
    expect(atWpm(12, BBC_WPM[0])).toBeCloseTo(4.5);
  });
});
