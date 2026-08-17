---
title: "Artify"
description: "Automated daily content pipeline for AI-generated illustrations, carousels, and reels"
techStack: "Next.js, Remotion, FLUX, Kling, DeepInfra, fal.ai"
---

## The problem

Lunary's social presence needed a steady supply of illustrations, carousels, reels, and stories, each one tied to that day's actual astrological data, each one on-brand, and each one correctly sized for wherever it was going out. Producing that by hand, every day, across every platform, was never going to hold up.

## Architecture

Four stages, one pipeline, run each morning without anyone touching it.

### FLUX generates the base illustrations

Base illustrations come from FLUX image-to-image on fal.ai. A set of brand-consistent source images acts as the style anchor for every generation. The pipeline feeds today's astrological context, moon phase, planetary aspects, zodiac season, into the prompt alongside the source image, so the output stays visually consistent while the content itself changes daily.

### Kling turns stills into motion

Static illustrations get animated with Kling's image-to-video model, called via DeepInfra. The pipeline pairs a generated illustration with a motion prompt, gentle shimmer on crystals, flowing hair, subtle particle effects, and gets back a 3-5 second clip sized for reels and stories.

### Remotion assembles the composed formats

Carousels and formatted posts are built in Remotion, React's video framework. Templates cover the recurring layouts: a 12-slide zodiac carousel (one slide per sign), a daily forecast card, a moon phase graphic. Depending on the target format, the pipeline renders each composition out as an image sequence or a video.

### Spellcast handles scheduling

Finished assets go to Spellcast, which schedules them at the right time for each platform. The pipeline writes platform-specific captions and hashtags for each post and queues them against the brand's existing cadence configuration.

## Challenges

AI image generation doesn't hold a style perfectly across runs, even with the same source images and prompt structure feeding it every time. Most outputs land within the brand's visual range, but outliers still happen, so the pipeline runs a basic quality check on every generation (resolution, aspect ratio, dominant colour) and rejects anything that falls outside bounds.

Rendering 12-slide carousels with custom fonts, gradients, and overlays takes time. Remotion's server-side rendering lets each slide extract as an independent frame, so the pipeline renders the whole carousel in parallel, keeping total render time under 30 seconds.

Then there's the format problem, which is really a multiplication problem. Instagram alone wants three different aspect ratios: 1080x1080 for feed, 1080x1920 for stories, 1080x1350 for carousels. X wants 1200x675. TikTok wants 1080x1920 video. The pipeline maintains a format matrix and renders each piece at every size it needs, deduplicating renders where two platforms happen to share a format.

## Outcome

Artify now produces and schedules the full spread of daily visual content for Lunary's social presence with no manual step in between. It runs every morning, generating illustrations, carousels, reels, and stories tied to that day's actual astrological events. Monthly output went from a handful of manually made posts to consistent daily publishing across every platform.
