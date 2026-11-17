---
title: "The signup that said “check your email”"
description: "How a one-field mismatch between an auth library and a sign-up screen was quietly losing a third of Lunary's new users, and what happened to activation when it stopped."
techStack: "Next.js, better-auth, PostgreSQL, product analytics"
kind: story
---

## What people saw

Lunary is a web and iOS app I build and run. In August 2026, a new user who signed up with email and password was told the same thing every time:

> Check your email to finish signing up.

It was not true. Email verification was switched off and they were already signed in. The screen just never let them through. Anyone who clicked the link in the email straight away made it into the app. Anyone who didn't was stuck on a page that told them to go away, and most of them did.

<FlowCompare>
  <FlowColumn title="Before">
    <FlowStep label="Create an account" detail="Email, password, birthday" />
    <FlowStep label="Signed in on the server" detail="A session token comes back" />
    <FlowStep label="“Check your email to finish signing up”" detail="The screen ignores the token" end="dead" />
  </FlowColumn>
  <FlowColumn title="After">
    <FlowStep label="Create an account" detail="Email, password, birthday" />
    <FlowStep label="Signed in on the server" detail="The token counts as signed in" />
    <FlowStep label="Straight into the app" detail="Their chart and today's reading" end="done" />
  </FlowColumn>
</FlowCompare>

## Finding it

Nothing was erroring. No alert fired, the auth flow worked and the tests passed. It only showed up as a gap in the funnel, so I went to the production data for the 30 days to 4 September:

- 115 people signed up.
- 74 verified their email, and they did it in a median of **0.7 minutes**, straight from the sign-up screen.
- 41 never verified, and **36 of those 41 never opened the app at all**.

The 0.7 minutes was the tell. People weren't losing interest over hours or days. The ones who got in did so instantly, from the same screen, and the ones who didn't were gone just as fast. That points at the screen, not at the people.

## The cause

The sign-up component decided whether someone was signed in by looking for a `session` field on the response. The auth library, better-auth, has never returned one from email sign-up. It returns `{ token, user }`, and the token is only null when verification actually blocks the session.

```tsx
// Before: `session` never exists on this response, so every sign-up
// fell through to "check your email".
const hasSession = !!(result.data as any)?.session;

// After: a token means the account is signed in.
const hasSession = !!(
  (result.data as any)?.session || (result.data as any)?.token
);
```

A one-line mismatch between what a library returns and what the interface expected. It's the kind of bug that sits in the seam between engineering and product: nothing about the types warned anyone, because the response was cast to `any`, and the experience was wrong for everybody.

## The fix

The code change was small. The decisions around it mattered more:

- **A token counts as signed in.** A null token still shows the email prompt, so real verification flows keep working.
- **New users land where sign-in lands.** On the standalone `/auth` page there was nowhere to go next, so new accounts now follow the same redirect as sign-in, including any `returnTo` they arrived with.
- **Verification didn't disappear, it stopped blocking.** The verification email still goes out, and an in-app nudge keeps asking. The screen just stopped standing between someone and the product they had signed up for.
- **Tests that describe the journey, not the function.** Three tests now assert that an email sign-up lands in the app, so this can't quietly come back.

The same change rewrote the ask at the end of the free transit reading, the page most social visitors land on. Of 48 people who came from Threads and finished a reading, 5 signed up (9%), and the only ask was a "stay updated" box at the very end. It now reads as the next step: your chart is ready, open it. It appears right after the reading lands and again at the end, with their birth details carried over so there is nothing to retype. I also fixed the attribution so a Threads tap is recorded as Threads rather than generic "social", which is what made the next part measurable.

## What changed

Activation is the share of new sign-ups who use the product's core features in their first week. Comparing the 30 days before the fix with the 30 days after:

<Stats>
  <Stat label="Activation, all sign-ups" value="67.8% → 90.1%" note="78 of 115, then 109 of 121" />
  <Stat label="Excluding the new Google Play channel" value="67.8% → 87.6%" note="85 of 97 after" />
  <Stat label="Direct sign-ups" value="31.0% → 73.1%" note="The group the dead end hit hardest" />
</Stats>

The direct-traffic slice is the clearest. These are people who signed up on the site without arriving through the verification email, exactly the people the dead end stopped. Before the fix, the ones who did come back through the email link activated at 97.5%. The screen was the whole difference.

<BeforeAfterBars caption="Share of new sign-ups who activated within 7 days, 4 Aug to 3 Sep 2026 (before) and 5 Sep to 5 Oct 2026 (after)">
  <BarRow label="All sign-ups" before="78/115" after="109/121" />
  <BarRow label="Excluding Google Play" before="78/115" after="85/97" />
  <BarRow label="Direct sign-ups" before="13/42" after="19/26" />
  <BarRow label="Opened their daily dashboard" before="77/115" after="106/121" />
</BeforeAfterBars>

<Caveat>
  <ul>
    <li>This is a before and after, not an A/B test. With roughly 120 sign-ups a month, a split test would have taken months to say anything, and leaving half of new users at a dead end to prove it wasn't worth it.</li>
    <li>Google Play installs started arriving in the second window. They activated at 100%, so the second row takes them out.</li>
    <li>A new activation event (starting a ritual) was added in the second window, which widens the definition. The last row uses an event that exists in both, opening the daily dashboard, and moves almost the same amount: 67.0% to 87.6%.</li>
    <li>A daily chart email shipped on 16 September, partway through the second window. It can't explain the first-day jump, but it may have helped the week-one numbers.</li>
  </ul>
</Caveat>

## What I took from it

The bug was a single field, but it lived where nobody was looking: between what a library returns and what a screen says to a person. Unit tests passed because each piece was right on its own. Only the journey was wrong.

Three things I do differently because of it:

- **Measure people, not page views.** The 0.7-minute median only exists because the funnel tracks individual sign-ups through to first use. Without it, this looks like normal drop-off.
- **Treat copy as part of the code path.** "Check your email" was the most important line of UI in the app that month, and it was wrong because of a type cast.
- **Write the test from the user's side.** "An email sign-up lands in the app" would have caught this on day one. "hasSession returns true" didn't.

I diagnosed this from production queries and paired with an AI coding agent on the fix and the tests. The part that mattered was noticing that a 0.7-minute median meant the screen, not the people.
