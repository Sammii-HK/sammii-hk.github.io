---
title: I built an AI interview coach that scores your delivery and your answers
description: >-
  How I built iPrep, an AI-powered spoken interview practice platform with
  Whisper transcription, multi-dimensional scoring, and STAR methodology
  analysis.
date: '2026-03-22'
tags:
  - ai
  - nextjs
  - indie-hacking
  - developer-tools
  - webdev
draft: false
---
Most interview prep tools focus on what you say. They ignore how you say it. That distinction matters more than people realise.

I built iPrep to fix that. It's a spoken interview practice platform that records your answers, transcribes them with Whisper, then scores both delivery and content independently. Think of it as a brutally honest practice partner that never gets tired of listening to you waffle about your "greatest weakness."

## The problem with existing tools

Every interview prep tool I tried fell into one of two camps: either a list of questions with model answers you're meant to memorise, or a chatbot that analyses your text input. Neither captures what actually matters in an interview, which is how you sound when you're under pressure.

Interviewers form opinions in the first thirty seconds. They notice filler words ("um", "like", "basically"), awkward pauses, monotone delivery, and rambling answers before they even process the content. I wanted a tool that could catch all of that.

## How the audio pipeline works

The recording flow uses the Web Audio API to capture microphone input directly in the browser. The audio gets encoded as a WAV file on the client side, then uploaded to Cloudflare R2 for storage.

I chose R2 over S3 for a simple reason: zero egress fees. Interview recordings add up quickly, and I didn't want cost anxiety every time someone practised.

From R2, the audio is sent to OpenAI's Whisper API for transcription. Whisper handles accents, background noise, and natural speech patterns well enough that I've rarely needed to worry about transcription accuracy. It also returns word-level timestamps, which turned out to be critical for the delivery scoring.

## Scoring delivery, not just content

The delivery score analyses several dimensions from the audio and transcription data:

- **Words per minute**: too fast suggests nerves, too slow suggests uncertainty. The sweet spot is roughly 130 to 160 WPM for interview answers.
- **Filler word density**: counting "um", "uh", "like", "you know", "basically", "actually" and similar. Everyone uses some fillers; the score reflects whether they're distracting.
- **Pause analysis**: using Whisper's timestamps to detect pauses. Short pauses are fine, even desirable. Long gaps mid-sentence suggest you've lost your thread.
- **Confidence markers**: hedging language ("I think maybe", "sort of", "kind of") versus assertive language ("I led", "I decided", "I built").
- **Intonation patterns**: detecting uptalk and monotone delivery from the audio signal.

This is where the word-level timestamps from Whisper become essential. Without them, you can count fillers but you can't map them to timing, and timing is everything in delivery analysis.

## STAR methodology scoring

For content scoring, I built a STAR (Situation, Task, Action, Result) analyser using GPT. The prompt engineering here was more nuanced than I expected.

A naive approach would be: "Does this answer contain a situation, task, action, and result?" But that misses the point. Good STAR answers have specific, measurable results. They focus on individual contribution, not team achievements described vaguely. They demonstrate impact.

The content scorer evaluates:

- **Structure**: does the answer follow a logical narrative arc?
- **Specificity**: are there concrete details, numbers, timeframes?
- **Impact**: does the result demonstrate meaningful outcome?
- **Technical accuracy**: for technical questions, does the answer demonstrate genuine understanding?
- **Clarity**: is the core message easy to follow, or buried in context?

Each dimension gets a score and specific feedback. The goal isn't a number; it's actionable advice. "Your answer scored 6/10 for impact because you described what the team did but not the measurable outcome" is useful. "7/10, good answer" is not.

## Question banks and the quiz system

iPrep ships with built-in question banks, but the real power is CSV import. You can dump questions from a job description, tag them by topic (system design, behavioural, technical), organise them into folders, and build targeted practice sessions.

The quiz system supports two modes: spoken and written. Spoken mode is the full pipeline, recording, transcription, and scoring. Written mode skips the audio and just analyses your typed answer against the STAR framework. Useful for when you're on the train and can't talk out loud.

## Analytics that actually help

Every practice session generates a learning summary: what went well, what patterns keep appearing, and what to focus on next time. Over multiple sessions, iPrep tracks:

- **Common mistakes**: filler words you overuse, structural patterns you repeat
- **Weak topics**: question categories where your scores consistently lag
- **Performance trends**: are you actually improving, or just practising the same mistakes?

This is where the tool earns its keep. One-off feedback is nice. Longitudinal tracking of your interview skills is genuinely useful.

## The stack

- **Next.js 16** with React 19 on the frontend
- **OpenAI** for both Whisper (transcription) and GPT (content analysis)
- **Prisma with PostgreSQL** for data persistence
- **Cloudflare R2** for audio file storage
- **Web Audio API** for browser-based recording

The whole thing runs as a PWA with offline support and push notifications. You can install it on your phone and practise anywhere.

Cost-wise, it's essentially free to run. The only variable cost is OpenAI API usage, which works out to a few pence per practice answer. No expensive infrastructure, no GPU instances, no monthly subscriptions to maintain.

## Why I built it

I've sat on both sides of the interview table. The gap between what candidates know and how they communicate it is often the difference between getting the job and getting ghosted. iPrep exists to close that gap, not by giving you scripts to memorise, but by making you a better communicator under pressure.

If you want to try it or have questions about the technical implementation, find me on X [@sammiihk](https://x.com/sammiihk) or check out more of my work at [sammii.dev](https://sammii.dev).

Until next time.

Sammii
