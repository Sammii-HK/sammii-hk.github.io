import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Gauge,
  Mail,
  Shield,
  Sparkles,
} from "lucide-react";
import { EMAIL } from "../../constants";

const diagnosticHref = `mailto:${EMAIL}?subject=${encodeURIComponent(
  "AI Workflow Diagnostic"
)}&body=${encodeURIComponent(
  "I want to map one repeated workflow.\n\nThe task I repeat:\n\nThe tools involved:\n\nHow often it happens:\n\nWhat finished should look like:\n\n"
)}`;

const sprintHref = `mailto:${EMAIL}?subject=${encodeURIComponent(
  "AI Ops Quick Fix Sprint"
)}&body=${encodeURIComponent(
  "I want to ask about the proof-first AI Ops Quick Fix beta.\n\nThe workflow:\n\nThe trigger:\n\nThe tools involved:\n\nThe output I need:\n\nWhat should never happen:\n\n"
)}`;

const buildExamples = [
  "Client intake to draft brief and task list.",
  "Inbox to daily action digest.",
  "Booking form to prep note and follow-up draft.",
  "Lead form to qualification summary and CRM log.",
  "Receipt or invoice screenshot to spreadsheet row.",
  "Content ideas to product and post queue.",
];

const sprintIncludes = [
  "One trigger.",
  "One to three actions.",
  "One AI step if it actually helps.",
  "Tested workflow.",
  "Short handoff doc.",
  "Loom walkthrough.",
  "7 days of small tweaks.",
];

const boundaries = [
  "No whole SaaS builds.",
  "No vague passive-income projects.",
  "No legal, medical, or financial advice automations.",
  "No open-ended support inside a fixed sprint.",
  "No customer messages sent without an approval checkpoint unless explicitly scoped.",
];

const flow = [
  {
    label: "1. Send the workflow",
    detail:
      "Send the repeated task, tools involved, how often it happens, and what a good output looks like.",
  },
  {
    label: "2. Map the smallest useful version",
    detail:
      "If it is fuzzy, start with the diagnostic. If it is clear, scope the sprint around one trigger and one to three actions.",
  },
  {
    label: "3. Build and hand off",
    detail:
      "You get the working setup, a test receipt, short documentation, and a Loom walkthrough.",
  },
];

export const metadata: Metadata = {
  title: "Proof-First AI Ops Quick Fix | sammii.dev",
  description:
    "A proof-first AI workflow beta for founders, creators, agencies, and small service businesses who need one repeated workflow mapped or fixed.",
  alternates: {
    canonical: "https://sammii.dev/ops/quick-fix",
  },
  openGraph: {
    title: "Proof-First AI Ops Quick Fix",
    description:
      "A beta for turning one annoying workflow into a working AI-assisted system: one trigger, one to three actions, tested and handed over.",
    type: "website",
    url: "https://sammii.dev/ops/quick-fix",
  },
  twitter: {
    card: "summary_large_image",
    title: "Proof-First AI Ops Quick Fix",
    description:
      "A narrow AI ops beta for replacing one repeated workflow with a working system.",
  },
};

export default function AiOpsQuickFixPage() {
  return (
    <main className="min-h-screen bg-neutral-50 text-black dark:bg-black dark:text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-8 md:px-10 md:py-10">
        <nav className="flex items-center justify-between gap-4 text-sm">
          <Link
            href="/ops/quick-check"
            className="inline-flex items-center gap-2 text-neutral-600 transition hover:text-black dark:text-neutral-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Quick check
          </Link>
          <Link
            href="/ops/starter"
            className="text-neutral-500 transition hover:text-black dark:text-neutral-500 dark:hover:text-white"
          >
            Starter pack
          </Link>
        </nav>

        <section className="grid gap-8 pt-4 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/50 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-800 dark:text-emerald-100">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Proof-first beta
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-normal md:text-6xl">
              AI Ops Quick Fix Sprint
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-700 dark:text-neutral-300 md:text-lg">
              I am testing a narrow workflow sprint while dogfooding the same system on my own products. The promise is deliberately small: one trigger, one to three actions, tested output, short documentation, and a Loom handoff.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a
                href={sprintHref}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 dark:bg-white dark:text-black dark:hover:bg-neutral-200 dark:focus-visible:ring-white dark:focus-visible:ring-offset-black"
              >
                Ask about the beta
                <Mail className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href={diagnosticHref}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-black/10 px-4 py-3 text-sm font-medium text-black transition hover:border-black/30 hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 dark:border-white/15 dark:text-white dark:hover:border-white/40 dark:hover:bg-white/10 dark:focus-visible:ring-white dark:focus-visible:ring-offset-black"
              >
                Start with diagnostic
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          <aside className="rounded-lg border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-neutral-500">
              Beta pricing
            </p>
            <div className="mt-4 grid gap-4">
              <div>
                <p className="text-3xl font-semibold">GBP 49</p>
                <p className="mt-2 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
                  Diagnostic: one workflow map, risk notes, first useful version, and a fixed-price build recommendation.
                </p>
              </div>
              <div className="border-t border-black/10 pt-4 dark:border-white/10">
                <p className="text-3xl font-semibold">GBP 349</p>
                <p className="mt-2 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
                  Beta sprint: one scoped workflow built, tested, documented, and handed over with small tweaks for 7 days.
                </p>
              </div>
            </div>
          </aside>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {flow.map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]"
            >
              <p className="text-sm font-semibold">{item.label}</p>
              <p className="mt-3 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
                {item.detail}
              </p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-lg border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <div className="mb-5 flex items-center gap-3">
              <Gauge className="h-5 w-5 text-neutral-500" aria-hidden="true" />
              <h2 className="text-xl font-semibold">Good workflow candidates</h2>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {buildExamples.map((item) => (
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
              <h2 className="text-xl font-semibold">Sprint includes</h2>
            </div>
            <ul className="space-y-3">
              {sprintIncludes.map((item) => (
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
            Boundaries
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {boundaries.map((item) => (
              <div
                key={item}
                className="rounded-lg border border-black/10 bg-neutral-50 p-4 text-sm leading-6 text-neutral-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-neutral-300"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-emerald-400/40 bg-emerald-500/10 p-6 text-emerald-950 dark:text-emerald-50">
          <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.12em]">
                First step
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                Send one repeated task and I will tell you if it is worth automating.
              </h2>
              <p className="mt-3 text-sm leading-6">
                The best fit is boring, repeated, and easy to verify. That is where the money is.
              </p>
            </div>
            <a
              href={diagnosticHref}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-950 focus-visible:ring-offset-2 dark:bg-white dark:text-emerald-950 dark:hover:bg-emerald-100 dark:focus-visible:ring-white dark:focus-visible:ring-offset-emerald-950"
            >
              Send workflow
              <Mail className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
