/**
 * Structured case studies.
 *
 * A case study is an ordered list of blocks, not a fixed template. Each one
 * tells its story with the blocks it needs: a decision with the options that
 * were weighed, a trade-off, a failure and its fix, numbers with their
 * source, media, a timeline of how the project changed. There are no
 * required headings, so no two studies have to read alike.
 *
 * Lives at content/case-studies/<slug>.json and is linked from a project by
 * `caseStudy: "<slug>"`. A study without a JSON file falls back to its
 * Markdown, so studies move over one at a time.
 *
 * Text fields marked "markdown" accept inline Markdown (links, emphasis,
 * code) and paragraphs.
 */

export type Media = {
  /** Path under /public, or an absolute URL. */
  src: string;
  alt: string;
  kind?: "image" | "video";
  caption?: string;
  /** Intrinsic size, so the layout does not jump. */
  width?: number;
  height?: number;
};

export type Block =
  /** A concrete path through a system, with implementation evidence at each boundary. */
  | { type: "flow"; heading: string; steps: Array<{ label: string; detail: string; href: string }>; caption: string }
  /** Plain writing. The heading is optional: not every passage needs one. */
  | { type: "prose"; heading?: string; body: string }
  /** A choice that was made: the question, what was weighed, and what happened. */
  | {
      type: "decision";
      heading: string;
      /** markdown: the situation that forced the choice. */
      context: string;
      options: Array<{ label: string; detail: string; chosen?: boolean }>;
      /** markdown: what choosing it led to. */
      outcome: string;
    }
  /** What was given up, and what that bought. */
  | { type: "tradeoff"; heading?: string; gave: string; got: string }
  /** Something that went wrong. Honest failures are the strongest evidence. */
  | { type: "failure"; heading: string; what: string; why: string; fix: string }
  /** Numbers. Every one names where it came from, so nothing is invented. */
  | {
      type: "metrics";
      heading?: string;
      items: Array<{ label: string; value: string; note?: string; source: string }>;
    }
  | { type: "media"; items: Media[]; layout?: "single" | "pair" | "grid" }
  | { type: "beforeAfter"; before: Media; after: Media; caption?: string }
  | { type: "code"; lang: string; code: string; caption?: string }
  /** How it changed over time. Each entry can link to a progression post. */
  | {
      type: "timeline";
      heading?: string;
      entries: Array<{ date: string; title: string; body?: string; href?: string }>;
    }
  | { type: "callout"; tone?: "note" | "caution"; body: string }
  | { type: "links"; heading?: string; items: Array<{ label: string; href: string }> };

export type BlockType = Block["type"];

export type StructuredCaseStudy = {
  title: string;
  /** One sentence, used for the lead and metadata. */
  description: string;
  techStack: string;
  /** What Sammii did, e.g. "Solo: design, engineering and product". */
  role?: string;
  /** e.g. "Mar 2026 – now". */
  period?: string;
  /** e.g. "Live on the App Store", "Beta", "Archived". */
  status?: string;
  /** Short facts shown beside the hero: packs shipped, users, platforms. */
  facts?: Array<{ label: string; value: string }>;
  /** ISO date this study was last brought up to date. Studies age; this says how much. */
  updated: string;
  blocks: Block[];
};

const isString = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0;
const isArray = (v: unknown): v is unknown[] => Array.isArray(v);
const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

/** Required string fields per block type. Optional fields are checked by type only. */
const REQUIRED: Record<BlockType, string[]> = {
  flow: ["heading", "caption"],
  prose: ["body"],
  decision: ["heading", "context", "outcome"],
  tradeoff: ["gave", "got"],
  failure: ["heading", "what", "why", "fix"],
  metrics: [],
  media: [],
  beforeAfter: [],
  code: ["lang", "code"],
  timeline: [],
  callout: ["body"],
  links: [],
};

const checkMedia = (m: unknown, at: string, errors: string[]) => {
  if (!isObject(m)) return errors.push(`${at}: must be an object`);
  if (!isString(m.src)) errors.push(`${at}.src: required`);
  // Alt text is required; an empty string is allowed only for decorative media.
  if (typeof m.alt !== "string") errors.push(`${at}.alt: required (use "" only for decorative media)`);
};

/**
 * Check a parsed JSON value against the schema. Returns every problem rather
 * than the first, so a broken study can be fixed in one pass. The build fails
 * on any error: a study that does not validate never ships.
 */
export function validateCaseStudy(value: unknown, slug: string): string[] {
  const errors: string[] = [];
  if (!isObject(value)) return [`${slug}: must be a JSON object`];
  for (const key of ["title", "description", "techStack", "updated"]) {
    if (!isString(value[key])) errors.push(`${slug}.${key}: required`);
  }
  if (isString(value.updated) && Number.isNaN(Date.parse(value.updated))) errors.push(`${slug}.updated: must be an ISO date`);
  if (value.facts !== undefined) {
    if (!isArray(value.facts)) errors.push(`${slug}.facts: must be an array`);
    else value.facts.forEach((f, i) => {
      if (!isObject(f) || !isString(f.label) || !isString(f.value)) errors.push(`${slug}.facts[${i}]: needs label and value`);
    });
  }
  if (!isArray(value.blocks) || value.blocks.length === 0) {
    errors.push(`${slug}.blocks: needs at least one block`);
    return errors;
  }

  value.blocks.forEach((raw, i) => {
    const at = `${slug}.blocks[${i}]`;
    if (!isObject(raw)) return errors.push(`${at}: must be an object`);
    const type = raw.type as BlockType;
    if (!(type in REQUIRED)) return errors.push(`${at}.type: unknown block type "${String(raw.type)}"`);
    for (const key of REQUIRED[type]) if (!isString(raw[key])) errors.push(`${at}.${key}: required for ${type}`);

    switch (type) {
      case "flow":
        if (!isArray(raw.steps) || raw.steps.length < 2) errors.push(`${at}.steps: needs at least two system boundaries`);
        else raw.steps.forEach((step, j) => {
          if (!isObject(step) || !isString(step.label) || !isString(step.detail) || !isString(step.href)) {
            errors.push(`${at}.steps[${j}]: needs label, detail and implementation link`);
          } else if (!/^https:\/\//.test(step.href)) {
            errors.push(`${at}.steps[${j}].href: needs an HTTPS implementation link`);
          }
        });
        break;
      case "decision":
        if (!isArray(raw.options) || raw.options.length < 2) errors.push(`${at}.options: a decision weighs at least two options`);
        else {
          raw.options.forEach((o, j) => {
            if (!isObject(o) || !isString(o.label) || !isString(o.detail)) errors.push(`${at}.options[${j}]: needs label and detail`);
          });
          if (raw.options.filter((o) => isObject(o) && o.chosen === true).length !== 1) errors.push(`${at}.options: mark exactly one as chosen`);
        }
        break;
      case "metrics":
        if (!isArray(raw.items) || raw.items.length === 0) errors.push(`${at}.items: needs at least one metric`);
        else raw.items.forEach((m, j) => {
          if (!isObject(m) || !isString(m.label) || !isString(m.value)) errors.push(`${at}.items[${j}]: needs label and value`);
          else if (!isString(m.source)) errors.push(`${at}.items[${j}].source: every number names where it came from`);
        });
        break;
      case "media":
        if (!isArray(raw.items) || raw.items.length === 0) errors.push(`${at}.items: needs at least one item`);
        else raw.items.forEach((m, j) => checkMedia(m, `${at}.items[${j}]`, errors));
        break;
      case "beforeAfter":
        checkMedia(raw.before, `${at}.before`, errors);
        checkMedia(raw.after, `${at}.after`, errors);
        break;
      case "timeline":
        if (!isArray(raw.entries) || raw.entries.length === 0) errors.push(`${at}.entries: needs at least one entry`);
        else raw.entries.forEach((e, j) => {
          if (!isObject(e) || !isString(e.date) || !isString(e.title)) errors.push(`${at}.entries[${j}]: needs date and title`);
        });
        break;
      case "links":
        if (!isArray(raw.items) || raw.items.length === 0) errors.push(`${at}.items: needs at least one link`);
        else raw.items.forEach((l, j) => {
          if (!isObject(l) || !isString(l.label) || !isString(l.href)) errors.push(`${at}.items[${j}]: needs label and href`);
        });
        break;
    }
  });
  return errors;
}

/**
 * The study as plain Markdown, for readers that want text: llms.txt and the
 * projects API. Same content, flattened.
 */
export function caseStudyToMarkdown(study: StructuredCaseStudy): string {
  const out: string[] = [];
  const h = (text?: string) => text && out.push(`## ${text}`, "");
  for (const b of study.blocks) {
    switch (b.type) {
      case "flow":
        h(b.heading);
        b.steps.forEach((step, i) => out.push(`${i + 1}. **${step.label}:** ${step.detail} [Implementation](${step.href})`));
        out.push("", b.caption, "");
        break;
      case "prose":
        h(b.heading);
        out.push(b.body, "");
        break;
      case "decision":
        h(b.heading);
        out.push(b.context, "");
        for (const o of b.options) out.push(`- **${o.label}${o.chosen ? " (chosen)" : ""}:** ${o.detail}`);
        out.push("", b.outcome, "");
        break;
      case "tradeoff":
        h(b.heading);
        out.push(`- **Gave up:** ${b.gave}`, `- **Got:** ${b.got}`, "");
        break;
      case "failure":
        h(b.heading);
        out.push(`- **What happened:** ${b.what}`, `- **Why:** ${b.why}`, `- **Fix:** ${b.fix}`, "");
        break;
      case "metrics":
        h(b.heading);
        for (const m of b.items) out.push(`- **${m.label}:** ${m.value}${m.note ? ` (${m.note})` : ""}. Source: ${m.source}`);
        out.push("");
        break;
      case "media":
        for (const m of b.items) if (m.caption) out.push(`_${m.caption}_`, "");
        break;
      case "beforeAfter":
        if (b.caption) out.push(`_${b.caption}_`, "");
        break;
      case "code":
        out.push("```" + b.lang, b.code, "```", "");
        if (b.caption) out.push(`_${b.caption}_`, "");
        break;
      case "timeline":
        h(b.heading);
        for (const e of b.entries) out.push(`- **${e.date}, ${e.title}.**${e.body ? ` ${e.body}` : ""}`);
        out.push("");
        break;
      case "callout":
        out.push(`> ${b.body.replace(/\n/g, "\n> ")}`, "");
        break;
      case "links":
        h(b.heading);
        for (const l of b.items) out.push(`- [${l.label}](${l.href})`);
        out.push("");
        break;
    }
  }
  return out.join("\n").trim() + "\n";
}
