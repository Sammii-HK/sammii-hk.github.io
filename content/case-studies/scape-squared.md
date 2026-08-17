---
title: "Scape Squared"
description: "Customised e-commerce storefront built on Vercel Commerce and Shopify"
techStack: "Next.js, Vercel E-commerce, Shopify"
---

## The problem

Vercel's Commerce template is a reference implementation, not a finished shop. Out of the box it gives you a working Next.js app wired to Shopify's Storefront API: cart logic, checkout redirect, inventory syncing, all solved. What it doesn't give you is a look. That's both the appeal and the catch of it, set against the two more obvious routes into e-commerce. Shopify's own hosted themes keep the customisation ceiling low. Building from scratch removes that ceiling but turns a shop into a months-long build. Scape Squared needed the template's plumbing without the template's face: a fully custom storefront sitting on an entirely standard Shopify backend.

## Architecture

### The template underneath

The storefront's foundation is Vercel's Commerce template, which supplies the Next.js App Router structure, the Shopify Storefront API integration, cart management, and the checkout flow. It's the part of e-commerce that's genuinely just plumbing, and it stays largely untouched: inventory syncing, price formatting, variant selection, and Shopify's own checkout redirect all come from the template as-is.

### Where the data comes from

Every product, collection, and stock level is managed in Shopify's admin, then pulled into the storefront through GraphQL queries against the Storefront API, partly at build time via ISR and partly on demand. Keeping that split meant product management stayed in Shopify's familiar admin interface, while the customer-facing side could be rebuilt completely.

### Static by default, fresh on demand

Product pages use Incremental Static Regeneration: generated statically at build time so the first load is fast, then revalidated in the background whenever the underlying product data changes. Customers get near-instant pages, with product data kept fresh without full rebuilds.

### Making it not look like a template

Everything visual came out: typography, colour palette, layout, product cards, collection pages, cart drawer, search, navigation. All of that customisation lives entirely in the Next.js layer, so none of it touches the Shopify backend underneath.

## Where the template pushed back

Three parts of this didn't come for free.

Shopify versions its Storefront API quarterly, and the GraphQL schema doesn't always change safely. Pinning the integration to a specific API version and generating types straight from that schema turns a breaking change on Shopify's side into a TypeScript error rather than a runtime failure.

The template drives the cart through Shopify's own cart API, which hands back a whole new cart object after every mutation. Showing an item as added the moment someone clicks, before Shopify's response comes back, meant reconciling that optimistic guess against what the server actually returned, including the case where the server rejects the add because the item sold out in the meantime.

Product photography from Shopify arrives in a spread of sizes and aspect ratios rather than one consistent format. Pairing Next.js Image with Shopify's own image transform API let the storefront request each image sized to the exact viewport rendering it, so a phone is never pulling down a desktop-sized product photo just to shrink it on screen.

## Outcome

Scape Squared runs a custom-branded storefront on top of Shopify's backend reliability. ISR keeps pages loading in under a second, product management never left Shopify's admin, and the customer-facing experience is built entirely to the brand rather than skinned over a theme. Starting from Vercel's Commerce template rather than a blank Next.js app was the difference between a store live in days and one that would have taken months.
