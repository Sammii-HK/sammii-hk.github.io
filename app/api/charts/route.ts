import { NextResponse } from 'next/server';
import { CHARTS, chartHref } from '../../labs/charts/registry';
import { FACTS } from '../../labs/charts/facts';

export const revalidate = 600;

/**
 * GET /api/charts: the charts with their intro blurb and their follow-up
 * facts (each naming a ?focus= the page can open). The video lane and the
 * writers read this, so the site is the single source of truth for what
 * gets said about a chart.
 */
export async function GET() {
  return NextResponse.json(
    { charts: CHARTS.map((c) => ({ ...c, url: chartHref(c.slug), facts: FACTS[c.slug] ?? [] })), generatedAt: new Date().toISOString() },
    { headers: { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=86400' } },
  );
}
