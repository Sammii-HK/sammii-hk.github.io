// INVENTED takes for an invented script. Nothing here is a real recording. Each take lists, per phrase,
// which script words were not heard, how many ums were added, how long the phrase took, and whether the eyes were on the lens.
import { tokeniseScript, splitScriptIntoPhrases } from './score.mjs';
export const SCRIPT = "I spent the weekend teaching a computer to choose my best take, and it turned out to be a short list of small rules. First it counts the words I actually said. Then it penalises every um, but it never decides alone.";
export const scriptWords = tokeniseScript(SCRIPT);
export const phrases = splitScriptIntoPhrases(scriptWords);
// per take: one entry per phrase
const spec = {
  'Take 1': [{ miss: [], ums: 2, sec: 4.6, gaze: 0 }, { miss: [], ums: 0, sec: 3.6, gaze: 0.2 }, { miss: [], ums: 0, sec: 2.9, gaze: 0 }, { miss: [], ums: 1, sec: 4.1, gaze: 0.2 }, { miss: [], ums: 0, sec: 2.2, gaze: 0 }],
  'Take 2': [{ miss: [], ums: 0, sec: 5.0, gaze: 0.2 }, { miss: [], ums: 0, sec: 4.2, gaze: 0 }, { miss: ['said.'], ums: 0, sec: 2.4, gaze: 0.2 }, { miss: [], ums: 0, sec: 3.4, gaze: 0 }, { miss: [], ums: 0, sec: 2.5, gaze: 0.2 }],
  'Take 3': [{ miss: ['best'], ums: 0, sec: 3.2, gaze: 0 }, { miss: [], ums: 1, sec: 3.9, gaze: 0.2 }, { miss: [], ums: 0, sec: 2.4, gaze: 0.2 }, { miss: [], ums: 0, sec: 2.0, gaze: 0 }, { miss: ['alone.'], ums: 0, sec: 1.4, gaze: 0 }],
};
export const takes = Object.entries(spec).map(([name, rows]) => ({
  name,
  rows: phrases.map((p, i) => {
    const r = rows[i] ?? { miss: [], ums: 0, sec: 3, gaze: 0 };
    const heard = scriptWords.slice(p.from, p.to + 1).filter((w) => !r.miss.includes(w));
    const ws = heard.map((word) => ({ word, isFiller: false }));
    for (let k = 0; k < r.ums; k++) ws.splice(Math.min(ws.length, 2 + k * 2), 0, { word: 'um', isFiller: true });
    return { window: { start: 0, end: r.sec, words: ws }, gazeBonus: r.gaze, missed: r.miss };
  }),
}));
