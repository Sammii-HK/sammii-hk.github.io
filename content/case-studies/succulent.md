---
title: "Succulent"
description: "Social media management platform with integrated print-on-demand and e-commerce"
techStack: "Next.js, Ayrshare API, AI SDK, Stripe, Shopify API"
---

## The problem

Running a creative brand involves two parallel workflows: social media publishing and e-commerce product management. These are usually separate tools with separate logins, separate content libraries, and no connection between them. I wanted a unified platform where creating a design automatically generates both social posts and print-on-demand products, managed from a single dashboard.

## Architecture

### Unified publishing via Ayrshare

Social media publishing uses the Ayrshare API, which provides a single endpoint for posting to 13+ platforms simultaneously. The platform manages connected accounts, handles platform-specific formatting (character limits, image dimensions, hashtag rules), and schedules posts with timezone-aware delivery.

### Shopify product automation

When a design is uploaded, the system automatically creates a Shopify product with the design applied to configured product templates (t-shirts, prints, mugs). The Shopify Storefront API handles product creation, variant generation (sizes, colours), and inventory management. Product listings go live automatically with generated titles, descriptions, and pricing.

### AI content generation

The AI SDK generates platform-specific captions, product descriptions, and hashtag sets from the uploaded design and its metadata. Each platform gets a tailored version: longer form for LinkedIn, punchy for X, hashtag-heavy for Instagram. Generated content is editable before publishing.

### Stripe billing

The platform uses Stripe for subscription management. Different tiers unlock more connected social accounts, higher posting frequency, and more product templates. Webhook handlers manage subscription lifecycle events (creation, upgrade, cancellation, payment failure).

## Challenges

**Platform API rate limits**: Ayrshare aggregates multiple platform APIs, each with different rate limits. The scheduling system respects per-platform rate limits by queuing posts with appropriate delays. Burst publishing (e.g. posting to all 13 platforms simultaneously) needed to be staggered to avoid API rejections.

**Product template mapping**: Different print-on-demand products have different printable areas, DPI requirements, and colour profiles. The template system defines printable regions per product type, validates uploaded designs against these constraints, and shows a preview of the design on each product before creation.

**Content synchronisation**: When a design is updated, both the social posts and Shopify products need to reflect the change. The system tracks the relationship between source designs, published posts, and created products, propagating updates without creating duplicate content.

## Outcome

Succulent unifies social media and e-commerce into a single workflow. Uploading a design triggers both social publishing and product creation, with AI-generated content for each. This eliminates the context-switching and manual duplication that comes from managing these workflows separately.
