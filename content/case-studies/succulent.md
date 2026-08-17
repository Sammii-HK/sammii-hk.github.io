---
title: "Succulent"
description: "Social media management platform with integrated print-on-demand and e-commerce"
techStack: "Next.js, Ayrshare API, AI SDK, Stripe, Shopify API"
---

## The problem

A finished design normally has to go to two different places: out as a social post, and onto a product listing. Most tools treat those as separate jobs, run through separate logins, with separate content libraries and no shared context between them. Succulent starts from the design itself instead: upload it once, and both the social posts and the print-on-demand products it should generate come from that same asset, managed from a single dashboard.

## Architecture

### Publishing through Ayrshare

Ayrshare gives a single endpoint for posting to 13+ platforms at once. Succulent uses it to manage connected accounts, handle the details that differ per platform (character limits, image dimensions, hashtag conventions) and schedule delivery with timezone-aware posting.

### Shopify handles the product side

When a design is uploaded, Succulent creates the Shopify product automatically, applying the design to whichever product templates are configured: t-shirts, prints, mugs. The Shopify Storefront API does the actual work here, generating variants for size and colour, managing inventory, and bringing the listing live with a generated title, description and price already attached.

### Content generation via the AI SDK

The AI SDK generates platform-specific copy and product descriptions from the design and its metadata: longer-form for LinkedIn, punchy for X, hashtag-heavy for Instagram. Everything it produces is editable before it goes out, rather than posted blind.

### Billing through Stripe

Subscriptions run through Stripe. Tier determines how many social accounts can be connected, how often posts can go out, and how many product templates are available, and webhook handlers keep the app in step with the subscription lifecycle: upgrades, cancellations, failed payments.

## Challenges

Ayrshare sits in front of several platform APIs, and each carries its own rate limit. Publishing to all 13 platforms in one burst would simply get rejected, so the scheduling system queues posts per platform and staggers them with appropriate delays rather than firing everything at once.

Print-on-demand adds its own complication at the upload step: a t-shirt, a print and a mug each have a different printable area, DPI requirement and colour profile. The template system encodes those constraints per product type, validates an uploaded design against them, and shows a preview of how the design sits on each product before anything gets created.

Content also needed to stay in sync after the fact. Once a design changes, both the social posts and the Shopify products built from it need to reflect that change, without the system quietly spinning up duplicates. The fix was to track the relationship between a source design, the posts published from it and the products created from it, so an edit propagates across all three instead of forking them apart.

## Outcome

Succulent unifies social media and e-commerce into one workflow. Uploading a design triggers both social publishing and product creation, with AI-generated content already drafted for each. That is the context-switching and manual duplication it was built to remove.
