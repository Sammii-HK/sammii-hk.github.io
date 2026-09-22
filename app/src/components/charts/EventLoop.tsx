"use client";
import { useEffect, useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";

/**
 * The event loop as a stepper. Three real snippets, each run through a
 * small model of the loop: a task queue, a microtask queue that drains
 * before the next task, requestAnimationFrame callbacks that run in the
 * render step, and the render step itself between tasks. The log on the
 * right is the order the browser prints; the model's rules are the spec's.
 */
type Kind = "task" | "micro" | "raf" | "render";
type Step = { n: number; kind: Kind; label: string; stack: string[]; micro: string[]; tasks: string[]; rafs: string[]; log: string[] };

type Snippet = { id: string; title: string; code: string; program: (api: Api) => void; lesson: string };
type Api = { log: (s: string) => void; setTimeout: (label: string, fn?: () => void) => void; promise: (label: string, fn?: () => void) => void; raf: (label: string, fn?: () => void) => void; queueMicrotask: (label: string, fn?: () => void) => void };

const SNIPPETS: Snippet[] = [
  {
    id: "classic",
    title: "The classic",
    code: `console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');`,
    program: ({ log, setTimeout, promise }) => { log("1"); setTimeout("2"); promise("3"); log("4"); },
    lesson: "The script is one task. Microtasks (the promise) drain the moment that task's stack empties, before any other task, so 3 prints before the setTimeout's 2 even at 0 ms.",
  },
  {
    id: "starve",
    title: "Microtasks starve the loop",
    code: `setTimeout(() => console.log('timeout'), 0);
requestAnimationFrame(() => console.log('frame'));
Promise.resolve()
  .then(() => console.log('a'))
  .then(() => console.log('b'));
queueMicrotask(() => console.log('c'));`,
    program: ({ setTimeout, raf, promise, queueMicrotask }) => { setTimeout("timeout"); raf("frame"); promise("a", () => promise("b")); queueMicrotask("c"); },
    lesson: "Microtasks queued while draining join the same drain: a runs first and queues b behind c, so the console reads a, c, b. Only when the microtask queue is empty does the loop take the next task (the 0 ms timeout, which is due long before the next frame), and only at the next frame does the rAF callback print frame.",
  },
  {
    id: "raf",
    title: "rAF is not a task",
    code: `requestAnimationFrame(() => {
  console.log('frame 1');
  requestAnimationFrame(() => console.log('frame 2'));
});
setTimeout(() => console.log('timeout'), 0);`,
    program: ({ raf, setTimeout }) => { raf("frame 1", () => raf("frame 2")); setTimeout("timeout"); },
    lesson: "A 0 ms timeout is a task and is due at once, so it usually runs before the next frame. A rAF callback registered during a frame waits for the next one, so frame 2 is a whole refresh (about 16 ms) after frame 1. rAF is tied to rendering; tasks are not.",
  },
];

function simulate(s: Snippet): Step[] {
  const steps: Step[] = [];
  const log: string[] = [];
  const tasks: { label: string; fn?: () => void }[] = [];
  const micro: { label: string; fn?: () => void }[] = [];
  let rafs: { label: string; fn?: () => void }[] = [];
  let pendingRafs: { label: string; fn?: () => void }[] = [];
  let n = 0;
  const snap = (kind: Kind, label: string, stack: string[]) => steps.push({ n: ++n, kind, label, stack: [...stack], micro: micro.map((m) => m.label), tasks: tasks.map((t) => t.label), rafs: [...rafs, ...pendingRafs].map((r) => r.label), log: [...log] });
  const stack: string[] = [];
  const api: Api = {
    log: (t) => { log.push(t); snap("task", `console.log('${t}')`, stack); },
    setTimeout: (label, fn) => { tasks.push({ label, fn }); snap("task", `setTimeout queues a task: '${label}'`, stack); },
    promise: (label, fn) => { micro.push({ label, fn }); snap("micro", `promise.then queues a microtask: '${label}'`, stack); },
    queueMicrotask: (label, fn) => { micro.push({ label, fn }); snap("micro", `queueMicrotask: '${label}'`, stack); },
    raf: (label, fn) => { (inFrame ? pendingRafs : rafs).push({ label, fn }); snap("raf", `requestAnimationFrame registers '${label}' for the ${inFrame ? "next" : "coming"} frame`, stack); },
  };
  let inFrame = false;
  const drain = () => { while (micro.length) { const m = micro.shift()!; stack.push(m.label); log.push(m.label); snap("micro", `microtask '${m.label}' runs`, stack); m.fn?.(); stack.pop(); } };
  // the script task
  stack.push("script"); snap("task", "the script runs as one task", stack); s.program(api); stack.pop(); snap("task", "script task ends; the stack is empty", stack);
  drain();
  let guard = 0;
  while ((tasks.length || rafs.length || pendingRafs.length) && guard++ < 20) {
    // a due task runs first: a 0 ms timer is due long before the next frame (frames are ~16 ms apart)
    if (tasks.length) { const t = tasks.shift()!; stack.push(t.label); log.push(t.label); snap("task", `task '${t.label}' runs`, stack); t.fn?.(); stack.pop(); drain(); }
    // then a render opportunity: rAF callbacks, then style, layout, paint, composite
    if (rafs.length) {
      inFrame = true;
      snap("render", "render opportunity: rAF callbacks run", stack);
      const batch = rafs; rafs = [];
      for (const r of batch) { stack.push(r.label); log.push(r.label); snap("raf", `rAF '${r.label}' runs`, stack); r.fn?.(); stack.pop(); drain(); }
      inFrame = false; rafs = pendingRafs; pendingRafs = [];
      snap("render", "style, layout, paint, composite", stack);
    }
  }
  snap("task", "queues empty: the loop waits", stack);
  return steps;
}

export function EventLoop() {
  const [sid, setSid] = useState(SNIPPETS[0].id);
  useEffect(() => { const f = new URLSearchParams(window.location.search).get("focus"); if (f && SNIPPETS.some((s) => s.id === f)) setSid(f); }, []);
  const [i, setI] = useState(0);
  const snippet = SNIPPETS.find((s) => s.id === sid)!;
  const steps = useMemo(() => simulate(snippet), [snippet]);
  const step = steps[Math.min(i, steps.length - 1)];
  const pick = (id: string) => { setSid(id); setI(0); };
  return (
    <div className="el">
      <div className="el-snips" role="tablist" aria-label="Snippets">
        {SNIPPETS.map((s) => <button key={s.id} role="tab" aria-selected={s.id === sid} type="button" onClick={() => pick(s.id)}>{s.title}</button>)}
      </div>
      <div className="el-grid">
        <pre className="el-code" aria-label="The snippet"><code>{snippet.code}</code></pre>
        <div className="el-loop">
          <Box title="Call stack" items={step.stack} kind="task" />
          <Box title="Microtask queue" items={step.micro} kind="micro" hint="drains completely before the next task" />
          <Box title="Task queue" items={step.tasks} kind="task" hint="setTimeout, events, I/O" />
          <Box title="rAF callbacks" items={step.rafs} kind="raf" hint="run in the render step" />
          <div className={`el-render${step.kind === "render" ? " is-on" : ""}`}>Render: {["style", "layout", "paint", "composite"].map((t, n) => (
            <span key={t}>{n > 0 && <ChevronRight size={11} className="icon-inline" aria-hidden="true" />}{t}</span>
          ))}</div>
        </div>
        <div className="el-log">
          <h3 className="el-log-title">Console</h3>
          <ol>{step.log.map((l, k) => <li key={k}>{l}</li>)}</ol>
        </div>
      </div>
      <div className="el-controls">
        <button type="button" className="cst-btn" onClick={() => setI(0)} disabled={i === 0}>Reset</button>
        <button type="button" className="cst-btn" onClick={() => setI((v) => Math.max(0, v - 1))} disabled={i === 0}>Back</button>
        <button type="button" className="cst-btn is-primary" onClick={() => setI((v) => Math.min(steps.length - 1, v + 1))} disabled={i >= steps.length - 1}>Step</button>
        <span className="el-step"><span className={`el-kind is-${step.kind}`} /> {step.n} / {steps.length}: {step.label}</span>
      </div>
      <p className="el-lesson">{snippet.lesson}</p>
    </div>
  );
}

function Box({ title, items, kind, hint }: { title: string; items: string[]; kind: Kind; hint?: string }) {
  return (
    <div className={`el-box is-${kind}`}>
      <h3 className="el-box-title">{title}{hint && <span className="el-box-hint"> · {hint}</span>}</h3>
      <ol className="el-box-items">{items.length ? items.map((x, k) => <li key={k}>{x}</li>) : <li className="is-empty">empty</li>}</ol>
    </div>
  );
}
