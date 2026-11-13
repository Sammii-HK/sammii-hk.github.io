import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";

const bridge = readFileSync(resolve(process.cwd(), "public/exploration-runtime/bridge.js"), "utf8");

function runtime(failMount = false) {
  const windowEvents = new Map<string, (event?: unknown) => void>();
  const documentEvents = new Map<string, () => void>();
  const messages: { type: string; slug: string; height?: number }[] = [];
  const origin = "https://labs.sammii.dev";
  const parent = { postMessage: (message: typeof messages[number], target: string) => {
    expect(target).toBe(origin);
    messages.push(message);
  } };
  const scene = { innerHTML: "", querySelector: () => ({}) };
  let cleanedUp = false;
  const window = {
    parent,
    addEventListener: (name: string, listener: (event?: unknown) => void) => windowEvents.set(name, listener),
    PhysicsLabs: { mount: () => {
      if (failMount) throw new Error("Model failed to mount");
      return () => { cleanedUp = true; };
    } },
  };
  const document = {
    body: { dataset: { slug: "black-hole-light-paths", family: "lab", mode: "black-hole-light" }, getBoundingClientRect: () => ({ height: 850 }) },
    addEventListener: (name: string, listener: () => void) => documentEvents.set(name, listener),
    getElementById: () => scene,
  };
  runInNewContext(bridge, {
    window, document, location: { origin },
    requestAnimationFrame: () => 1, cancelAnimationFrame: () => {},
    ResizeObserver: class { observe() {} disconnect() {} },
    console: { error() {} },
  });
  return {
    messages,
    mount: () => documentEvents.get("DOMContentLoaded")!(),
    request: (requestOrigin = origin, source: unknown = parent) => windowEvents.get("message")!({ origin: requestOrigin, source, data: { type: "exploration:measure" } }),
    dispose: () => windowEvents.get("pagehide")!({ persisted: false }),
    cache: () => windowEvents.get("pagehide")!({ persisted: true }),
    restore: () => windowEvents.get("pageshow")!({ persisted: true }),
    cleanedUp: () => cleanedUp,
  };
}

describe("iframe readiness handshake", () => {
  it("does not claim readiness before the model mounts, then answers late hydration requests", () => {
    const frame = runtime();
    frame.request();
    expect(frame.messages).toHaveLength(0);
    frame.mount();
    expect(frame.messages.map((message) => message.type)).toEqual(["exploration:ready"]);
    frame.request();
    expect(frame.messages.map((message) => message.type)).toEqual(["exploration:ready", "exploration:ready"]);
  });

  it("replays a genuine failure instead of converting it to ready on a load handshake", () => {
    const frame = runtime(true);
    frame.mount();
    frame.request();
    expect(frame.messages.map((message) => message.type)).toEqual(["exploration:error", "exploration:error"]);
  });

  it("rejects a different origin or window, and stops responding after disposal", () => {
    const frame = runtime();
    frame.mount();
    frame.request("https://example.com");
    frame.request(undefined, {});
    expect(frame.messages).toHaveLength(1);
    frame.dispose();
    frame.request();
    expect(frame.messages).toHaveLength(1);
    expect(frame.cleanedUp()).toBe(true);
  });

  it("gives a retried document fresh state after the previous document fails", () => {
    const failed = runtime(true);
    failed.mount();
    failed.dispose();
    const retried = runtime();
    retried.request();
    expect(retried.messages).toHaveLength(0);
    retried.mount();
    retried.request();
    expect(retried.messages.every((message) => message.type === "exploration:ready")).toBe(true);
  });

  it("preserves the model through back/forward caching and replays readiness on restore", () => {
    const frame = runtime();
    frame.mount();
    frame.cache();
    expect(frame.cleanedUp()).toBe(false);
    frame.restore();
    frame.request();
    expect(frame.messages.map((message) => message.type)).toEqual(["exploration:ready", "exploration:ready", "exploration:ready"]);
  });
});
