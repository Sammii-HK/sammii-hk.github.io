import type { Metadata } from "next";
import { LabsShell } from "../../../src/components/labs/LabsShell";
import { GitGraph } from "../../../src/components/charts/GitGraph";
import "../colour-spaces/chart.css";
import "./chart.css";

export const metadata: Metadata = {
  title: "Your commit is not gone",
  description: "Nine commands stepped through the object graph: reset, merge, rebase and fast-forward, with unreachable commits left drawn on the canvas because none of these commands deletes anything. Branches are names; commits are immutable.",
  alternates: { canonical: "https://labs.sammii.dev/charts/git-graph/" },
  openGraph: { title: "Your commit is not gone", description: "reset --hard moved one file. The commits are still there.", url: "https://labs.sammii.dev/charts/git-graph/", type: "article" },
};

export default function GitGraphChart() {
  return (
    <LabsShell>
      <article className="chart-page">
        <header className="chart-head">
          <p className="section-eyebrow">Charts · 22</p>
          <h1 className="chart-title">Your commit is not gone</h1>
          <p className="chart-lead">
            <code>git reset --hard</code> rewrote one 40-byte file and your afternoon appeared to vanish. It did not: the commits are sitting in the object database with nothing pointing at them, which is a different thing from deleted. Step through nine commands and watch the graph. Commits are immutable objects, branches are names that point at one, and the shape of the graph is the only real difference between a merge and a rebase.
          </p>
        </header>
        <GitGraph />
        <footer className="chart-foot">
          <h2 className="section-eyebrow">Notes</h2>
          <p>A commit object holds a tree hash, its parent hashes, author and committer, and a message; its id is the SHA-1 (SHA-256 in newer repositories) of exactly that content, so changing any part of it, including a parent, produces a different commit. A branch is a file under <code>.git/refs/heads/</code> containing one id, and <code>HEAD</code> is a file containing a symbolic ref to a branch, or an id directly when detached. That is why <code>reset</code>, <code>switch</code> and a fast-forward <code>merge</code> are all fast whatever the size of the history: they rewrite a name. Rebase replays each commit&rsquo;s diff onto a new base and writes new objects, so a rebased commit is not the same commit; that is the whole reason a force-push after a rebase conflicts with everyone else&rsquo;s copy. The reflog (<code>.git/logs/HEAD</code> and per-branch logs) records every value each ref has held for 90 days by default (<code>gc.reflogExpire</code>), which is what makes almost every unreachable commit recoverable; unreachable objects are kept for two weeks (<code>gc.pruneExpire</code>) and <code>git fsck --lost-found</code> lists them. The one thing that really does drop work is a <code>reset --hard</code> over changes that were never committed, because those were never objects in the first place. Sources: Chacon and Straub, Pro Git, chapter 10 (Git Internals); git-reflog, git-rebase and git-gc manual pages.</p>
        </footer>
      </article>
    </LabsShell>
  );
}
