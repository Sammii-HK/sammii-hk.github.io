"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import data from "../../../labs/charts/communication/data.json";

/**
 * Six centuries of communication and type as one spine. Inventions sit on
 * the left of the spine, type styles and movements on the right, so the
 * two histories read against each other: the telegraph beside the
 * grotesques, the mobile phone beside Bell Centennial. Scroll is the time
 * axis (a scrolled page is the X clip); the year scrub jumps.
 */
type Item = { title: string; year: number; category: "invention" | "typography" | "movement"; content: string };
const ITEMS = (data as Item[]).slice().sort((a, b) => a.year - b.year);
const SIDE: Record<Item["category"], "left" | "right"> = { invention: "left", typography: "right", movement: "right" };
const LABEL: Record<Item["category"], string> = { invention: "Invention", typography: "Typeface", movement: "Type style" };
const CENTURIES = [1400, 1500, 1600, 1700, 1800, 1900, 2000];

export function CommunicationTimeline() {
  const [open, setOpen] = useState<number | null>(null);
  const [filter, setFilter] = useState<"all" | "left" | "right">("all");
  const refs = useRef<(HTMLLIElement | null)[]>([]);
  const [current, setCurrent] = useState(ITEMS[0].year);

  // the year in the sticky bar follows the entry nearest the middle of the viewport
  useEffect(() => {
    const els = refs.current.filter(Boolean) as HTMLLIElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setCurrent(Number((hit.target as HTMLElement).dataset.year));
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [filter]);

  // ?play=1 scrolls the whole spine over ~8s for the video lane
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("play") !== "1") return;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const t0 = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / 8000);
      window.scrollTo(0, total * (k < 0.5 ? 2 * k * k : -1 + (4 - 2 * k) * k));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  const shown = useMemo(() => ITEMS.filter((i) => filter === "all" || SIDE[i.category] === filter), [filter]);
  const jump = (year: number) => {
    const i = shown.findIndex((x) => x.year >= year);
    refs.current[Math.max(0, i)]?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="ct">
      <div className="ct-bar">
        <output className="ct-year" aria-live="polite">{current}</output>
        <nav className="ct-centuries" aria-label="Jump to a century">
          {CENTURIES.map((c) => (
            <button key={c} type="button" onClick={() => jump(c)}>{c}s</button>
          ))}
        </nav>
        <div className="ct-filter" role="group" aria-label="Show">
          {(["all", "left", "right"] as const).map((f) => (
            <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}>
              {f === "all" ? "Both" : f === "left" ? "Inventions" : "Type"}
            </button>
          ))}
        </div>
      </div>
      <ol className="ct-spine" data-filter={filter}>
        {shown.map((it, i) => {
          const side = filter === "all" ? SIDE[it.category] : "right";
          const isOpen = open === i;
          const gap = i > 0 ? it.year - shown[i - 1].year : 0;
          return (
            <li key={`${it.year}-${it.title}`} ref={(el) => { refs.current[i] = el; }} data-year={it.year} className={`ct-item is-${side}${isOpen ? " is-open" : ""}`} style={{ marginTop: gap > 40 ? `${Math.min(6, gap / 20)}rem` : undefined }}>
              {gap > 40 && <span className="ct-gap" aria-hidden="true">{gap} years</span>}
              <span className="ct-dot" aria-hidden="true" />
              <article className="ct-card">
                <button type="button" className="ct-card-head" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : i)}>
                  <span className="ct-card-kicker">{it.year} · {LABEL[it.category]}</span>
                  <span className="ct-card-title">{it.title}</span>
                </button>
                <p className={`ct-card-body${isOpen ? "" : " is-clamped"}`}>{it.content}</p>
              </article>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
