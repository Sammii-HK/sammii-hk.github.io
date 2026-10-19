import type { Metadata } from "next";
import { LabsShell } from "../../../src/components/labs/LabsShell";
import { CoverHooks, EraTable, VideoEngagement } from "../../../src/components/charts/VideoEngagement";
import DATA from "./data.json";
import "../colour-spaces/chart.css";
import "./chart.css";

export const metadata: Metadata = {
  title: "What 900 videos taught me",
  description: "Nine hundred TikTok videos from six of my accounts, engagement rate against length and format, one dot each. Short silent clips with a line of text on screen beat scripted talking heads by about ten to one, with the confounds left in.",
  alternates: { canonical: "https://labs.sammii.dev/charts/videos/" },
  openGraph: { title: "What 900 videos taught me", description: "Eight seconds or less: 13.6% median engagement. Over 45 seconds: 1.3%. And why that is not the whole story.", url: "https://labs.sammii.dev/charts/videos/", type: "article" },
};

const pct = (x: number | null) => (x == null ? "none" : `${x.toFixed(1)}%`);
const sp = DATA.byBucket.sparkle;
const short = sp.find((b) => b.bucket === "le8")!, mid = sp.find((b) => b.bucket === "21-45")!, long = sp.find((b) => b.bucket === "gt45")!;
const pipeline = DATA.eras.find((e) => e.id === "pipeline")!;
const lunaryBuckets = DATA.byBucket.lunary;
const octRun = DATA.eras.find((e) => e.id === "2025-oct")!;

export default function VideosChart() {
  return (
    <LabsShell>
      <article className="chart-page">
        <header className="chart-head">
          <p className="section-eyebrow">Charts · 34</p>
          <h1 className="chart-title">What 900 videos taught me</h1>
          <p className="chart-lead">
            Every video from six of my TikTok accounts, {DATA.source.rows} in all, as a dot: how long it runs, and how many of the people who saw it liked, commented or shared. On Sparkle, my personal account, videos of eight seconds or less have a median engagement rate of {pct(short.medianEr)}. From 21 to 45 seconds it is {pct(mid.medianEr)}; over 45, {pct(long.medianEr)}. The scripted talking heads my own pipeline made in June and July 2026 sit at {pct(pipeline.medianEr)}. Pick an account, pick a format, and then read the confounds before copying the lesson: on this account, length, format and era all moved together.
          </p>
        </header>
        <VideoEngagement />

        <h2 className="section-eyebrow" style={{ marginTop: "2.5rem" }}>The first frame</h2>
        <p className="ve-lede">The cover is the frame a scrolling thumb sees first. Text was found on {DATA.cover.sparkle.withText} of Sparkle&rsquo;s {DATA.cover.sparkle.n} covers, and on {DATA.cover.pipeline.withText} of the {DATA.cover.pipeline.n} from the pipeline months. The on-screen line that most of the short winners carried was the part the generated videos left out.</p>
        <CoverHooks />

        <h2 className="section-eyebrow" style={{ marginTop: "2.5rem" }}>The confound</h2>
        <p className="ve-lede">
          Sparkle changed all at once, era by era: format, length, the line on screen, the topic and the audience. So most of &ldquo;short beats long&rdquo; is also &ldquo;October 2025 beats July 2026&rdquo;. Held inside a single era, short still wins, by less: {DATA.withinEra.map((w, k) => (
            <span key={w.era}>{k > 0 && "; "}{DATA.eras.find((e) => e.id === w.era)?.label.split(":")[0]}, {pct(w.short.medianEr)} at eight seconds or less ({w.short.n}) against {pct(w.longer.medianEr)} for longer ({w.longer.n})</span>
          ))}. Reach is a different question: on Sparkle the top {DATA.reach.topN} videos by views and the top {DATA.reach.topN} by engagement share {DATA.reach.overlap === 0 ? "none" : DATA.reach.overlap}, and the rank correlation between the two is {DATA.reach.spearman.toFixed(2).replace("-", "\u2212")}.
        </p>
        <EraTable />

        <footer className="chart-foot">
          <h2 className="section-eyebrow">Notes</h2>
          <p>Data: the TikTok analytics export for six accounts, pulled on 18 October 2026, {DATA.source.rows} unique videos from August 2023 to October 2026, with the covers read by Apple Vision text recognition. Engagement rate is (likes + comments + shares) / views. &ldquo;Pushed&rdquo; means 500 views or more: these accounts usually stop at a first tier of 200 to 400 views, and a second tier lands around 700 to 1,000, so passing 500 says TikTok tried the video on a wider pool. Medians, not means, because a handful of videos run close to 40%. Only numbers leave the analysis: no captions, on-screen text, ids or dates are published here.</p>
          <p>Formats are inferred by rule, not by hand: length, whether the cover carries text, and the caption. They were checked against contact sheets of the covers for Sparkle and technically blonde only, so on the other four accounts treat them as rough. {DATA.noDuration.n} posts have a length of 0 s in the export ({Object.entries(DATA.noDuration.byAccount).map(([a, n]) => `${n} on ${DATA.accounts.find((x) => x.id === a)?.label}`).join(", ")}); they are left off the length axis and out of the length buckets. The analysis kept them in its shortest bucket, which is why it counts 72 Sparkle videos at eight seconds or less to the {short.n} here; the median is {pct(short.medianEr)} either way.</p>
          <p>What this cannot say. Era is confounded with everything on Sparkle: the October 2025 run was mostly one silent five-second template, many of them with an explicit ask for likes and comments in the caption, and some of its comments probably came from a circle of small creators who engage with each other; none of its {octRun.n} videos passed 500 views. Watch time and retention, which probably decide the wider push, are not in the export. And it is not a law of the platform. These are my accounts and my audiences, and Lunary, the app&rsquo;s own account, has {lunaryBuckets.find((b) => b.bucket === "le8")?.n} timed video of eight seconds or less, so it cannot test the pattern at all. Built by <code>scripts/labs/video-engagement.mjs</code> from the per-video table; every figure on this page is in <code>data.json</code> next to it.</p>
        </footer>
      </article>
    </LabsShell>
  );
}
