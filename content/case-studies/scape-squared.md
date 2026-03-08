---
title: "Scape Squared"
description: "Customised e-commerce storefront built on Vercel Commerce and Shopify"
techStack: "Next.js, Vercel E-commerce, Shopify"
---

## The problem

Setting up an online store usually means choosing between Shopify's hosted themes (limited customisation) or building from scratch (months of work). Vercel's Commerce template provides a middle ground: a Next.js storefront connected to Shopify's backend. But the template needed significant customisation to match the brand and deliver the shopping experience I wanted.

## Architecture

### Vercel Commerce foundation

The storefront is built on Vercel's Commerce template, which provides the Next.js App Router structure, Shopify Storefront API integration, cart management, and checkout flow out of the box. This foundation handles the complex e-commerce plumbing: inventory syncing, price formatting, variant selection, and Shopify's checkout redirect.

### Shopify Storefront API

All product data comes from Shopify's Storefront API via GraphQL queries. Products, collections, and inventory are managed in Shopify's admin interface and pulled into the storefront at build time (ISR) and on demand. This separation means product management happens in Shopify's familiar UI while the customer-facing experience is fully custom.

### ISR for performance

Product pages use Incremental Static Regeneration. Pages are statically generated at build time for fast initial loads, then revalidated in the background when product data changes. This means customers see near-instant page loads while product information stays fresh without full rebuilds.

### Brand customisation

The template's default styling was replaced with custom brand design: typography, colour palette, layout structure, product card design, and collection pages. The cart drawer, search, and navigation were restyled to match. All customisation lives in the Next.js layer; the Shopify backend remains standard.

## Challenges

**Shopify API versioning**: Shopify's Storefront API versions quarterly, sometimes with breaking changes to GraphQL schema fields. The integration pins to a specific API version and includes type generation from the schema, so breaking changes surface as TypeScript errors rather than runtime failures.

**Cart state management**: The Commerce template manages cart state through Shopify's cart API, which returns a new cart object on every mutation. Optimistic updates in the UI (showing the item added immediately) needed to reconcile with the server response, handling edge cases like out-of-stock items that the server rejects.

**Image optimisation**: Product images from Shopify come in various sizes and aspect ratios. The storefront uses Next.js Image with Shopify's image transform API to request exactly the dimensions needed for each viewport, avoiding over-fetching large images on mobile.

## Outcome

Scape Squared delivers a custom-branded shopping experience with the reliability of Shopify's backend. Pages load in under a second thanks to ISR, product management stays in Shopify's familiar admin, and the customer experience is fully tailored to the brand. The Vercel Commerce foundation meant the store was live in days rather than months.
