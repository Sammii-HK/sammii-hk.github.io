---
title: "Artify"
description: "Automated daily content pipeline for AI-generated illustrations, carousels, and reels"
techStack: "Next.js, Remotion, FLUX, Kling, DeepInfra, fal.ai"
---

## The problem

Lunary's social media presence needs daily visual content: astrology illustrations, carousel posts, reels, and stories. Producing this manually is unsustainable. Each piece needs to match the brand aesthetic, include relevant astrological data, and be formatted correctly for each platform. I wanted a pipeline that generates all of this automatically, every day, from data alone.

## Architecture

### FLUX image generation

Base illustrations are generated using FLUX image-to-image on fal.ai. A set of brand-consistent source images serves as the style reference. The pipeline feeds astrological context (today's moon phase, planetary aspects, zodiac season) into the prompt along with the source image, producing illustrations that match the brand while varying with the daily content.

### Kling video synthesis

Static illustrations are animated into short videos using Kling's image-to-video API via DeepInfra. The pipeline sends a generated illustration with a motion prompt (e.g. "gentle shimmer on crystals, flowing hair, subtle particle effects") and receives a 3-5 second video clip suitable for reels and stories.

### Remotion compositions

Carousels and formatted posts are composed using Remotion, React's video framework. Templates define layouts for different content types: zodiac carousel (12 slides, one per sign), daily forecast card, moon phase graphic. The pipeline renders each composition to image sequences or video, depending on the target format.

### Spellcast scheduling

Generated assets are uploaded to Spellcast and scheduled at optimal times for each platform. The pipeline creates posts with platform-specific captions, hashtags, and formatting, then queues them according to the brand's cadence configuration.

## Challenges

**Brand consistency**: AI-generated images vary in style between generations. Using image-to-image with consistent source images and detailed style prompts keeps output within the brand range, but occasional outliers still occur. The pipeline includes a basic quality check (resolution, aspect ratio, dominant colour analysis) and rejects generations that fall outside bounds.

**Remotion rendering performance**: Rendering 12-slide carousels with custom fonts, gradients, and overlays takes time. The pipeline renders compositions in parallel using Remotion's server-side rendering, with each slide as an independent frame extraction. Total carousel render time is under 30 seconds.

**Platform format matrix**: Instagram wants 1080x1080 for feed, 1080x1920 for stories, and 1080x1350 for carousels. X wants 1200x675. TikTok wants 1080x1920 video. The asset pipeline maintains a format matrix and renders each piece at all required sizes, deduplicating where formats overlap.

## Outcome

Artify generates and schedules all daily visual content for Lunary's social media presence without manual intervention. The pipeline runs each morning, producing illustrations, carousels, reels, and stories tailored to the day's astrological events. Monthly content output went from a handful of manually created posts to consistent daily publishing across all platforms.
