#!/usr/bin/env bash
# Vercel "Ignored Build Step". Exit 0 = skip the build, exit 1 = build.
# Blog posts are read at request time from GitHub (app/lib/blog.ts), so a
# commit that only touches content/blog (or docs) needs no build.
set -u
if [ -z "${VERCEL_GIT_PREVIOUS_SHA:-}" ]; then exit 1; fi
if git diff --quiet "$VERCEL_GIT_PREVIOUS_SHA" "$VERCEL_GIT_COMMIT_SHA" -- . ':(exclude)content/blog' ':(exclude)docs'; then
  echo "content-only commit: skipping build"
  exit 0
fi
exit 1
