"use client";

import { useEffect, useRef, useState } from "react";
import { getExploration } from "./registry";
import "./explorations.css";

/** The same runtime serves standalone pages and article embeds. */
export function ExplorationStage({ slug, compact = false }: { slug: string; compact?: boolean }) {
  const exploration = getExploration(slug);
  const frame = useRef<HTMLIFrameElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(860);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [attempt, setAttempt] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [fullscreenAvailable, setFullscreenAvailable] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setFullscreenAvailable(Boolean(document.fullscreenEnabled));
    const changed = () => setFullscreen(document.fullscreenElement === stage.current);
    document.addEventListener("fullscreenchange", changed);
    return () => document.removeEventListener("fullscreenchange", changed);
  }, []);

  useEffect(() => {
    setStatus("loading");
    const timeout = window.setTimeout(() => setStatus((current) => current === "loading" ? "error" : current), 20000);
    const receive = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow) return;
      if (!event.data || event.data.slug !== slug) return;
      if (event.data.type === "exploration:resize" && Number.isFinite(event.data.height)) {
        setHeight(Math.max(420, Math.min(4600, Math.ceil(event.data.height))));
      }
      if (event.data.type === "exploration:ready") { window.clearTimeout(timeout); setStatus("ready"); }
      if (event.data.type === "exploration:error") { window.clearTimeout(timeout); setStatus("error"); }
    };
    window.addEventListener("message", receive);
    // A server-rendered iframe may finish before hydration attaches onLoad.
    // Register the receiver first, then ask the current document to replay its
    // actual state. The load handler covers the opposite, still-loading case.
    frame.current?.contentWindow?.postMessage({ type: "exploration:measure" }, window.location.origin);
    return () => { window.clearTimeout(timeout); window.removeEventListener("message", receive); };
  }, [slug, attempt]);

  if (!exploration) return <p>This exploration could not be found.</p>;

  async function toggleFullscreen() {
    setNotice("");
    try {
      if (document.fullscreenElement === stage.current) await document.exitFullscreen();
      else await stage.current?.requestFullscreen();
    } catch {
      setNotice("Full screen is unavailable in this browser. You can continue here.");
    }
  }

  return (
    <section className={`exploration-stage-section${compact ? " exploration-stage-compact" : ""}`} aria-label={`${exploration.title}: interactive model`}>
      <div className="exploration-stage" ref={stage}>
        <div className="exploration-stage-bar">
          <p><span className="exploration-live-dot" aria-hidden="true" />Try it yourself</p>
          <div>
            {!compact && <a href="#exploration-instructions">How to explore</a>}
            {fullscreenAvailable && <button type="button" onClick={toggleFullscreen}>{fullscreen ? "Leave full screen" : "Full screen"}</button>}
          </div>
        </div>
        {status === "loading" && <p className="exploration-loading" role="status">Preparing the visualisation…</p>}
        {status === "error" && (
          <div className="exploration-fallback" role="alert">
            <h2>The interactive view could not start.</h2>
            <p>The explanation and sources below are still available.</p>
            <button type="button" onClick={() => setAttempt((n) => n + 1)}>Try loading again</button>
          </div>
        )}
        <iframe
          key={`${slug}-${attempt}`}
          ref={frame}
          src={`/exploration-runtime/${slug}/index.html${attempt ? `?retry=${attempt}` : ""}`}
          title={`${exploration.title}: controls and visualisation`}
          height={height}
          className="exploration-frame"
          allow="fullscreen"
          onLoad={() => frame.current?.contentWindow?.postMessage({ type: "exploration:measure" }, window.location.origin)}
          onError={() => setStatus("error")}
          style={{ display: status === "error" ? "none" : "block" }}
        />
        {notice && <p className="exploration-stage-notice" role="status">{notice}</p>}
        <noscript><p className="exploration-stage-notice">JavaScript is needed for the interactive controls. The explanation, model limits and sources are available below.</p></noscript>
      </div>
      <p className="exploration-stage-caption">{exploration.caption}</p>
    </section>
  );
}
