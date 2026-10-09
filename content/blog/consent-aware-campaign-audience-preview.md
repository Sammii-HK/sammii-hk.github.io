---
title: 'The email audience you can actually reach'
description: 'How I built a privacy-preserving campaign audience preview that counts eligible recipients before sending.'
date: '2026-10-12'
tags:
  - engineering
  - privacy
  - automation
  - lunary
draft: false
---

A segment is not necessarily an audience. A dashboard might tell you how many users match a campaign, but that doesn't tell you how many can actually receive it.

I ran into this while working on Lunary's campaign tooling. Nova could see the size of a segment, but consent and suppression were enforced later, per person, inside the sending path. The practical audience size only became clear once sending had begun. That's too late for a useful forecast.

## Reuse the decision, not the estimate

I added an audience-count mode to the campaign administration endpoint: `GET /api/admin/campaigns/<id>?audience=1`.

Instead of building a separate approximation of eligibility, it runs the same suppression guard and product-updates opt-in check over the same segment. This matters because duplicated business rules drift. If the preview and the sender disagree, the preview becomes decoration rather than operational information.

## Counts without identities

The response contains counts: eligible recipients, those without opt-in, and those suppressed, grouped by reason. It doesn't return addresses or user IDs. An operator deciding whether to run a campaign needs aggregate eligibility, not a new surface exposing personal information.

That boundary is especially valuable for an automated operator. It can evaluate whether a campaign is worth preparing without handling recipient-level data.

## An upper bound, not a promise

The preview deliberately doesn't apply day-dependent sending slots or frequency caps. Consequently, the eligible number is an **upper bound** on how many messages will be sent, not a guaranteed delivery count.

This is the sort of limitation I want stated in the interface rather than buried in an implementation comment. A number can be accurate within its scope and still mislead if its scope is invisible.

## The broader lesson

The useful improvement wasn't another analytics chart. It was moving an existing consent decision earlier in the workflow, retaining a privacy-preserving interface, and making uncertainty explicit. Good operational UX is often about exposing the rules already governing the system.

Source: [Lunary implementation](https://github.com/Sammii-HK/lunary/commit/d00fa277c59f4a40c3ca2769d91601859abb7754).
