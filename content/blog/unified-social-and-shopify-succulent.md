---
title: "One dashboard for social, print-on-demand, and commerce: the Succulent stack"
description: >-
  A creative brand has two workflows: posting to thirteen platforms, and
  running a print-on-demand shop. Succulent unifies them. One design upload
  becomes a scheduled post across every platform and a live Shopify product.
  Here is what the integration actually looks like.
date: '2026-07-15'
tags:
  - nextjs
  - shopify
  - ayrshare
  - typescript
  - ecommerce
draft: false
---
A creative brand runs two dashboards. One is Buffer or Later, where the same image gets reformatted six ways and scheduled into six queues. The other is Shopify with Printful bolted on, where the same image gets uploaded again, mapped onto mockups, priced, described, and pushed live. Two tools, two content libraries, two logins, no wire between them. Update the design, redo both flows.

Succulent treats that as a single problem. Upload a design, and in one click a scheduled post fans out to every connected social platform, and a Shopify product gets programmatically created with the design applied to whatever product templates you have configured. Tote bag, t-shirt, mug, art print, all live on your store with tailored captions, in the time it used to take to rename a file for Instagram.

---

## The two-dashboard problem

Time it honestly. Uploading a design to Shopify with Printful: around fifteen minutes picking a template, confirming print placement, writing title and description, choosing variants, setting pricing, pushing live. Scheduling the launch across eight platforms in Buffer: another thirty, because Instagram wants a longer caption, X wants a hook under 280 characters, LinkedIn wants a why-I-made-this angle, TikTok wants a casual pre-roll, Pinterest wants keyword-rich. Every one is a rewrite.

Forty-five minutes per design, none of it creative. It is manual duplication because no single tool treats a design as a first-class thing that feeds both flows.

Social tools treat an upload as a media asset; commerce tools treat it as a product source. Nobody models both, because the two problems are owned by different companies. Succulent's premise is a shared schema where one object is simultaneously the input to a social post and the input to a Shopify product, and downstream consumers (Ayrshare, Shopify, the AI caption layer) read from that one source.

## Ayrshare as a single endpoint

Thirteen platforms, thirteen APIs, thirteen auth flows, thirteen rate-limit regimes. I had partial integrations for four before giving up. Ayrshare normalises all thirteen behind one API: POST to `/api/post` with a payload describing what to publish and where, and their service handles per-platform translation.

The shape of the scheduling call, pulled straight from Succulent:

```typescript
const postPayload: any = {
  post: content,
  platforms: [platformLower],
  scheduleDate: scheduleTime.toISOString(),
};

if (profileKey) postPayload.profileKey = profileKey;
if (mediaUrls?.length) postPayload.mediaUrls = mediaUrls;

if (platformLower === "pinterest") {
  postPayload.pinterestOptions = {
    title: content.split("\n")[0]?.slice(0, 100) || "Pin",
  };
}

if (platformLower === "tiktok") {
  postPayload.tiktokOptions = {
    privacyLevel: "PUBLIC_TO_EVERYONE",
    autoAddMusic: !hasVideo,
  };
}

const response = await fetch(`${AYRSHARE_API_URL}/post`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  },
  body: JSON.stringify(postPayload),
});
```

`profileKey` is how Ayrshare's business tier does multi-tenant: one API key, many connected account sets, you name the set per request. Multi-brand usage without a stack of keys.

The platform-specific options are where it earns its keep. Pinterest needs a pin title. TikTok needs a privacy level and, without video, `autoAddMusic` so the post can ride a sound. Reddit needs a title and subreddit. Succulent exposes these only where required.

What Ayrshare does not do: character limits. A 2,200-character Instagram caption will not be trimmed to 280 for X; the request just fails. That is the AI layer's job. Also worth knowing: `autoHashtag` generates platform-appropriate hashtags from post text, `shortenLinks` wraps URLs through their tracking shortener, scheduled dates are timezone-aware if you send proper ISO, and post deletion needs both `id` and `profileKey` (caught me once while reconciling orphaned scheduled posts).

## Shopify product automation

Succulent uses Gelato as the fulfilment provider and Shopify as the storefront. The user preconfigures Gelato templates (tote bag with a specific print area, unisex tee with sizing variants, A2 print); an uploaded image gets mapped into the template's image placeholders to produce a real Shopify product, published to whichever sales channels the user has selected.

The template fetch comes first, because Gelato templates describe their own placeholder structure and the create-from-template call needs placeholder names to match exactly.

```typescript
const templateResponse = await fetch(
  `https://ecommerce.gelatoapis.com/v1/templates/${templateId}`,
  {
    method: "GET",
    headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
  }
);

const template = await templateResponse.json();

const variants = template.variants.map((variant: any) => {
  const imagePlaceholders = variant.imagePlaceholders?.map(
    (placeholder: any, index: number) => ({
      name: placeholder.name,
      fileUrl: gelatoImageUrls[index % gelatoImageUrls.length],
    })
  );
  return { templateVariantId: variant.id, imagePlaceholders };
});

const productPayload = {
  templateId,
  title: productData.title,
  description: productData.description,
  isVisibleInTheOnlineStore: true,
  salesChannels: ["web"],
  tags: productData.tags ?? template.tags,
  variants,
};

const createResponse = await fetch(
  `https://ecommerce.gelatoapis.com/v1/stores/${storeId}/products:create-from-template`,
  {
    method: "POST",
    headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify(productPayload),
  }
);
```

One gotcha: Gelato needs the image URL reachable by its own servers, not just the user's browser. Succulent uploads images to Gelato's file service first and uses the returned Gelato-hosted URL. That sidesteps signed URLs, authenticated proxies, ephemeral blobs. If the image lives on a private CDN it fails the quietest possible way: product created, image placeholder empty, no visible error until someone visits the product page.

Once Gelato creates the product, it appears in the connected Shopify store. Shopify has its own publishing-channel layer: a product can exist in the store but not be visible to Online Store, or visible there but not to Point of Sale or TikTok Shop. Succulent calls the Shopify Admin API's publications endpoint so the user picks channels at creation time:

```typescript
const response = await fetch(
  `${formattedStoreUrl}/admin/api/2023-10/publications.json`,
  {
    headers: {
      "X-Shopify-Access-Token": accessToken,
      "Content-Type": "application/json",
    },
  }
);
```

Admin API tokens start with `shpat_` for a standard private app or `shpca_` for a custom app. Anything else is the wrong thing, and the 401 Shopify gives you otherwise is not diagnostic; Succulent checks the prefix and logs a warning up front.

## The AI copy layer

Ayrshare handles platform-level formatting, but cannot decide LinkedIn should get the lesson-learned version while X gets a single-line hook. That is content, not formatting, and it needs an LLM.

Succulent uses the Vercel AI SDK with `gpt-4o-mini`, one generation per platform, in parallel. The system prompt injects the platform's character limit and expected tone, then asks the model to re-express the same brand message within those constraints:

```typescript
const { text } = await generateText({
  model: openai("gpt-4o-mini"),
  system: `You are a social media expert. Optimize this content for ${platform}.
Rules:
- Keep the SAME message and meaning
- Apply platform-specific formatting (${limits.description})
- Keep relevant hashtags, move to end if needed
- DO NOT use markdown formatting
- DO NOT use em-dashes
- Return ONLY the optimized post text, nothing else`,
  prompt: `Optimize for ${platform} (max ${limits.maxChars} chars):\n\n${content}`,
  temperature: 0.3,
});
```

The platform limits table is the real data: 280 for X, 2,200 for Instagram with five to ten hashtags, 3,000 for LinkedIn with three to five and a professional-but-personable tone, 300 for Bluesky, 500 for Pinterest leaning keyword-rich, 10,000 for Threads. The same message comes out eight different ways without me writing any of them.

There is a safety net on top. If the output still exceeds the limit (maybe one in fifty on very long source content), the code falls back to intelligent truncation: find the last complete sentence before the cap, prefer sentence-ending punctuation over spaces, hard-cut with an ellipsis only if no clean break exists:

```typescript
if (finalText.length > limits.maxChars) {
  const cutoff = limits.maxChars - 3;
  const lastPeriod = finalText.lastIndexOf(".", cutoff);
  const lastQuestion = finalText.lastIndexOf("?", cutoff);
  const lastExclaim = finalText.lastIndexOf("!", cutoff);
  const bestBreak = Math.max(lastPeriod, lastQuestion, lastExclaim);
  if (bestBreak > cutoff * 0.7) {
    finalText = finalText.slice(0, bestBreak + 1);
  }
}
```

The `cutoff * 0.7` rule stops you cutting a 280-character tweet to fifty because the last sentence end landed weirdly early. If the best sentence break sits in the last thirty per cent, use it; otherwise trim on word boundary with an ellipsis. Small detail, turns "truncation looks broken" into "truncation looks deliberate."

## Stripe for the meta layer

Succulent has its own subscription model because connecting N accounts, publishing N posts a month, and syncing N products to Shopify has real compute and API cost behind it. Free, premium, business, each with usage caps. Stripe Checkout creates the session; subscription metadata stores userId and tier so the webhook handler knows whose limits to bump on upgrade:

```typescript
const session = await stripe.checkout.sessions.create({
  payment_method_types: ["card"],
  line_items: [{ price: priceId, quantity: 1 }],
  mode: "subscription",
  success_url: successUrl,
  cancel_url: cancelUrl,
  customer_email: userEmail,
  metadata: { userId, tier, billing },
  subscription_data: { metadata: { userId, tier, billing } },
});
```

The `subscription_data.metadata` duplication matters. Metadata set on the checkout session does not propagate to the subscription object, so if you only set it on the session, your webhook handler has no idea which user the subscription belongs to when the first renewal event fires weeks later. Stripe wants it on both.

## The shared data model is the hard part

Nothing here is technically difficult on its own. Ayrshare is a well-documented REST API. Gelato and Shopify have solid specs. The AI SDK is trivial. Stripe is Stripe.

What is hard is the shared schema. A post has a `variants` record keyed by platform; each variant holds its own `text`, `media`, `scheduledFor`, `ayrsharePostId`, and `platformOptions`. A product has its own list of `createdProducts`, each linked back to the Gelato template it came from and the Shopify product ID it became. When the user updates a design, both the variants and the product need to update without forking into two disconnected worlds.

The connection is the media item. A variant's `media` and a product's print-area image both reference the same `MediaItem`, a discriminated union over `ImageMedia`, `VideoMedia`, `URLImageMedia`, and `URLVideoMedia`. Swap the underlying asset and both the social post and the Shopify product see the new thing. That shared reference is where most similar tools fall over: they model social posts and shop products in different tables, owned by different services, linked by a loose foreign key that rots.

## What Succulent is not

Not a Shopify replacement: storefront, checkout, fulfilment, customer management all stay in Shopify. Not a Buffer replacement: Ayrshare handles the actual publishing, because Ayrshare is too low-level for a creative brand to wire up directly. Not an AI copy tool in the Jasper sense, because the AI is scoped to platform adaptation of content you already have, not generation from scratch.

What it is, is the thin layer between those three that creative brands hate manually maintaining. Fifteen minutes to Shopify plus thirty on eight platforms collapses to roughly two. Not because any individual step got faster, but because the same source of truth drives everything downstream.

The shared schema does the work. Everything else is glue.
