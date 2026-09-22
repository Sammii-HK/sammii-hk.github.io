"use client";
import { useMemo, useState } from "react";

/**
 * Why they are still seeing the old version. A model of HTTP freshness as
 * the spec defines it: Cache-Control decides whether a stored response may
 * be used without asking, the validators decide what happens when it may
 * not, and the URL decides whether there is a stored response at all.
 */
type Cfg = { maxAge: number; immutable: boolean; noStore: boolean; noCache: boolean; mustRevalidate: boolean; swr: number; etag: boolean; hashed: boolean };
type Visit = { label: string; at: number; changed: boolean; hard?: boolean };
const VISITS: Visit[] = [
  { label: "First visit", at: 0, changed: false },
  { label: "Clicks through, 30 s later", at: 30, changed: false },
  { label: "Comes back half an hour later", at: 1800, changed: false },
  { label: "You deploy the fix, they reload", at: 1900, changed: true },
  { label: "They hard-reload (Cmd+Shift+R)", at: 1901, changed: true, hard: true },
  { label: "An hour after their first load", at: 3700, changed: true },
];
type Out = { kind: "memory" | "disk" | "revalidate-304" | "revalidate-200" | "full" | "stale-then-revalidate"; status: string; bytes: string; ms: number; why: string };

function outcome(c: Cfg, v: Visit, prev: { stored: boolean; storedAt: number; storedChanged: boolean }): Out {
  const size = 84; // KB of HTML or JS
  const rtt = 170; // one 4G round trip
  if (v.hard) return { kind: "full", status: "200", bytes: `${size} KB`, ms: rtt + 75, why: "A hard reload sends no-cache upstream and ignores every stored response, which is why it always fixes it for you and never for them." };
  if (c.noStore || !prev.stored) return { kind: "full", status: "200", bytes: `${size} KB`, ms: rtt + 75, why: c.noStore ? "no-store means nothing may be written to any cache, so every visit is a full download." : "Nothing stored yet, so a full request." };
  const age = v.at - prev.storedAt;
  const fresh = !c.noCache && age <= (c.hashed && c.immutable ? 31536000 : c.maxAge);
  if (fresh) {
    if (c.hashed && c.immutable) return { kind: "memory", status: "200 (memory cache)", bytes: "0", ms: 0, why: v.changed
      ? "immutable on a hashed URL: still served from cache at any age, and that is correct. The new build is a different filename, so the page requests THAT url fresh and this one is simply never asked for again."
      : "immutable on a hashed URL: the browser does not even check, at any age, because the name promises the bytes never change." };
    return { kind: age < 60 ? "memory" : "disk", status: `200 (${age < 60 ? "memory" : "disk"} cache)`, bytes: "0", ms: age < 60 ? 0 : 3, why: `Still fresh: ${age} s old against max-age=${c.maxAge}. No request leaves the machine, so a change on the server is invisible until it expires.` };
  }
  if (age > c.maxAge && c.swr > 0 && age <= c.maxAge + c.swr) {
    return { kind: "stale-then-revalidate", status: "200 (stale) then 304", bytes: "0 now", ms: 0, why: `Stale but inside stale-while-revalidate=${c.swr}: the stored copy is served instantly and refreshed in the background. The user sees the old version once, then the new one.` };
  }
  if (c.etag) {
    return v.changed
      ? { kind: "revalidate-200", status: "200", bytes: `${size} KB`, ms: rtt + 75, why: "Stale, so a conditional request with If-None-Match. The ETag no longer matches, so the server sends the new body." }
      : { kind: "revalidate-304", status: "304 Not Modified", bytes: "~0.3 KB", ms: rtt, why: "Stale, so a conditional request. The ETag matches, so the server sends an empty 304 and the browser reuses what it has: one round trip, no body." };
  }
  return { kind: "full", status: "200", bytes: `${size} KB`, ms: rtt + 75, why: "Stale and no validator, so the whole thing comes down again whether it changed or not." };
}

const PRESETS: { name: string; cfg: Cfg; note: string }[] = [
  { name: "The bug", cfg: { maxAge: 3600, immutable: false, noStore: false, noCache: false, mustRevalidate: false, swr: 0, etag: true, hashed: false }, note: "HTML with max-age=3600. You deploy the fix and nobody sees it for an hour. This is the single most common caching bug in production." },
  { name: "HTML, done right", cfg: { maxAge: 0, immutable: false, noStore: false, noCache: true, mustRevalidate: true, swr: 0, etag: true, hashed: false }, note: "no-cache, must-revalidate with an ETag: every visit asks, and almost every answer is an empty 304. One round trip for correctness." },
  { name: "Hashed asset", cfg: { maxAge: 31536000, immutable: true, noStore: false, noCache: false, mustRevalidate: false, swr: 0, etag: true, hashed: true }, note: "A hashed filename with max-age=31536000, immutable. Never revalidated, and a new build is a new URL, so it can never be stale. This is the whole point of build hashes." },
  { name: "Stale while revalidate", cfg: { maxAge: 60, immutable: false, noStore: false, noCache: false, mustRevalidate: false, swr: 86400, etag: true, hashed: false }, note: "Fresh for a minute, then served stale instantly while it refreshes behind the scenes. Fast for the user, one version behind for one visit." },
  { name: "no-store", cfg: { maxAge: 0, immutable: false, noStore: true, noCache: false, mustRevalidate: false, swr: 0, etag: false, hashed: false }, note: "Nothing is stored anywhere. Correct for a bank statement, an expensive mistake for anything else." },
];

export function Caching() {
  const [pi, setPi] = useState(0);
  const c = PRESETS[pi].cfg;
  const header = useMemo(() => {
    const parts: string[] = [];
    if (c.noStore) parts.push("no-store");
    else {
      if (c.noCache) parts.push("no-cache"); else parts.push(`max-age=${c.maxAge}`);
      if (c.mustRevalidate) parts.push("must-revalidate");
      if (c.immutable) parts.push("immutable");
      if (c.swr) parts.push(`stale-while-revalidate=${c.swr}`);
    }
    return parts.join(", ");
  }, [c]);
  const rows = useMemo(() => {
    const DEPLOY = 1900;
    // track WHICH version the stored copy is, not just whether there was a hit:
    // a hard reload mid-way stores the new build, so later cache hits are correct
    let prev = { stored: false, storedAt: 0, storedChanged: false, storedNew: false };
    return VISITS.map((v) => {
      const o = outcome(c, v, prev);
      const hit = o.kind === "memory" || o.kind === "disk";
      const served = c.hashed ? true : hit || o.kind === "revalidate-304" || o.kind === "stale-then-revalidate" ? prev.storedNew : v.at >= DEPLOY;
      if (!c.noStore && (o.kind === "full" || o.kind === "revalidate-200")) prev = { stored: true, storedAt: v.at, storedChanged: v.changed, storedNew: v.at >= DEPLOY };
      else if (!c.noStore && (o.kind === "revalidate-304" || o.kind === "stale-then-revalidate")) prev = { ...prev, stored: true, storedAt: v.at, storedNew: o.kind === "stale-then-revalidate" ? v.at >= DEPLOY : prev.storedNew };
      return { v, o, seesFix: v.at >= DEPLOY ? served : null };
    });
  }, [c]);
  const maxMs = Math.max(1, ...rows.map((r) => r.o.ms));

  return (
    <div className="ca">
      <div className="ca-presets" role="tablist" aria-label="Header preset">
        {PRESETS.map((p, n) => <button key={p.name} role="tab" type="button" aria-selected={n === pi} className={`gg-cmd ${n === pi ? "is-on" : ""}`} onClick={() => setPi(n)}><span>{n + 1}</span><code>{p.name}</code></button>)}
      </div>
      <div className="ca-headers">
        <code className="ca-h"><b>Cache-Control:</b> {header}</code>
        {c.etag && <code className="ca-h"><b>ETag:</b> &quot;a3f1c9&quot;</code>}
        <code className="ca-h"><b>URL:</b> {c.hashed ? "/app.4f2a9c.js" : "/index.html"}</code>
      </div>
      <p className="gg-what">{PRESETS[pi].note}</p>

      <table className="ca-table">
        <thead><tr><th>Visit</th><th>What the browser does</th><th>Status</th><th>Transferred</th><th>Time</th></tr></thead>
        <tbody>
          {rows.map(({ v, o, seesFix }) => (
            <tr key={v.label} className={`is-${o.kind}${v.at === 1900 ? " is-deploy" : ""}`}>
              <th scope="row">{v.label}{v.at === 1900 && <em>the fix is live on the server</em>}</th>
              <td className="ca-why">{o.why}{seesFix !== null && <b className={seesFix ? "ca-yes" : "ca-no"}>{seesFix ? (c.hashed ? "They see the fix: the new build is a new URL." : "They see the fix.") : "They still see the old version."}</b>}</td>
              <td className="ca-mono">{o.status}</td>
              <td className="ca-mono">{o.bytes}</td>
              <td><span className="ca-bar"><i style={{ width: `${(o.ms / maxMs) * 100}%` }} /></span><span className="ca-mono">{o.ms} ms</span></td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="jd-note">Times assume one 4G round trip of 170 ms and 75 ms to send 84 KB, the same model as chart 11. What matters is the shape: a fresh hit costs nothing and can be wrong, a 304 costs one round trip and is always right, a full response costs both.</p>
    </div>
  );
}
