import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  ExternalLink,
  Route,
  Shield,
  Store,
  Target,
} from "lucide-react";
import { getPersonaHub, personaHubs } from "../common/data/persona-hubs";

type Props = { params: Promise<{ hub: string }> };

const accentBySlug: Record<string, string> = {
  ops: "border-emerald-400/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200",
  stardust: "border-violet-400/50 bg-violet-500/10 text-violet-700 dark:text-violet-200",
  seer: "border-rose-400/50 bg-rose-500/10 text-rose-700 dark:text-rose-200",
  crystals: "border-cyan-400/50 bg-cyan-500/10 text-cyan-700 dark:text-cyan-200",
  studio: "border-amber-400/50 bg-amber-500/10 text-amber-700 dark:text-amber-200",
  softly: "border-pink-400/50 bg-pink-500/10 text-pink-700 dark:text-pink-200",
  cast: "border-blue-400/50 bg-blue-500/10 text-blue-700 dark:text-blue-200",
  systems: "border-lime-400/50 bg-lime-500/10 text-lime-700 dark:text-lime-200",
};

export const dynamicParams = false;

export function generateStaticParams() {
  return personaHubs.map((hub) => ({ hub: hub.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { hub: slug } = await params;
  const hub = getPersonaHub(slug);
  if (!hub) return {};

  const url = `https://sammii.dev/${hub.slug}`;

  return {
    title: `${hub.title} | sammii.dev`,
    description: hub.summary,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${hub.title} | sammii.dev`,
      description: hub.summary,
      type: "website",
      url,
    },
    twitter: {
      card: "summary_large_image",
      title: `${hub.title} | sammii.dev`,
      description: hub.summary,
    },
  };
}

function CtaLink({
  href,
  label,
  variant,
}: {
  href: string;
  label: string;
  variant: "primary" | "secondary";
}) {
  const isExternal = href.startsWith("http");
  const className =
    variant === "primary"
      ? "inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 dark:bg-white dark:text-black dark:hover:bg-neutral-200 dark:focus-visible:ring-white dark:focus-visible:ring-offset-black"
      : "inline-flex items-center justify-center gap-2 rounded-lg border border-black/10 px-4 py-3 text-sm font-medium text-black transition hover:border-black/30 hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 dark:border-white/15 dark:text-white dark:hover:border-white/40 dark:hover:bg-white/10 dark:focus-visible:ring-white dark:focus-visible:ring-offset-black";

  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {label}
        <ExternalLink className="h-4 w-4" aria-hidden="true" />
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {label}
      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
    </Link>
  );
}

export default async function PersonaHubPage({ params }: Props) {
  const { hub: slug } = await params;
  const hub = getPersonaHub(slug);
  if (!hub) notFound();

  const accentClass = accentBySlug[hub.slug] ?? accentBySlug.systems;

  return (
    <main className="min-h-screen bg-neutral-50 text-black dark:bg-black dark:text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-8 md:px-10 md:py-10">
        <nav className="flex items-center justify-between gap-4 text-sm">
          <Link
            href="/links"
            className="inline-flex items-center gap-2 text-neutral-600 transition hover:text-black dark:text-neutral-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Links
          </Link>
          <Link
            href="/"
            className="text-neutral-500 transition hover:text-black dark:text-neutral-500 dark:hover:text-white"
          >
            sammii.dev
          </Link>
        </nav>

        <section className="grid gap-8 pt-4 md:grid-cols-[1.1fr_0.9fr] md:items-end md:pt-10">
          <div className="max-w-3xl">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${accentClass}`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
                {hub.status}
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                {hub.label}
              </span>
            </div>

            <p className="mb-3 text-sm font-medium text-neutral-500 dark:text-neutral-400">
              {hub.eyebrow}
            </p>
            <h1 className="max-w-3xl text-4xl font-bold tracking-normal md:text-6xl">
              {hub.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-700 dark:text-neutral-300 md:text-lg">
              {hub.summary}
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <CtaLink
                href={hub.primaryCta.href}
                label={hub.primaryCta.label}
                variant="primary"
              />
              {hub.secondaryCta && (
                <CtaLink
                  href={hub.secondaryCta.href}
                  label={hub.secondaryCta.label}
                  variant="secondary"
                />
              )}
            </div>
          </div>

          <aside className="rounded-lg border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex items-start gap-3">
              <Target className="mt-1 h-5 w-5 text-neutral-500" aria-hidden="true" />
              <div>
                <h2 className="text-sm font-semibold">Who this is for</h2>
                <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                  {hub.audience}
                </p>
              </div>
            </div>
            <div className="mt-5 border-t border-black/10 pt-5 dark:border-white/10">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-neutral-500">
                Proof asset
              </p>
              <p className="mt-2 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
                {hub.trustAsset}
              </p>
            </div>
          </aside>
        </section>

        <section id="products">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-neutral-500">
                Product shelf
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                {hub.label} products
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-neutral-600 dark:text-neutral-400">
              One owned persona hub can hold free samples, validation products, draft products, and later offers without scattering the funnel.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {hub.products.map((product) => (
              <article
                key={product.name}
                className="rounded-lg border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]"
              >
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${accentClass}`}>
                    {product.stage}
                  </span>
                  <span className="rounded-full border border-black/10 px-2.5 py-1 text-xs text-neutral-600 dark:border-white/10 dark:text-neutral-300">
                    {product.format}
                  </span>
                </div>
                <h3 className="text-xl font-semibold">{product.name}</h3>
                <p className="mt-2 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  {product.priceBand}
                </p>
                <p className="mt-3 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
                  {product.purpose}
                </p>
                <div className="mt-4 border-t border-black/10 pt-4 dark:border-white/10">
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-neutral-500">
                    Route
                  </p>
                  <p className="mt-2 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
                    {product.route}
                  </p>
                </div>
                {product.href && (
                  <Link
                    href={product.href}
                    className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg border border-black/10 px-3 py-2 text-sm font-medium text-black transition hover:border-black/30 hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 dark:border-white/15 dark:text-white dark:hover:border-white/40 dark:hover:bg-white/10 dark:focus-visible:ring-white dark:focus-visible:ring-offset-black"
                  >
                    Open product
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                )}
              </article>
            ))}
          </div>
          <div className="mt-4 rounded-lg border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-neutral-500">
              Hub success signal
            </p>
            <p className="mt-2 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
              {hub.proofMetric}
            </p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-lg border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-white/[0.04]">
            <div className="mb-5 flex items-center gap-3">
              <Store className="h-5 w-5 text-neutral-500" aria-hidden="true" />
              <h2 className="text-xl font-semibold">Distribution shelves</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {hub.shelves.map((shelf) => (
                <span
                  key={shelf}
                  className="rounded-full border border-black/10 px-3 py-1.5 text-sm text-neutral-700 dark:border-white/10 dark:text-neutral-300"
                >
                  {shelf}
                </span>
              ))}
            </div>
            <p className="mt-5 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
              {hub.checkoutDirection}
            </p>
          </div>

          <div className="rounded-lg border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-white/[0.04]">
            <div className="mb-5 flex items-center gap-3">
              <Route className="h-5 w-5 text-neutral-500" aria-hidden="true" />
              <h2 className="text-xl font-semibold">Traffic routes</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-neutral-500">
                  Channels
                </p>
                <ul className="mt-3 space-y-2">
                  {hub.channels.map((channel) => (
                    <li key={channel} className="flex gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-neutral-500" aria-hidden="true" />
                      {channel}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-neutral-500">
                  Routes back
                </p>
                <ul className="mt-3 space-y-2">
                  {hub.routesBack.map((route) => (
                    <li key={route} className="flex gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-neutral-500" aria-hidden="true" />
                      {route}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-lg border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-white/[0.04]">
            <h2 className="text-xl font-semibold">Build next</h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {hub.nextMoves.map((move) => (
                <li key={move} className="flex gap-3 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-black text-white dark:bg-white dark:text-black">
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  {move}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-white/[0.04]">
            <div className="mb-4 flex items-center gap-3">
              <Shield className="h-5 w-5 text-neutral-500" aria-hidden="true" />
              <h2 className="text-xl font-semibold">Boundary</h2>
            </div>
            <p className="text-sm leading-6 text-neutral-700 dark:text-neutral-300">
              {hub.supportBoundary}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
