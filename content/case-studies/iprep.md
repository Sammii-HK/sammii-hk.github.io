---
title: "iPrep"
description: "AI-powered spoken interview practice with multi-dimensional scoring"
techStack: "Next.js, SwiftUI, Llama 3.3 70B, Whisper Large V3 Turbo, RevenueCat, Prisma, PostgreSQL"
---

## The problem

Interview preparation tools focus on written answers, but real interviews are spoken. Delivery matters as much as content: speaking too fast, using filler words, or failing to structure answers clearly can undermine a strong response. I wanted a platform where you practise by speaking aloud, get transcribed automatically, and receive detailed scoring on both what you said and how you said it.

## Architecture

### Web Audio recording

The recording interface uses the Web Audio API with MediaRecorder to capture speech directly in the browser. Audio is recorded as webm/opus for efficient file sizes. A real-time waveform visualisation gives feedback during recording so users know the microphone is active and picking up their voice.

### Whisper transcription

Recorded audio is sent to DeepInfra's hosted Whisper Large V3 Turbo for speech-to-text transcription, with OpenAI's Whisper API as an automatic fallback if the DeepInfra key isn't configured. Whisper returns timestamped segments, which are used both for the transcript display and for delivery analysis (calculating words per minute from segment timing, identifying pauses).

### Multi-dimensional Llama scoring

The transcript is scored across two axes. Delivery metrics are calculated deterministically: words per minute, filler word count ("um", "uh", "like", "you know"), pause frequency, and estimated confidence based on speech patterns. Content quality is assessed by Llama 3.3 70B (via DeepInfra, with GPT-4o mini as fallback) against the STAR methodology (Situation, Task, Action, Result), checking for specificity, measurable impact, clarity, and relevance to the question.

### Native iOS app

iPrep also ships as a native SwiftUI app with home-screen widgets, a watchOS companion, and Mac Catalyst support. Transcription runs on-device via Apple's Speech framework rather than calling out to Whisper. Scoring is tiered: a local rule-based engine and on-device Apple Intelligence handle the free path, while a RevenueCat-gated Pro tier calls the same Llama 3.3 70B backend as the web app for higher-quality feedback.

### Question banks and analytics

Questions are organised by category (behavioural, technical, situational) and difficulty. Prisma + PostgreSQL stores every attempt with its scores, enabling analytics over time. Users can see their average WPM trending down, filler word count decreasing, and STAR compliance improving across sessions.

## Challenges

**Filler word detection**: Whisper does not always transcribe filler words consistently. "Um" might be transcribed as part of the following word, or omitted entirely. The detection system uses both the transcript text and audio timing: unusually long pauses between segments often indicate filler words that Whisper dropped.

**Scoring calibration**: GPT-4's content scoring needed to correlate with how real interviewers evaluate answers. I calibrated the scoring prompt against example answers rated by experienced interviewers, adjusting the rubric until the model's scores matched human judgement within one point on a five-point scale.

**Recording reliability**: Browser audio recording is fragile. Different browsers handle MediaRecorder differently, some mobile browsers do not support it at all. The system checks for API support on load, shows clear error messages for unsupported browsers, and provides a fallback text input mode.

## Outcome

iPrep gives job candidates a practice environment that mirrors real interview conditions. Speaking aloud, getting scored on delivery, and tracking improvement over time addresses the gap between knowing good answers and delivering them well. The analytics dashboard shows measurable progress across practice sessions.
