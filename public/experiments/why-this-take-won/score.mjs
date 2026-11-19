// Port of PostReady/Pipeline/MultiTakeAssembler.swift (commit 3fff237a): scorePhrase, splitScriptIntoPhrases, tokeniseScript.
// Pure functions only. Defaults are the Swift constants; the optional `w` argument exists so the page can show what a weight does.
export const SWIFT_WEIGHTS = { filler: 0.4, gaze: 1, target: 2.58, free: 0.8, ramp: 1.2, paceMax: 0.2, pacePenalty: 0.6 };
const CONJ = new Set(['and', 'but', 'or', 'so', 'because', 'then', 'though', 'while']);
export const normalise = (w) => w.toLowerCase().replace(/^\p{P}+|\p{P}+$/gu, '');
const endsSentence = (w) => ['.', '!', '?'].includes(w.slice(-1));
const endsPhrase = (w) => [',', ';', ':'].includes(w.slice(-1));
export const tokeniseScript = (s) => s.split(/\s+/).filter(Boolean);

export function splitScriptIntoPhrases(words) {
  const phrases = []; let start = 0; const maxLen = 14, minLen = 3;
  for (let i = 0; i < words.length; i++) {
    const len = i - start + 1; const last = i === words.length - 1; let cut = false;
    if (endsSentence(words[i])) cut = true;
    else if (endsPhrase(words[i]) && len >= minLen) cut = true;
    else if (len >= minLen && i + 1 < words.length && CONJ.has(normalise(words[i + 1]))) cut = true;
    else if (len >= maxLen) cut = true;
    if (last) cut = true;
    if (cut) { phrases.push({ from: start, to: i }); start = i + 1; }
  }
  return phrases;
}

/** Returns the same number scorePhrase returns, plus the four parts it is the sum of. */
export function scorePhrase({ phrase, scriptWords, window, gazeBonus = 0 }, w = SWIFT_WEIGHTS) {
  const fillers = window.words.filter((x) => x.isFiller).length;
  const filler = -fillers * w.filler;
  const expected = new Set(scriptWords.slice(phrase.from, phrase.to + 1).map(normalise));
  const heard = new Set(window.words.map((x) => normalise(x.word)));
  let hits = 0; for (const e of expected) if (heard.has(e)) hits++;
  const coverage = expected.size === 0 ? 1 : hits / expected.size;
  const sec = Math.max(0.001, window.end - window.start);
  const wps = window.words.length / sec;
  const delta = Math.abs(wps - w.target);
  const pace = delta <= w.free ? w.paceMax * (1 - delta / w.free) : -w.pacePenalty * Math.min(1, (delta - w.free) / w.ramp);
  const gaze = gazeBonus;
  return { total: coverage + filler + pace + gaze, coverage, filler, pace, gaze, wps, fillers, hits, expected: expected.size };
}
