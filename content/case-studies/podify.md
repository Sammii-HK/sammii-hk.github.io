---
title: "Podify"
description: "AI podcast generator turning any content into a two-host episode for $0.04"
techStack: "Next.js, Claude (OpenRouter), Kokoro TTS, ffmpeg"
---

## The problem

Podcasts are one of the most engaging content formats, but producing one is expensive and time-consuming. Recording, editing, and mixing a single episode takes hours. I wanted a system that could take any input (a blog post, a URL, a topic) and produce a natural-sounding two-host podcast episode automatically, at a cost low enough to generate episodes daily.

## Architecture

### Script generation

Claude (via OpenRouter) converts the input content into a two-host dialogue script. The system prompt establishes two distinct host personas with different communication styles. One host drives the narrative, the other asks clarifying questions and adds commentary. The output is structured JSON with speaker labels, timing hints, and segment markers.

### Kokoro TTS synthesis

Each line of dialogue is synthesised individually using Kokoro TTS with distinct voice configurations per host. Kokoro was chosen for its natural prosody and low cost. Voice parameters (speed, pitch, emphasis) are tuned per host to create audible distinction between speakers.

### Audio assembly

ffmpeg assembles the individual audio clips into a complete episode. The assembly pipeline adds intro/outro music, crossfades between segments, normalises volume levels across clips, and applies light compression to even out the dynamic range. Silence between speaker turns is calibrated to feel conversational (300-600ms) rather than robotic.

### RSS feed output

Generated episodes are served as an RSS feed compatible with Apple Podcasts, Spotify, and other podcast players. Each episode includes title, description, duration, and enclosure URL. The feed updates automatically when new episodes are generated.

### Web UI

The Next.js frontend provides a generation interface with real-time progress. Users see each pipeline stage (scripting, synthesis, assembly) as it completes, with estimated time remaining. Completed episodes can be previewed, downloaded, or published to the RSS feed.

## Challenges

**Natural dialogue flow**: Early script generations sounded like two people reading a textbook. Fixing this required explicit instructions in the system prompt for conversational patterns: interruptions, "hmm" and "right" interjections, topic callbacks, and genuine disagreements. The scripts now read like an actual conversation.

**Audio timing**: Concatenating speech clips with fixed gaps sounds robotic. The assembly step analyses the end of each clip for trailing silence and adjusts the gap dynamically. Quick exchanges get shorter gaps; topic transitions get longer pauses with a subtle music bed.

**Cost optimisation**: The target was under $0.05 per episode. Claude API costs are the main expense. Prompt engineering to generate complete scripts in a single call (rather than turn-by-turn) reduced costs to approximately $0.03-0.04 per episode at current pricing.

## Outcome

Podify generates a production-quality two-host podcast episode from any content in about three minutes, at a cost of roughly $0.04. The episodes sound natural enough that listeners cannot immediately tell they are AI-generated. The RSS output means episodes can be distributed through standard podcast infrastructure.
