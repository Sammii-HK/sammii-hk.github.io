import type { Metadata } from "next";
import { LabsShell } from "../../../src/components/labs/LabsShell";
import { TextOnScreen } from "../../../src/components/charts/TextOnScreen";
import { BBC_WPM, FIXED_CARD, SILENT_WPM, atWpm, noteSeconds, wordsThatFit } from "./data";
import "../colour-spaces/chart.css";
import "./chart.css";

export const metadata: Metadata = {
  title: "How long text needs on screen",
  description: "A line of text on video needs time to be read, and a fixed 2-second card does not give a 12-word line enough. My video app's rule, silent reading speed and the BBC and Netflix subtitle standards, as seconds against words, with a card that shows your own line for exactly as long as each rule allows.",
  alternates: { canonical: "https://labs.sammii.dev/charts/text-on-screen/" },
  openGraph: { title: "How long text needs on screen", description: "Two seconds is plenty for six words and not enough for twelve.", url: "https://labs.sammii.dev/charts/text-on-screen/", type: "article" },
};

const fitsNote = wordsThatFit(FIXED_CARD, noteSeconds);
const fitsSilent = wordsThatFit(FIXED_CARD, (w) => atWpm(w, SILENT_WPM));
const fitsBbc = wordsThatFit(FIXED_CARD, (w) => atWpm(w, BBC_WPM[1]));

export default function TextOnScreenChart() {
  return (
    <LabsShell>
      <article className="chart-page">
        <header className="chart-head">
          <p className="section-eyebrow">Charts · 36</p>
          <h1 className="chart-title">How long text needs on screen</h1>
          <p className="chart-lead">
            In one test render my own video app gave a 12-word line a second and a half. Nobody can read that, and a fixed 2-second card is not much better: it asks for {Math.round((12 / FIXED_CARD) * 60)} words a minute from people whose average on a still page is {SILENT_WPM}. The app now has floors: a line in a silent text note holds for at least a quarter of a second a word plus 0.3 seconds, {noteSeconds(12).toFixed(1)} seconds for twelve words, and its caption cards hold longer. Read your own line at each speed below, then see every rule side by side.
          </p>
        </header>
        <h2 className="section-eyebrow">What it feels like</h2>
        <TextOnScreen />
        <footer className="chart-foot">
          <h2 className="section-eyebrow">Notes</h2>
          <p>My two rules are in the app&rsquo;s text-beat assembler (<code>TextBeatAssembler</code> in the PostReady codebase). The note rule, <code>noteReadableSeconds</code>, is words &divide; 4 + 0.3 s, which is 240 words a minute with a beat to find the line; it is the floor for silent text notes, short videos that loop, so a viewer gets a second pass. The card rule, <code>readableSeconds</code>, is slower: the larger of 1.8 s and words &divide; 3 + 0.5 s, plus 0.3 s for each word with a number in it, 0.2 s for an acronym, 0.15 s for a word of nine letters or more, plus a 0.15 s fade in and out that does not count as reading time. The curve on the chart is the card rule for plain short words; the table prices the exact line. A fixed 2 s card holds about {fitsNote} words by the note rule, {fitsSilent} at the average silent reading speed and {fitsBbc} at the BBC&rsquo;s faster subtitle rate.</p>
          <p>Reading speed: Brysbaert&rsquo;s meta-analysis of 190 studies puts adult silent reading of English non-fiction at 238 words a minute on average, fiction at 260, with most adults between about 175 and 300; reading aloud averages 183. That is reading a still page. On screen the text competes with the picture: subtitle standards run slower, 160 to 180 words a minute at the BBC (0.33 to 0.375 s a word, and a target minimum of around 0.3 s a word), and up to 20 characters a second for adults and 17 for children&rsquo;s programmes at Netflix, never under 20 frames. Text that moves is slower again: in Uetsuki and colleagues&rsquo; study of dynamically presented Japanese text, the optimum rate was about 6 letters a second, against an average of 11.3 for silent reading, roughly half. On the other side, eye-tracking by Szarkowska and Gerber-Mor&oacute;n found most viewers coped with subtitles at up to 20 characters a second and still followed the picture, and that slow subtitles caused more rereading: the standards are a floor for comfort, not a ceiling on ability.</p>
          <p>Sources: Marc Brysbaert, How many words do we read per minute? A review and meta-analysis of reading rate, Journal of Memory and Language 109 (2019); BBC Subtitle Guidelines, section 4, Timing; Netflix, Timed Text Style Guide: General Requirements and Subtitle Timing Guidelines; Masaki Uetsuki, Junji Watanabe, Hideyuki Ando and Kazushi Maruya, Reading traits for dynamically presented texts, Frontiers in Psychology 8 (2017); Agnieszka Szarkowska and Olivia Gerber-Mor&oacute;n, Viewers can keep up with fast subtitles: evidence from eye movements, PLOS ONE 13(6) (2018).</p>
        </footer>
      </article>
    </LabsShell>
  );
}
