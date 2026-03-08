"use client";
import { useRef, useEffect, useState, type ReactNode, type AnchorHTMLAttributes } from "react";

type GlowButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
};

const pastelColour = (xPc: number, yPc: number, t: number) => {
  const cv = (n: number) => 140 + Math.floor((115 / 100) * Math.max(0, Math.min(100, n)));
  const rPc = Math.max(0, Math.min(100, xPc + Math.sin(t * 1.1) * 28));
  const gPc = Math.max(0, Math.min(100, yPc + Math.cos(t * 0.7) * 22));
  const bPc = 100 - rPc;
  return { r: cv(rPc), g: cv(gPc), b: cv(bPc) };
};

export const GlowButton = ({
  children,
  className = "",
  ...rest
}: GlowButtonProps) => {
  const ref = useRef<HTMLAnchorElement>(null);
  const hoveredRef = useRef(false);
  const glowRef = useRef(0);
  const mouseXRef = useRef(0);
  const mouseYRef = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf: number;

    const onEnter = () => { hoveredRef.current = true; };
    const onLeave = () => { hoveredRef.current = false; };
    const onMove = (e: PointerEvent) => {
      mouseXRef.current = e.clientX;
      mouseYRef.current = e.clientY;
    };

    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointermove", onMove, { passive: true });

    const tick = () => {
      const target = hoveredRef.current ? 1 : 0;
      glowRef.current += (target - glowRef.current) * 0.15;
      const g = glowRef.current;

      const t = performance.now() / 1000;
      const localXPc = (mouseXRef.current / window.innerWidth) * 100;
      const localYPc = (mouseYRef.current / window.innerHeight) * 100;
      const { r, b, g: green } = pastelColour(localXPc, localYPc, t);

      if (g > 0.01) {
        el.style.borderColor = `rgb(${r} ${green} ${b} / ${g * 0.6})`;
        el.style.boxShadow = `0 0 ${16 * g}px rgb(${r} ${green} ${b} / ${g * 0.35}), inset 0 0 ${8 * g}px rgb(${r} ${green} ${b} / ${g * 0.1})`;
        el.style.color = `rgb(${r} ${green} ${b} / ${0.6 + g * 0.4})`;
      } else {
        el.style.borderColor = "";
        el.style.boxShadow = "";
        el.style.color = "";
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <a
      ref={ref}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-black/20 dark:border-white/15 rounded-lg text-black/70 dark:text-white/60 font-medium transition-none cursor-pointer select-none ${className}`}
      style={{ willChange: "border-color, box-shadow, color" }}
      {...rest}
    >
      {children}
    </a>
  );
};
