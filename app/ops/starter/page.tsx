import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CreditCard,
  Gauge,
  Shield,
  Sparkles,
} from "lucide-react";

const checkoutHref = "https://buy.stripe.com/4gM6oJ3x1c5u48Z2dk93y00";

const deliverables = [
  "Money-lane map for deciding what the machine should optimise first.",
  "LaunchAgent schedule templates for daily work, watchdogs, and weekly review.",
  "Approval boundary matrix for safe auto-execute, do-then-tell, and ask-first work.",
  "Receipt format for proving what shipped, what healed, what got blocked, and what paid off.",
  "Mini payoff scorecard for saved time, shipped assets, reach tests, and paid intent.",
  "Notification pruning rules so the system does not become another inbox.",
];

const proof = [
  "Built from a real Mac Mini operator stack with LaunchAgents, local LLMs, Codex lanes, memory, and receipts.",
  "Designed around solo founder constraints: low babysitting, visible output, and clear approval boundaries.",
  "Focused on money, reach, conversion, reviews, product health, and personal time back.",
];

const notIncluded = [
  "No open-ended implementation retainer.",
  "No public posting, payment changes, DB work, or deploy automation without approval.",
  "No fake passive-income promise. The point is a machine that does measurable work.",
];

export const metadata: Metadata = {
  title: "Local AI Business Ops Starter | sammii.dev",
  description:
    "A practical starter system for turning a Mac Mini, local LLMs, agents, schedules, and receipts into a useful solo-founder business operator.",
  alternates: {
    canonical: "https://sammii.dev/ops/starter",
  },
  openGraph: {
    title: "Local AI Business Ops Starter",
    description:
      "Turn a messy local AI setup into lanes, schedules, receipts, approval boundaries, and a payoff scorecard.",
    type: "website",
    url: "https://sammii.dev/ops/starter",
  },
  twitter: {
    card: "summary_large_image",
    title: "Local AI Business Ops Starter",
    description:
      "A paid starter for solo founders who want local AI to do measurable business work.",
  },
};

export default function LocalAiOpsStarterPage() {
  return (
    <main className="min-h-screen bg-neutral-50 text-black dark:bg-black dark:text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-8 md:px-10 md:py-10">
        <nav className="flex items-center justify-between gap-4 text-sm">
          <Link
            href="/ops"
            className="inline-flex items-center gap-2 text-neutral-600 transition hover:text-black dark:text-neutral-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            AI ops
          </Link>
          <Link
            href="/ops/quick-check"
            className="text-neutral-500 transition hover:text-black dark:text-neutral-500 dark:hover:text-white"
          >
            Quick check
          </Link>
        </nav>

        <section className="grid gap-8 pt-4 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/50 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-800 dark:text-emerald-100">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Stripe checkout live
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-normal md:text-6xl">
              Local AI Business Ops Starter
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-700 dark:text-neutral-300 md:text-lg">
              A practical starter system for turning a Mac Mini, local LLMs, agents, schedules, and receipts into a business operator that does measurable work while you are away.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a
                href={checkoutHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 dark:bg-white dark:text-black dark:hover:bg-neutral-200 dark:focus-visible:ring-white dark:focus-visible:ring-offset-black"
              >
                Buy starter pack
                <CreditCard className="h-4 w-4" aria-hidden="true" />
              </a>
              <Link
                href="/ops/quick-check?utm_source=starter&utm_medium=owned&utm_campaign=ops_money_path&utm_content=quick_check_secondary"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-black/10 px-4 py-3 text-sm font-medium text-black transition hover:border-black/30 hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 dark:border-white/15 dark:text-white dark:hover:border-white/40 dark:hover:bg-white/10 dark:focus-visible:ring-white dark:focus-visible:ring-offset-black"
              >
                Take the quick check
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <aside className="rounded-lg border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-neutral-500">
              Launch price
            </p>
            <p className="mt-2 text-4xl font-semibold">GBP 29</p>
            <p className="mt-3 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
              Stripe checkout is live. The customer ZIP, marketplace draft packets, and listing images are prepared; fulfilment goes to the checkout email while instant delivery is being wired.
            </p>
            <div className="mt-5 rounded-lg border border-emerald-400/40 bg-emerald-500/10 p-4 text-sm leading-6 text-emerald-900 dark:text-emerald-100">
              Money path: quick check to starter page to Stripe checkout. Gumroad or Lemon Squeezy can replace this later when file delivery credentials are available.
            </div>
          </aside>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-lg border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <div className="mb-5 flex items-center gap-3">
              <Gauge className="h-5 w-5 text-neutral-500" aria-hidden="true" />
              <h2 className="text-xl font-semibold">What is inside</h2>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {deliverables.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-black text-white dark:bg-white dark:text-black">
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <div className="mb-5 flex items-center gap-3">
              <Shield className="h-5 w-5 text-neutral-500" aria-hidden="true" />
              <h2 className="text-xl font-semibold">Boundaries</h2>
            </div>
            <ul className="space-y-3">
              {notIncluded.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-neutral-500" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="rounded-lg border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-neutral-500">
            Why this can sell
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {proof.map((item) => (
              <div
                key={item}
                className="rounded-lg border border-black/10 bg-neutral-50 p-4 text-sm leading-6 text-neutral-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-neutral-300"
              >
                {item}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
