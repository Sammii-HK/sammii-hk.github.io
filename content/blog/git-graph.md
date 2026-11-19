---
title: "Your commit is not gone"
description: >-
  git reset --hard rewrites one 40-byte file and your afternoon appears to
  vanish. A chart that steps nine commands through the object graph and leaves
  the unreachable commits drawn, because none of these commands deletes them.
date: '2026-12-09T09:00:00+00:00'
tags:
  - charts
  - the browser and the machine
  - git
series: "The browser and the machine"
chart: "git-graph"
draft: false
---

You run `git reset --hard HEAD~2`. The editor empties. `git log` no longer shows the two commits you spent the afternoon on. Your stomach drops.

What actually happened is that git rewrote one 40-byte file. The two commits are still in the object database, byte for byte, with nothing pointing at them. Unreachable is a different thing from deleted, and that difference is the whole chart: [labs.sammii.dev/charts/git-graph](https://labs.sammii.dev/charts/git-graph/).

## The one true thing

A commit is an immutable object. It holds a tree hash, its parent hashes, the author and committer, and a message, and its id is the hash of exactly that content (SHA-1, or SHA-256 in newer repositories). Change any part of it, including a parent, and you get a different commit with a different id.

A branch is not a line of commits. It is a file under `.git/refs/heads/` containing one id. `HEAD` is a file containing the name of a branch, or an id directly when you are detached.

Once you hold those two ideas together, most of git's scary commands stop being scary. They rewrite names. The objects stay where they are.

## Stepping it

The chart is a stepper with nine steps along the top, each labelled with its number and the start of its command. Back and Next walk through them, or you can click any step. Every step shows the full command, the graph as it is after that command, a short explanation, and the `git reflog` as it would read at that point.

The sequence is a small, made-up history that starts with three commits: "Add the reading list", "Extract the card component" and "Fix the empty state". Then:

1. `git log --oneline`: three commits on main.
2. `git switch -c feat/filters`: a new branch, which is a new 40-byte file with the same id in it. Nothing copied, nothing moved.
3. Two commits on the branch: "Add the filter pills" and "Make the pills legible in dark mode".
4. `git reset --hard HEAD~2`: the branch name points two commits back.
5. `git reset --hard e5f6a7b`, with the id taken from the reflog: recovered.
6. `git switch main` and a commit, "Tidy the footer", so the branches diverge.
7. `git merge feat/filters`: one new commit with two parents.
8. Undo the merge, then `git rebase main` instead.
9. Switch to main and merge again, which is now a fast-forward.

There is one checkbox, "show unreachable objects", and it is on by default. With it on, commits that no branch can reach any more stay drawn, dimmed, and a note under the reflog lists them by id. Turn it off and only the commits a branch can reach are drawn.

## Step four, and step five

Step four is the one that feels like loss. The chart says so in as many words: the editor is empty, `git log` does not show the work, and the two commits are sitting right there on the graph, dimmed, with their ids still on them.

Step five is the recovery, and the line on the chart I like best is that nothing was restored from anywhere. A name was pointed back at an object that never moved. The reflog is a local log of every value `HEAD` and each branch has held, so the id was never lost, only unreferenced.

## Merge and rebase, drawn

Steps seven and eight are where the graph earns its keep.

A merge writes one new commit with two parents. Every original commit keeps its id, so the branch's history stays exactly as it happened, and the graph records that two lines came together.

A rebase does not move commits. It replays each commit's changes onto a new base and writes new objects with new ids. On the chart, "Add the filter pills" was `d4e5f6a` and after the rebase there is a second "Add the filter pills" at `b8c9d0e`. Same message, different commit. The originals are still there, unreferenced, along with the merge commit from the step before.

That is the entire reason a force-push after a rebase conflicts with everyone else's copy. They are not the same commits any more, whatever the messages say.

Step nine closes it out. After the rebase, main is an ancestor of the branch tip, so merging is a fast-forward: git moves the name and writes no commit at all. One straight line, which is what a linear history buys and what it costs.

## Why it is all instant

Because a branch is a file containing one commit id, switching branches, resetting and a fast-forward merge are all fast whatever the size of the history. Each one rewrites a name, not a history.

## The bit that really does lose work

The page notes are honest about this, so I will be too. The one thing that really does drop work is a `reset --hard` over changes that were never committed, because those were never objects in the first place. The chart only shows committed work. If you had not committed it, the graph has nothing to draw.

## How it is built

The history is hand-modelled, not emulated. Each step in the data file is the full state after that step: the commits, the refs, where `HEAD` points, the reflog lines, and which commits no ref can reach any more. The component walks back from every ref to work out what is reachable, places each commit by its depth from the root and its lane, and draws the graph as SVG. Merge commits get an inner ring.

## What it does not do

It is not a git. You cannot type your own commands, and the ids are made up and short so they fit on the graph. It models nine commands faithfully and nothing else: no stash, no cherry-pick, no remote.

It also does not run `gc`, so it cannot show you the day the objects really do go. The page notes say the reflog keeps every value a ref has held for 90 days by default (`gc.reflogExpire`), that unreachable objects are kept for two weeks (`gc.pruneExpire`), and that `git fsck --lost-found` lists them. Between those, almost every unreachable commit is recoverable, which is the point, but almost is not always.

Step through it once before the next time you panic: [labs.sammii.dev/charts/git-graph](https://labs.sammii.dev/charts/git-graph/).

## Sources

- Chacon and Straub, Pro Git, chapter 10 (Git Internals).
- git-reflog manual page.
- git-rebase manual page.
- git-gc manual page.
