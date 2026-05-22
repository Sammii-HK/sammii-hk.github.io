"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Mail, RefreshCw } from "lucide-react";
import { EMAIL } from "../../constants";

type Option = {
  label: string;
  detail: string;
  points: number;
};

type Question = {
  id: string;
  label: string;
  options: Option[];
};

const questions: Question[] = [
  {
    id: "money",
    label: "Is your local AI setup attached to a money or reach outcome?",
    options: [
      {
        label: "Yes, with a named KPI",
        detail: "It knows whether it should move reach, leads, conversions, revenue, support, or product quality.",
        points: 2,
      },
      {
        label: "Sort of",
        detail: "It produces useful things, but the business outcome is implied rather than measured.",
        points: 1,
      },
      {
        label: "No",
        detail: "It mostly chats, drafts, researches, or creates review queues.",
        points: 0,
      },
    ],
  },
  {
    id: "afk",
    label: "Does it complete useful work while you are away?",
    options: [
      {
        label: "Yes, daily",
        detail: "It prepares assets, fixes safe issues, writes receipts, or advances a business lane without babysitting.",
        points: 2,
      },
      {
        label: "Sometimes",
        detail: "It can run jobs, but it still needs frequent manual steering or approval.",
        points: 1,
      },
      {
        label: "No",
        detail: "It waits for prompts, gets stuck, or needs you to interpret every output.",
        points: 0,
      },
    ],
  },
  {
    id: "receipts",
    label: "Can you see what it did and whether it mattered?",
    options: [
      {
        label: "Yes, in one place",
        detail: "There is a digest, scorecard, or operator board with fresh receipts and clear next actions.",
        points: 2,
      },
      {
        label: "Partly",
        detail: "Logs exist, but you still have to inspect them manually.",
        points: 1,
      },
      {
        label: "No",
        detail: "You only know something happened when notifications pile up or something breaks.",
        points: 0,
      },
    ],
  },
  {
    id: "noise",
    label: "Does it protect your attention?",
    options: [
      {
        label: "Yes",
        detail: "It batches low-risk updates, escalates only real blockers, and self-heals safe stale work.",
        points: 2,
      },
      {
        label: "Mixed",
        detail: "Some alerts are useful, but too many still arrive as walls of text.",
        points: 1,
      },
      {
        label: "No",
        detail: "The system creates a second job: reading, approving, and triaging its output.",
        points: 0,
      },
    ],
  },
  {
    id: "boundaries",
    label: "Does it know what it must not do?",
    options: [
      {
        label: "Yes",
        detail: "Public actions, payments, store changes, emails, DB work, and deploys are clearly separated.",
        points: 2,
      },
      {
        label: "Somewhat",
        detail: "There are rules, but they are scattered across prompts, docs, and memory.",
        points: 1,
      },
      {
        label: "No",
        detail: "It either does too little because it is scared, or too much because boundaries are unclear.",
        points: 0,
      },
    ],
  },
];

function getResult(score: number) {
  if (score >= 8) {
    return {
      title: "Business machine",
      summary:
        "Your setup is close. The next win is proving which lane pays for itself first, then turning that pattern into a repeatable offer.",
      next: "Add a weekly payoff scorecard, track one revenue or reach lane, and make the first public proof asset.",
    };
  }

  if (score >= 4) {
    return {
      title: "Partial operator",
      summary:
        "The pieces exist, but the machine is probably doing too much research and not enough measured execution.",
      next: "Pick one money lane, one safe auto-execute action, one approval boundary, and one visible receipt.",
    };
  }

  return {
    title: "Expensive assistant",
    summary:
      "The setup is probably impressive, but it is not yet earning its keep. The fix is operating design, not another model.",
    next: "Start with lanes, schedules, receipts, escalation rules, and one low-risk daily action that removes work from you.",
  };
}

export function QuickCheck() {
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const answeredCount = Object.keys(answers).length;
  const score = useMemo(
    () => Object.values(answers).reduce((total, points) => total + points, 0),
    [answers]
  );
  const result = getResult(score);
  const complete = answeredCount === questions.length;
  const scoreLabel = `${score}/10`;

  const emailHref = useMemo(() => {
    const subject = encodeURIComponent(`Local AI ops quick check: ${scoreLabel}`);
    const body = encodeURIComponent(
      `My Local AI Business Ops Quick Check score is ${scoreLabel}.\n\nResult: ${result.title}\n\nI want to know what to fix first.`
    );
    return `mailto:${EMAIL}?subject=${subject}&body=${body}`;
  }, [result.title, scoreLabel]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <section className="rounded-lg border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] md:p-6">
        <div className="flex flex-col gap-3 border-b border-black/10 pb-5 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-neutral-500">
              Free diagnostic
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal md:text-5xl">
              Is your local AI setup earning its keep?
            </h1>
          </div>
          <div className="rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-emerald-800 dark:text-emerald-100">
            <p className="text-xs font-medium uppercase tracking-[0.12em]">Score</p>
            <p className="mt-1 text-2xl font-semibold">{scoreLabel}</p>
          </div>
        </div>

        <div className="mt-6 space-y-5">
          {questions.map((question, index) => (
            <fieldset
              key={question.id}
              className="rounded-lg border border-black/10 p-4 dark:border-white/10"
            >
              <legend className="px-1 text-sm font-semibold">
                {index + 1}. {question.label}
              </legend>
              <div className="mt-4 grid gap-2">
                {question.options.map((option) => {
                  const selected = answers[question.id] === option.points;
                  return (
                    <button
                      key={`${question.id}-${option.points}`}
                      type="button"
                      aria-pressed={selected}
                      onClick={() =>
                        setAnswers((current) => ({
                          ...current,
                          [question.id]: option.points,
                        }))
                      }
                      className={`flex min-h-20 w-full items-start gap-3 rounded-lg border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 dark:focus-visible:ring-white dark:focus-visible:ring-offset-black ${
                        selected
                          ? "border-emerald-500 bg-emerald-500/10"
                          : "border-black/10 hover:border-black/25 hover:bg-black/[0.03] dark:border-white/10 dark:hover:border-white/30 dark:hover:bg-white/[0.06]"
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                          selected
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-black/20 dark:border-white/20"
                        }`}
                      >
                        {selected && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                      </span>
                      <span>
                        <span className="block text-sm font-medium">{option.label}</span>
                        <span className="mt-1 block text-sm leading-6 text-neutral-600 dark:text-neutral-400">
                          {option.detail}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>
      </section>

      <aside className="flex flex-col gap-4">
        <section className="rounded-lg border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-neutral-500">
            Result
          </p>
          <h2 className="mt-2 text-2xl font-semibold">{complete ? result.title : "Answer all 5 checks"}</h2>
          <p className="mt-3 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
            {complete
              ? result.summary
              : "This gives you a quick read on whether your Mini, local LLMs, and agents are actually reducing work or just looking busy."}
          </p>
          <div className="mt-5 rounded-lg border border-black/10 bg-neutral-50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-neutral-500">
              Fix first
            </p>
            <p className="mt-2 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
              {complete
                ? result.next
                : "Attach one lane to money, make it run while you are away, and force it to write a receipt you can trust."}
            </p>
          </div>
        </section>

        <section className="rounded-lg border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-neutral-500">
            Next step
          </p>
          <h2 className="mt-2 text-xl font-semibold">Turn the score into a system</h2>
          <p className="mt-3 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
            The paid starter turns this diagnosis into lanes, LaunchAgent schedules, approval boundaries, daily receipts, and a payoff scorecard.
          </p>
          <div className="mt-5 grid gap-2">
            <Link
              href="/ops/starter?utm_source=quick_check&utm_medium=owned&utm_campaign=ops_money_path&utm_content=starter_cta"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 dark:bg-white dark:text-black dark:hover:bg-neutral-200 dark:focus-visible:ring-white dark:focus-visible:ring-offset-black"
            >
              See the starter
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <a
              href={emailHref}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-black/10 px-4 py-3 text-sm font-medium text-black transition hover:border-black/30 hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 dark:border-white/15 dark:text-white dark:hover:border-white/40 dark:hover:bg-white/10 dark:focus-visible:ring-white dark:focus-visible:ring-offset-black"
            >
              Send me this score
              <Mail className="h-4 w-4" aria-hidden="true" />
            </a>
            <button
              type="button"
              onClick={() => setAnswers({})}
              className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-neutral-600 transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 dark:text-neutral-300 dark:hover:bg-white/10 dark:focus-visible:ring-white dark:focus-visible:ring-offset-black"
            >
              Reset
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </section>
      </aside>
    </div>
  );
}
