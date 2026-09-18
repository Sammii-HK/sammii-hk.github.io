import type { Lens } from "../common/data/projects";
import { DEFAULT_LENS, parseLens, lensHref } from "./lenses";

/**
 * Pure helpers for the committed-lens state machine, so the URL contract can
 * be unit-tested without a browser. The provider (app/src/components/lens)
 * is the only place that touches window/history.
 *
 *   committed  = the selected lens, URL-addressable (/, /?focus=ai, /?focus=product)
 *   preview    = transient hover/focus lens, never written to the URL
 *   display    = preview ?? committed
 */

export function lensFromSearch(search: string): Lens {
  const params = new URLSearchParams(search.startsWith("?") ? search : `?${search}`);
  return parseLens(params.get("focus"));
}

/** The URL to push when committing. Design is canonical: "/" with no query. Other params are preserved. */
export function urlForLens(lens: Lens, current: { pathname: string; search: string }): string {
  const params = new URLSearchParams(current.search);
  params.delete("focus");
  const canonical = lensHref(lens, current.pathname);
  const rest = params.toString();
  if (!rest) return canonical;
  return canonical.includes("?") ? `${canonical}&${rest}` : `${canonical}?${rest}`;
}

export function displayLens(preview: Lens | null, committed: Lens): Lens {
  return preview ?? committed;
}

export { DEFAULT_LENS };
