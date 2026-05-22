import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { QuickCheck } from "./QuickCheck";

export const metadata: Metadata = {
  title: "Local AI Business Ops Quick Check | sammii.dev",
  description:
    "A free diagnostic for solo founders who want to know whether their local AI setup is doing measurable business work or just creating noise.",
  alternates: {
    canonical: "https://sammii.dev/ops/quick-check",
  },
  openGraph: {
    title: "Local AI Business Ops Quick Check",
    description:
      "Score whether your Mac Mini, local LLMs, agents, and automations are actually earning their keep.",
    type: "website",
    url: "https://sammii.dev/ops/quick-check",
  },
  twitter: {
    card: "summary_large_image",
    title: "Local AI Business Ops Quick Check",
    description:
      "A free diagnostic for turning impressive AI tooling into a useful business operator.",
  },
};

export default function LocalAiOpsQuickCheckPage() {
  return (
    <main className="min-h-screen bg-neutral-50 text-black dark:bg-black dark:text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-8 md:px-10 md:py-10">
        <nav className="flex items-center justify-between gap-4 text-sm">
          <Link
            href="/ops"
            className="inline-flex items-center gap-2 text-neutral-600 transition hover:text-black dark:text-neutral-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            AI ops
          </Link>
          <Link
            href="/links"
            className="text-neutral-500 transition hover:text-black dark:text-neutral-500 dark:hover:text-white"
          >
            Persona hubs
          </Link>
        </nav>

        <QuickCheck />
      </div>
    </main>
  );
}
