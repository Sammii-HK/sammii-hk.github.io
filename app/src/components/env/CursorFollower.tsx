"use client";
import { useEffect, useRef } from "react";

export const CursorFollower = () => {
  const ref = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -400, y: -400 });
  const target = useRef({ x: -400, y: -400 });
  const raf = useRef<number | null>(null);

  useEffect(() => {
    // Skip on touch-only devices
    if (window.matchMedia("(hover: none)").matches) return;

    const onMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMove);

    const tick = () => {
      const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
      pos.current.x = lerp(pos.current.x, target.current.x, 0.06);
      pos.current.y = lerp(pos.current.y, target.current.y, 0.06);

      if (ref.current) {
        // Match the logo's colour formula so the follower and logo feel connected
        const xPc = Math.min(100, (pos.current.x * 2 / window.innerWidth) * 100);
        const yPc = Math.min(100, (pos.current.y / window.innerHeight) * 100);
        const c = (n: number) => Math.min(255, Math.floor((255 / 100) * n));
        const r = c(xPc);
        const g = c(yPc);
        const b = 255 - r;

        ref.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`;
        ref.current.style.background = `radial-gradient(circle, rgb(${r} ${g} ${b} / 5%) 0%, transparent 70%)`;
      }

      raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 -z-10 hidden md:block"
      style={{
        width: "350px",
        height: "350px",
        marginLeft: "-175px",
        marginTop: "-175px",
        willChange: "transform",
        filter: "blur(35px)",
      }}
    />
  );
};
