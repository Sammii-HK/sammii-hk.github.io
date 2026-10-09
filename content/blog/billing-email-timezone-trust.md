---
title: 'Why a payment retry date can be wrong even when the timestamp is right'
description: 'A billing-copy bug exposed the difference between accurate timestamps and trustworthy customer communication.'
date: '2026-10-15'
tags:
  - engineering
  - product-design
  - billing
  - lunary
draft: false
---

A timestamp can be technically correct and still produce the wrong message for a person reading it.

In Lunary's failed-payment emails, Stripe's `next_payment_attempt` is a UTC timestamp. Displaying the UTC calendar date directly could tell a customer the retry would happen on the wrong local day. A detail intended to be helpful became an accidental promise.

## Don't confuse precision with clarity

The fix was deliberately small: where a retry exists, the email now says Stripe will retry soon instead of naming a calendar day that may not be correct for the reader.

We could have tried to solve every timezone and delivery-context problem in the template. But the actual product requirement was simpler: communicate whether another attempt is planned, without misleading the customer about when.

## The recovery sequence had its own logic bug

Another issue lived in the timing of reminder emails. The old schedule included days 14, 21 and 28, despite an observed retry window of 14 days. Some reminders could never run when they were meant to. The revised ladder runs on days 1, 3, 7 and 12 from the first failure.

Eligibility is also checked against the invoice and subscription state: an open unpaid subscription invoice, a still past-due or unpaid subscription, an available hosted invoice URL, and exclusions for cases such as a scheduled cancellation or another live subscription.

## Words are part of the payment flow

The copy had to describe the actual link and action. A hosted invoice is not a billing portal. Paying it can charge the customer. Saying otherwise might sound softer, but it would be inaccurate.

Billing emails are interfaces to financial state machines. Their links, timing and promises deserve the same care as the checkout UI.

## What changed in my thinking

Accurate data isn't sufficient for accurate communication. The whole path from a backend event to a human expectation must hold together. Sometimes a better interface removes a detail rather than adding one.

Sources: [retry date change](https://github.com/Sammii-HK/lunary/commit/313883f3e89863e3e625254089f04bd0eedb2aa9) and [recovery ladder](https://github.com/Sammii-HK/lunary/commit/9f6441a3b60ae221c74297b5b03767ec41c8423b).
