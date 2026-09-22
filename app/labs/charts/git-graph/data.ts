/**
 * A git history as a sequence of states. Each step is what the object
 * graph and the refs look like after one command: commits are immutable
 * objects, branches are just names pointing at one, and nothing is
 * deleted by any of these commands. Hand-modelled from the real
 * behaviour of each command rather than emulated.
 */
export type Commit = { id: string; parents: string[]; msg: string; lane: number };
export type Step = {
  cmd: string;
  what: string;
  feels?: string;
  commits: Commit[];
  refs: Record<string, string>;
  head: string; // a branch name, or a commit id when detached
  reflog: string[];
  lost?: string[]; // commit ids no ref can reach any more
};

const c = (id: string, parents: string[], msg: string, lane = 0): Commit => ({ id, parents, msg, lane });

const base: Commit[] = [
  c("a1b2c3d", [], "Add the reading list"),
  c("b2c3d4e", ["a1b2c3d"], "Extract the card component"),
  c("c3d4e5f", ["b2c3d4e"], "Fix the empty state"),
];

export const STEPS: Step[] = [
  {
    cmd: "git log --oneline",
    what: "Three commits on main. A commit is an immutable object: a snapshot, its parents, and a hash of all of it. main is a file containing one commit id. HEAD is a file containing the word main.",
    commits: base,
    refs: { main: "c3d4e5f" },
    head: "main",
    reflog: ["c3d4e5f HEAD@{0}: commit: Fix the empty state"],
  },
  {
    cmd: "git switch -c feat/filters",
    what: "A new branch is a new 40-byte file with the same commit id in it. Nothing was copied, nothing moved: there are now two names for c3d4e5f and HEAD points at the new one.",
    commits: base,
    refs: { main: "c3d4e5f", "feat/filters": "c3d4e5f" },
    head: "feat/filters",
    reflog: ["c3d4e5f HEAD@{0}: checkout: moving from main to feat/filters"],
  },
  {
    cmd: "git commit -m 'Add the filter pills'  (twice)",
    what: "Two commits on the branch. Each one points at its parent, so the chain is the history; the branch name just follows the tip.",
    commits: [...base, c("d4e5f6a", ["c3d4e5f"], "Add the filter pills", 1), c("e5f6a7b", ["d4e5f6a"], "Make the pills legible in dark mode", 1)],
    refs: { main: "c3d4e5f", "feat/filters": "e5f6a7b" },
    head: "feat/filters",
    reflog: ["e5f6a7b HEAD@{0}: commit: Make the pills legible in dark mode", "d4e5f6a HEAD@{1}: commit: Add the filter pills"],
  },
  {
    cmd: "git reset --hard HEAD~2",
    what: "The branch name now points two commits back. That is the whole operation: one file rewritten. Both commits still exist in the object database, byte for byte, with nothing pointing at them.",
    feels: "This is the moment it looks like the work is gone. The editor is empty, git log does not show it, and the two commits are sitting right there.",
    commits: [...base, c("d4e5f6a", ["c3d4e5f"], "Add the filter pills", 1), c("e5f6a7b", ["d4e5f6a"], "Make the pills legible in dark mode", 1)],
    refs: { main: "c3d4e5f", "feat/filters": "c3d4e5f" },
    head: "feat/filters",
    reflog: ["c3d4e5f HEAD@{0}: reset: moving to HEAD~2", "e5f6a7b HEAD@{1}: commit: Make the pills legible in dark mode", "d4e5f6a HEAD@{2}: commit: Add the filter pills"],
    lost: ["d4e5f6a", "e5f6a7b"],
  },
  {
    cmd: "git reset --hard e5f6a7b   (id from git reflog)",
    what: "Recovered. The reflog is a local log of every value HEAD and each branch has held, so the id was never lost, only unreferenced. Unreachable objects survive until git gc, which by default leaves them for 90 days.",
    feels: "Nothing was restored from anywhere. A name was pointed back at an object that never moved.",
    commits: [...base, c("d4e5f6a", ["c3d4e5f"], "Add the filter pills", 1), c("e5f6a7b", ["d4e5f6a"], "Make the pills legible in dark mode", 1)],
    refs: { main: "c3d4e5f", "feat/filters": "e5f6a7b" },
    head: "feat/filters",
    reflog: ["e5f6a7b HEAD@{0}: reset: moving to e5f6a7b", "c3d4e5f HEAD@{1}: reset: moving to HEAD~2", "e5f6a7b HEAD@{2}: commit: Make the pills legible in dark mode"],
  },
  {
    cmd: "git switch main && git commit -m 'Tidy the footer'",
    what: "Meanwhile main moved on. Now the two branches have diverged: neither commit is an ancestor of the other, which is the only thing that makes a merge non-trivial.",
    commits: [...base, c("d4e5f6a", ["c3d4e5f"], "Add the filter pills", 1), c("e5f6a7b", ["d4e5f6a"], "Make the pills legible in dark mode", 1), c("f6a7b8c", ["c3d4e5f"], "Tidy the footer", 0)],
    refs: { main: "f6a7b8c", "feat/filters": "e5f6a7b" },
    head: "main",
    reflog: ["f6a7b8c HEAD@{0}: commit: Tidy the footer", "c3d4e5f HEAD@{1}: checkout: moving from feat/filters to main"],
  },
  {
    cmd: "git merge feat/filters",
    what: "A merge writes one new commit with two parents. Every original commit keeps its id, so the branch's history stays exactly as it happened, and the graph records that the two lines came together.",
    commits: [...base, c("d4e5f6a", ["c3d4e5f"], "Add the filter pills", 1), c("e5f6a7b", ["d4e5f6a"], "Make the pills legible in dark mode", 1), c("f6a7b8c", ["c3d4e5f"], "Tidy the footer", 0), c("a7b8c9d", ["f6a7b8c", "e5f6a7b"], "Merge branch 'feat/filters'", 0)],
    refs: { main: "a7b8c9d", "feat/filters": "e5f6a7b" },
    head: "main",
    reflog: ["a7b8c9d HEAD@{0}: merge feat/filters: Merge made by the 'ort' strategy"],
  },
  {
    cmd: "git reset --hard f6a7b8c && git switch feat/filters && git rebase main",
    what: "Undo the merge, then rebase instead. A rebase does not move anything: it replays each commit's changes onto a new base, producing NEW commits with new ids (d4e5f6a becomes b8c9d0e). The originals are still in the database, unreferenced.",
    feels: "This is why a rebase after you have pushed forces everyone else's history to conflict with yours: those are not the same commits any more, whatever the messages say.",
    commits: [...base, c("d4e5f6a", ["c3d4e5f"], "Add the filter pills", 2), c("e5f6a7b", ["d4e5f6a"], "Make the pills legible in dark mode", 2), c("f6a7b8c", ["c3d4e5f"], "Tidy the footer", 0), c("a7b8c9d", ["f6a7b8c", "e5f6a7b"], "Merge branch feat/filters", 3), c("b8c9d0e", ["f6a7b8c"], "Add the filter pills", 1), c("c9d0e1f", ["b8c9d0e"], "Make the pills legible in dark mode", 1)],
    refs: { main: "f6a7b8c", "feat/filters": "c9d0e1f" },
    head: "feat/filters",
    reflog: ["c9d0e1f HEAD@{0}: rebase (finish): returning to refs/heads/feat/filters", "b8c9d0e HEAD@{1}: rebase (pick): Add the filter pills", "f6a7b8c HEAD@{2}: rebase (start): checkout main"],
    lost: ["d4e5f6a", "e5f6a7b", "a7b8c9d"],
  },
  {
    cmd: "git switch main && git merge feat/filters",
    what: "Now it is a fast-forward: main is an ancestor of the branch tip, so there is nothing to merge. Git moves the name forward and writes no commit at all. One straight line, which is what a linear history buys and what it costs.",
    commits: [...base, c("d4e5f6a", ["c3d4e5f"], "Add the filter pills", 2), c("e5f6a7b", ["d4e5f6a"], "Make the pills legible in dark mode", 2), c("f6a7b8c", ["c3d4e5f"], "Tidy the footer", 0), c("a7b8c9d", ["f6a7b8c", "e5f6a7b"], "Merge branch feat/filters", 3), c("b8c9d0e", ["f6a7b8c"], "Add the filter pills", 0), c("c9d0e1f", ["b8c9d0e"], "Make the pills legible in dark mode", 0)],
    refs: { main: "c9d0e1f", "feat/filters": "c9d0e1f" },
    head: "main",
    reflog: ["c9d0e1f HEAD@{0}: merge feat/filters: Fast-forward"],
    lost: ["d4e5f6a", "e5f6a7b", "a7b8c9d"],
  },
];
