export type PersonaHub = {
  slug: string;
  label: string;
  title: string;
  eyebrow: string;
  summary: string;
  audience: string;
  trustAsset: string;
  freeAsset: string;
  paidAsset: string;
  products: {
    name: string;
    stage: "free" | "draft" | "validation" | "live" | "later";
    format: string;
    priceBand: string;
    purpose: string;
    route: string;
    href?: string;
  }[];
  primaryCta: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    label: string;
    href: string;
  };
  status: string;
  priceBand: string;
  checkoutDirection: string;
  shelves: string[];
  channels: string[];
  proofMetric: string;
  supportBoundary: string;
  nextMoves: string[];
  routesBack: string[];
};

export const personaHubs: PersonaHub[] = [
  {
    slug: "ops",
    label: "AI ops",
    title: "Local AI business ops systems",
    eyebrow: "For solo founders who need the machine to do real work",
    summary:
      "A practical route for turning local LLMs, agents, LaunchAgents, receipts, and dashboards into a business operating system that earns its keep.",
    audience:
      "Solo founders, indie hackers, creators, and tiny teams whose AI tools are impressive but not yet operationally useful.",
    trustAsset:
      "The Mac Mini automation stack, operator board, memory discipline, local LLM routing, and daily business receipts.",
    freeAsset: "Local AI Business Ops Quick Check",
    paidAsset: "Local AI Business Ops Starter",
    products: [
      {
        name: "Local AI Business Ops Quick Check",
        stage: "free",
        format: "Checklist",
        priceBand: "Free",
        purpose:
          "Qualifies whether a founder's local AI setup is doing measurable work or just creating noise.",
        route: "Profile links, YouTube descriptions, LinkedIn proof posts",
        href: "/ops/quick-check?utm_source=sammii_dev&utm_medium=owned&utm_campaign=ops_hub&utm_content=quick_check_card",
      },
      {
        name: "Local AI Business Ops Starter",
        stage: "live",
        format: "PDF, templates, runbook",
        priceBand: "GBP 29",
        purpose:
          "Turns a messy local LLM setup into lanes, schedules, receipts, and approval boundaries.",
        route: "Owned hub to Stripe checkout; Gumroad or Lemon Squeezy later if file delivery is cleaner.",
        href: "/ops/starter?utm_source=sammii_dev&utm_medium=owned&utm_campaign=ops_hub&utm_content=starter_card",
      },
      {
        name: "LaunchAgent automation template pack",
        stage: "draft",
        format: "Template pack",
        priceBand: "GBP 9-29",
        purpose:
          "Gives buyers copyable daily, weekly, and watchdog automation patterns without custom service work.",
        route: "GitHub/readme proof, YouTube demos, ops hub",
      },
      {
        name: "Mini paid-for-itself dashboard",
        stage: "later",
        format: "Notion or Markdown system",
        priceBand: "GBP 29-79",
        purpose:
          "Tracks saved time, shipped work, reach experiments, revenue tests, and approval blockers.",
        route: "Ops hub, personal systems hub, LinkedIn",
      },
    ],
    primaryCta: {
      label: "Take the quick check",
      href: "/ops/quick-check?utm_source=sammii_dev&utm_medium=owned&utm_campaign=ops_hub&utm_content=primary_cta",
    },
    secondaryCta: {
      label: "See the starter",
      href: "/ops/starter?utm_source=sammii_dev&utm_medium=owned&utm_campaign=ops_hub&utm_content=secondary_cta",
    },
    status: "Stripe checkout live",
    priceBand: "GBP 29 starter; capped async teardown only after proof",
    checkoutDirection:
      "Stripe checkout is live for the starter pack. Gumroad or Lemon Squeezy can replace it later if instant file delivery is cleaner.",
    shelves: ["Stripe Checkout", "Gumroad draft", "Lemon Squeezy draft", "YouTube descriptions"],
    channels: ["YouTube search", "LinkedIn", "Threads", "GitHub/readme proof"],
    proofMetric:
      "Proof engagement -> quick-check click -> starter click -> paid intent or sale.",
    supportBoundary:
      "Self-serve asset first. Any teardown is async, fixed-scope, and separately approved.",
    nextMoves: [
      "Wire instant delivery for Stripe purchases.",
      "Prepare proof screenshots and a before/after system map.",
      "Add the checkout link to one owned profile after local verification.",
      "Prepare five search/problem titles for YouTube and LinkedIn.",
    ],
    routesBack: ["sammii.dev/links", "YouTube descriptions", "LinkedIn featured link"],
  },
  {
    slug: "stardust",
    label: "Stardust",
    title: "Astrology education and chart practice",
    eyebrow: "For chart learners who want to practise, not guess",
    summary:
      "A separate education lane for chart literacy, transits, house/ruler practice, and reusable astrology learning assets that can still point back into Lunary.",
    audience:
      "Astrology learners who save chart-literacy posts and want a reusable system for understanding placements and transits.",
    trustAsset:
      "Chart education, current-sky literacy, transit explanations, and the Lunary chart route.",
    freeAsset: "Chart practice preview",
    paidAsset: "Stardust chart practice bundle",
    products: [
      {
        name: "Chart practice preview",
        stage: "free",
        format: "Worksheet",
        priceBand: "Free",
        purpose:
          "Turns chart literacy posts into a saveable practice asset that points serious learners to Lunary.",
        route: "Pinterest, IG carousels, Lunary chart route",
      },
      {
        name: "Stardust chart practice bundle",
        stage: "validation",
        format: "PDF or Notion workbook",
        priceBand: "GBP 19-59",
        purpose:
          "A reusable learning system for houses, rulers, aspects, transits, and synthesis practice.",
        route: "Stardust hub, Payhip or Gumroad, Lunary chart route",
      },
      {
        name: "Transit tracker printable",
        stage: "draft",
        format: "Printable planner",
        priceBand: "GBP 7-19",
        purpose:
          "Captures current-sky interest without promising predictions or personal readings.",
        route: "Etsy discovery, Pinterest search, Stardust hub",
      },
      {
        name: "House ruler drill deck",
        stage: "later",
        format: "Card deck or mini-course",
        priceBand: "GBP 19-39",
        purpose:
          "A practice-led asset for learners who want repetition, not another flat explanation page.",
        route: "YouTube Shorts, Pinterest, Lunary chart route",
      },
    ],
    primaryCta: {
      label: "Use the Lunary chart route",
      href: "https://lunary.app/links?utm_source=sammii_stardust&utm_medium=owned&utm_campaign=distribution_layer&utm_content=chart_route",
    },
    status: "Ready for approval prep",
    priceBand: "GBP 19-59",
    checkoutDirection:
      "Payhip or Gumroad for validation; Lunary shop only if the product is strongly app-attached.",
    shelves: ["Payhip", "Gumroad", "Etsy planner variant", "Notion Marketplace if deep"],
    channels: ["Pinterest", "Instagram carousels", "TikTok", "YouTube Shorts", "Lunary links"],
    proofMetric:
      "Saves, shares, comments -> preview click -> bundle click -> Lunary route click or sale.",
    supportBoundary:
      "Self-serve education only. No personal chart interpretation promise.",
    nextMoves: [
      "Refresh the free preview sample.",
      "Prepare the bundle table of contents.",
      "Prepare screenshots and a storyboard.",
      "Write Etsy/Pinterest-safe titles and descriptions.",
    ],
    routesBack: ["Lunary chart route", "Pinterest pins", "IG carousel captions"],
  },
  {
    slug: "seer",
    label: "Seer",
    title: "Tarot journalling and symbolic reflection",
    eyebrow: "For reflection systems, not private readings",
    summary:
      "A product lane for tarot/oracle prompts, spread systems, and pattern-tracking templates that stays bounded and self-serve.",
    audience:
      "Tarot and oracle users who want repeatable journalling systems rather than one-off readings.",
    trustAsset: "Symbolic journalling, spread design, and pattern tracking.",
    freeAsset: "One-card journal sample",
    paidAsset: "Tarot journal or spread pack",
    products: [
      {
        name: "One-card journal sample",
        stage: "free",
        format: "Printable or Notion sample",
        priceBand: "Free",
        purpose:
          "Lets people try the reflection loop before buying a larger symbolic journalling system.",
        route: "Pinterest, TikTok bio, Seer hub",
      },
      {
        name: "Tarot journalling system",
        stage: "draft",
        format: "Notion or PDF workbook",
        priceBand: "GBP 19-49",
        purpose:
          "Tracks spreads, themes, symbols, repeat cards, and reflection notes without selling private readings.",
        route: "Seer hub, Gumroad or Notion Marketplace if deep",
      },
      {
        name: "Spread pack for self-reflection",
        stage: "validation",
        format: "Printable pack",
        priceBand: "GBP 9-29",
        purpose:
          "Low-lift product for people who already save tarot prompt posts.",
        route: "Etsy, Pinterest, Instagram",
      },
    ],
    primaryCta: {
      label: "View product shelf",
      href: "#products",
    },
    status: "Local prep",
    priceBand: "GBP 9-29 starter; GBP 29-59 system",
    checkoutDirection:
      "Etsy or Gumroad for validation; Notion Marketplace only for a deep tracker.",
    shelves: ["Etsy", "Gumroad", "Notion Marketplace", "Pinterest"],
    channels: ["Pinterest", "TikTok", "Instagram", "Threads"],
    proofMetric:
      "Saves/comments -> sample click -> template/product click -> sale or signup.",
    supportBoundary:
      "No private readings, no fortune-telling outcome promises, no unlimited interpretation.",
    nextMoves: [
      "Draft the one-card sample locally.",
      "Prepare the spread pack structure.",
      "Write self-reflection-first listing copy.",
      "Make the support boundary visible.",
    ],
    routesBack: ["Pinterest", "TikTok captions", "sammii.dev/links"],
  },
  {
    slug: "crystals",
    label: "Crystals",
    title: "Crystal reference and ritual systems",
    eyebrow: "For searchable reference packs and printable companions",
    summary:
      "A discovery-friendly lane for crystal meanings, correspondences, seasonal rituals, and printable reference systems.",
    audience:
      "Crystal users who search for meanings, correspondences, and ritual references.",
    trustAsset: "Reference cards, grimoire-style knowledge, and seasonal practices.",
    freeAsset: "Crystal reference sample",
    paidAsset: "Crystal companion or reference bundle",
    products: [
      {
        name: "Crystal reference sample",
        stage: "free",
        format: "Reference card",
        priceBand: "Free",
        purpose:
          "Search-friendly preview that shows the reference style without medical or outcome claims.",
        route: "Pinterest search, crystal hub, Lunary grimoire",
      },
      {
        name: "Crystal companion bundle",
        stage: "draft",
        format: "PDF reference bundle",
        priceBand: "GBP 29-59",
        purpose:
          "Structured meanings, correspondences, journal prompts, and seasonal ritual notes.",
        route: "Etsy, Payhip, Pinterest",
      },
      {
        name: "Crystal quick cards",
        stage: "validation",
        format: "Printable cards",
        priceBand: "GBP 7-19",
        purpose:
          "Small discovery product for buyers searching by crystal, colour, chakra, or use case.",
        route: "Etsy discovery, Pinterest, crystal hub",
      },
    ],
    primaryCta: {
      label: "Browse Lunary grimoire",
      href: "https://lunary.app/grimoire?utm_source=sammii_crystals&utm_medium=owned&utm_campaign=distribution_layer&utm_content=crystals",
    },
    status: "Local prep",
    priceBand: "GBP 7-19 starter; GBP 29-59 bundle",
    checkoutDirection: "Etsy for discovery; Payhip or Gumroad for owned checkout.",
    shelves: ["Etsy", "Payhip", "Gumroad", "Pinterest"],
    channels: ["Pinterest search", "Google/Bing search", "Instagram", "TikTok"],
    proofMetric: "Search/social click -> product page -> sale or bundle click.",
    supportBoundary:
      "Reference and reflection only. No medical, outcome, or cure claims.",
    nextMoves: [
      "Draft one reference sample.",
      "Prepare the companion bundle contents.",
      "Prepare Pinterest and Etsy titles.",
      "Write affiliate disclosure notes for later.",
    ],
    routesBack: ["Pinterest", "Lunary grimoire", "search pages"],
  },
  {
    slug: "studio",
    label: "Creator systems",
    title: "Creator and content operating systems",
    eyebrow: "For creators who need a repeatable packaging workflow",
    summary:
      "A route for PostReady, Spellcast, Orbit, and content-pack systems that turn one recording into usable assets, CTAs, and measurement.",
    audience:
      "Creators, founders, and tiny brands who record ideas but need repeatable repackaging systems.",
    trustAsset:
      "PostReady, Studio Sammii, Spellcast, Orbit, content pack panels, and scheduling receipts.",
    freeAsset: "Record once, monetise seven ways checklist",
    paidAsset: "PostReady creator workflow kit",
    products: [
      {
        name: "Record once, monetise seven ways checklist",
        stage: "free",
        format: "Checklist",
        priceBand: "Free",
        purpose:
          "Turns a creator workflow idea into a lead magnet for repackaging systems.",
        route: "Studio hub, YouTube demos, TikTok/IG captions",
      },
      {
        name: "PostReady creator workflow kit",
        stage: "draft",
        format: "Workflow kit",
        priceBand: "GBP 79-149",
        purpose:
          "Shows how to turn one recording into clips, captions, thumbnails, CTAs, and measurement.",
        route: "Studio hub, Gumroad or Payhip, product demos",
      },
      {
        name: "Content repackaging prompt pack",
        stage: "validation",
        format: "Prompt and template pack",
        priceBand: "GBP 19-39",
        purpose:
          "A smaller paid entry point for creators not ready for a full workflow kit.",
        route: "LinkedIn, Threads, YouTube descriptions",
      },
      {
        name: "Spellcast operator templates",
        stage: "later",
        format: "Templates and SOPs",
        priceBand: "GBP 29-79",
        purpose:
          "Productises scheduling, review, and boost logic without selling open-ended admin work.",
        route: "Spellcast case study, studio hub",
      },
    ],
    primaryCta: {
      label: "See Spellcast proof",
      href: "/projects/spellcast?utm_source=persona_hub&utm_medium=owned&utm_campaign=distribution_layer&utm_content=studio",
    },
    secondaryCta: {
      label: "Read automation stack",
      href: "/blog/running-5-projects-solo-automation-stack?utm_source=persona_hub&utm_medium=owned&utm_campaign=distribution_layer&utm_content=studio",
    },
    status: "Needs sample",
    priceBand: "GBP 19-39 starter; GBP 79-149 workflow kit",
    checkoutDirection:
      "Payhip or Gumroad for packs; Lemon Squeezy if the product becomes app/licence based.",
    shelves: ["Payhip", "Gumroad", "Lemon Squeezy", "YouTube demos"],
    channels: ["TikTok", "Instagram", "LinkedIn", "YouTube demos", "Threads"],
    proofMetric: "Demo engagement -> checklist click -> kit click -> paid intent.",
    supportBoundary:
      "Templates and workflows first. No open-ended editing or admin service.",
    nextMoves: [
      "Prepare the checklist sample.",
      "Prepare export-preset proof screenshots.",
      "Prepare listing fields.",
      "Prepare demo video CTA.",
    ],
    routesBack: ["PostReady demos", "LinkedIn", "YouTube descriptions"],
  },
  {
    slug: "softly",
    label: "Softly",
    title: "Travel, soft-life proof, and lifestyle products",
    eyebrow: "For selling the dream without guru nonsense",
    summary:
      "A lifestyle halo that monetises travel, freedom, reset systems, and pretty planning assets while still pointing back to real operational proof.",
    audience:
      "Women who want softer, prettier, freer remote lives without vague life-coach promises.",
    trustAsset: "Travel/founder proof, Softly Becoming visuals, and systems receipts.",
    freeAsset: "Soft reset weekend mini guide",
    paidAsset: "Dream-life planner, relocation tracker, or remote-work ritual kit",
    products: [
      {
        name: "Soft reset weekend mini guide",
        stage: "free",
        format: "Mini guide",
        priceBand: "Free",
        purpose:
          "Turns lifestyle content into a useful first click without selling coaching.",
        route: "Softly hub, Instagram, Pinterest",
      },
      {
        name: "Dream-life planner",
        stage: "validation",
        format: "Printable planner",
        priceBand: "GBP 7-15",
        purpose:
          "A low-ticket aesthetic planner for people saving travel, reset, and soft-life content.",
        route: "Etsy, Pinterest, Softly hub",
      },
      {
        name: "Remote-work ritual kit",
        stage: "draft",
        format: "PDF or Notion kit",
        priceBand: "GBP 29-59",
        purpose:
          "Connects lifestyle desire to practical systems for focus, routines, and travel admin.",
        route: "Softly hub, Gumroad, personal links",
      },
      {
        name: "Relocation tracker",
        stage: "later",
        format: "Notion tracker",
        priceBand: "GBP 19-49",
        purpose:
          "A practical planning product for remote-life decisions, budgets, and tradeoffs.",
        route: "Softly hub, Notion Marketplace if deep",
      },
    ],
    primaryCta: {
      label: "View product shelf",
      href: "#products",
    },
    status: "Needs sample",
    priceBand: "GBP 7-15 starter; GBP 29-59 planner/system",
    checkoutDirection: "Etsy for printables; Fourthwall later for merch.",
    shelves: ["Etsy", "Gumroad", "Fourthwall later", "Pinterest"],
    channels: ["Instagram", "Pinterest", "TikTok", "Threads", "email"],
    proofMetric: "Saves/comments -> guide click -> product click -> sale.",
    supportBoundary: "Self-serve aesthetic/planning assets only. No coaching promise.",
    nextMoves: [
      "Package one travel/freedom proof angle.",
      "Prepare one printable starter.",
      "Prepare Etsy title and tag fields.",
      "Route serious operators back to AI ops.",
    ],
    routesBack: ["Instagram", "Pinterest", "sammii.dev/links"],
  },
  {
    slug: "cast",
    label: "Cast",
    title: "Career systems and application operating kits",
    eyebrow: "For serious remote applications without chaos",
    summary:
      "A public-safe product lane from the Cast workflow: trackers, scoring rubrics, fit checks, and application pipeline systems.",
    audience:
      "Senior frontend/design engineers and remote-first candidates managing serious applications.",
    trustAsset: "Cast pipeline, CV templates, ATS scoring, and job CRM discipline.",
    freeAsset: "Senior remote-role fit checklist",
    paidAsset: "Application pipeline kit",
    products: [
      {
        name: "Senior remote-role fit checklist",
        stage: "free",
        format: "Checklist",
        priceBand: "Free",
        purpose:
          "Public-safe entry point for candidates deciding which roles are worth effort.",
        route: "LinkedIn, blog posts, Cast hub",
      },
      {
        name: "Application pipeline kit",
        stage: "draft",
        format: "Notion or spreadsheet kit",
        priceBand: "GBP 79-149",
        purpose:
          "A job CRM, scoring rubric, application status system, and review cadence.",
        route: "Cast hub, Gumroad or Payhip",
      },
      {
        name: "CV evidence bank template",
        stage: "validation",
        format: "Template",
        priceBand: "GBP 19-39",
        purpose:
          "Helps candidates collect real proof without fabricating impact or role history.",
        route: "LinkedIn, Dev.to, Cast hub",
      },
    ],
    primaryCta: {
      label: "Read the systems writing",
      href: "/blog?utm_source=persona_hub&utm_medium=owned&utm_campaign=distribution_layer&utm_content=cast",
    },
    status: "Needs sample",
    priceBand: "GBP 19-39 starter; GBP 79-149 kit",
    checkoutDirection:
      "Gumroad or Payhip; Notion Marketplace only for a genuinely useful tracker.",
    shelves: ["Gumroad", "Payhip", "Notion Marketplace", "LinkedIn"],
    channels: ["LinkedIn", "Dev.to", "Hashnode", "YouTube search"],
    proofMetric: "Article/video click -> checklist click -> tracker click -> sale.",
    supportBoundary:
      "System/template only. No application writing, recruiter outreach, or guaranteed outcomes.",
    nextMoves: [
      "Extract public-safe proof without using the Cast jobs token.",
      "Prepare the checklist.",
      "Prepare the tracker schema.",
      "Write marketplace-safe copy.",
    ],
    routesBack: ["LinkedIn", "blog posts", "YouTube search"],
  },
  {
    slug: "systems",
    label: "Personal systems",
    title: "Personal operating systems for solo operators",
    eyebrow: "For dropped-ball prevention and calmer execution",
    summary:
      "A public version of the private Homebase/operator-board discipline: memory, projects, review loops, and automation boundaries.",
    audience:
      "Solo operators and system nerds with too many projects, moving parts, and stale tasks.",
    trustAsset: "Memory index, Homebase, operator board, daily briefs, and AI architecture.",
    freeAsset: "Dropped-ball detector checklist",
    paidAsset: "Personal operating system kit",
    products: [
      {
        name: "Dropped-ball detector checklist",
        stage: "free",
        format: "Checklist",
        priceBand: "Free",
        purpose:
          "A small diagnostic for solo operators whose systems keep creating stale tasks.",
        route: "Systems hub, LinkedIn, YouTube",
      },
      {
        name: "Personal operating system kit",
        stage: "draft",
        format: "Notion and Markdown system",
        priceBand: "GBP 79-149",
        purpose:
          "A private operating model for memory, projects, reviews, receipts, and approval boundaries.",
        route: "Systems hub, Notion Marketplace if deep",
      },
      {
        name: "Review queue pruning template",
        stage: "validation",
        format: "Template",
        priceBand: "GBP 9-29",
        purpose:
          "A smaller product for people drowning in AI-generated actions and stale review queues.",
        route: "Systems hub, AI ops hub, LinkedIn",
      },
      {
        name: "Weekly operator board pack",
        stage: "later",
        format: "Dashboard templates",
        priceBand: "GBP 29-79",
        purpose:
          "Shows what happened, what needs approval, what is blocked, and what paid for itself.",
        route: "Systems hub, ops hub, YouTube walkthroughs",
      },
    ],
    primaryCta: {
      label: "Read the AI agents article",
      href: "/blog/i-built-a-self-managing-memory-system-for-claude-code-and-it-changed-how-i-work?utm_source=persona_hub&utm_medium=owned&utm_campaign=distribution_layer&utm_content=systems",
    },
    status: "Needs sample",
    priceBand: "GBP 9-29 starter; GBP 79-149 system kit",
    checkoutDirection:
      "Notion Marketplace if deep; Payhip or Gumroad for a broader bundle.",
    shelves: ["Notion Marketplace", "Payhip", "Gumroad", "YouTube walkthroughs"],
    channels: ["YouTube", "LinkedIn", "Threads", "Substack/Kit later"],
    proofMetric: "Walkthrough engagement -> checklist click -> kit click -> paid intent.",
    supportBoundary:
      "Template and operating model only. No open-ended personal admin.",
    nextMoves: [
      "Prepare the dropped-ball checklist.",
      "Apply the Notion depth gate.",
      "Prepare system map screenshots.",
      "Route commercial buyers into the AI ops starter.",
    ],
    routesBack: ["YouTube", "LinkedIn", "AI ops route"],
  },
];

export function getPersonaHub(slug: string): PersonaHub | undefined {
  return personaHubs.find((hub) => hub.slug === slug);
}
