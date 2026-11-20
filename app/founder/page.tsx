"use client";
import { MapPin, Moon, Code2, Building2, Palette, Globe, Bot, Dog, Linkedin, Mail } from "lucide-react";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { gradientCreator } from "../common/scripts/gradient-creator";

const LinkedInIcon = () => (
  <Linkedin   className="w-5 h-5" />
);

const MailIcon = () => (
  <Mail   stroke="currentColor" strokeWidth="2" className="w-5 h-5" />
);

export default function FounderPage() {
  const [xPc, setXPc] = useState(30);
  const [yPc, setYPc] = useState(70);

  const targetXPcRef = useRef(30);
  const targetYPcRef = useRef(70);
  const currentXPcRef = useRef(30);
  const currentYPcRef = useRef(70);
  const animationRef = useRef<number | null>(null);

  const lerp = (current: number, target: number, factor: number): number => {
    return current + (target - current) * factor;
  };

  useEffect(() => {
    const animate = () => {
      const factor = 0.15;

      currentXPcRef.current = lerp(
        currentXPcRef.current,
        targetXPcRef.current,
        factor
      );
      currentYPcRef.current = lerp(
        currentYPcRef.current,
        targetYPcRef.current,
        factor
      );

      setXPc(currentXPcRef.current);
      setYPc(currentYPcRef.current);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const handlePointerMove = (e: React.PointerEvent) => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    targetYPcRef.current = (e.clientY / viewportHeight) * 100;
    targetXPcRef.current = ((e.clientX * 2) / viewportWidth) * 100;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      targetYPcRef.current = (touch.clientY / viewportHeight) * 100;
      targetXPcRef.current = ((touch.clientX * 2) / viewportWidth) * 100;
    }
  };

  return (
    <main
      className="min-h-[100dvh] flex flex-col items-center justify-start px-6 py-16 bg-white dark:bg-black text-black dark:text-white transition-colors"
      onPointerMove={handlePointerMove}
      onTouchMove={handleTouchMove}
    >
      {/* Hero Section */}
      <div className="w-full max-w-2xl mb-16">
        {/* Wordmark with gradient */}
        <div className="mb-8">
          <h1
            className="text-5xl md:text-6xl font-bold mb-3"
            style={{
              backgroundImage: `linear-gradient(135deg, ${
                `hsl(${(xPc + yPc) % 360}, 40%, 65%)`
              }, ${`hsl(${(xPc - yPc + 360) % 360}, 40%, 65%)`})`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              transition: "background-image 0.05s ease-out",
            }}
          >
            Sammii Kellow
          </h1>
          <h2 className="text-lg md:text-xl font-medium text-black/80 dark:text-white/85 mb-6">
            {`Founder of Lunary • Building symbolic intelligence tools`}
          </h2>
          <p className="text-lg text-black/60 dark:text-white/60 leading-relaxed">
            {`Building the world's most trusted symbolic intelligence platform through astrology, tarot, and AI.`}
          </p>
        </div>
      </div>

      {/* Vision Statement */}
      <div className="w-full max-w-2xl mb-16">
        <div className="p-6 rounded-xl border-l-2 border-black/30 dark:border-white/30 bg-black/5 dark:bg-white/5">
          <p className="text-lg md:text-xl font-medium text-black/90 dark:text-white/90 italic">
            {`"My vision is to create the world's most trusted symbolic intelligence platform."`}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-2xl space-y-20">
        {/* What I'm Building */}
        <section>
          <h3 className="text-sm uppercase tracking-[0.12em] text-black/45 dark:text-white/45 mb-4 font-semibold">
            {`What I'm Building`}
          </h3>
          <div className="space-y-4">
            <p className="text-base leading-relaxed text-black/80 dark:text-white/80">
              Lunary is a symbolic intelligence platform that combines astrology, tarot, ritual, reflection, and AI into a single experience.
            </p>
            <p className="text-base leading-relaxed text-black/80 dark:text-white/80">
              The platform helps people better understand themselves through meaningful patterns, personal insight, and self-reflection.
            </p>
            <p className="text-base leading-relaxed text-black/60 dark:text-white/70">
              Today, Lunary includes astrology tools, birth charts, transits, tarot experiences, rituals, AI-powered guidance, subscriptions, content systems, and a growing knowledge base.
            </p>
          </div>
        </section>

        {/* Why I'm Building It */}
        <section>
          <h3 className="text-sm uppercase tracking-[0.12em] text-black/45 dark:text-white/45 mb-4 font-semibold">
            {`Why I'm Building It`}
          </h3>
          <div className="space-y-4">
            <p className="text-base leading-relaxed text-black/80 dark:text-white/80">
              {`I've always been fascinated by the intersection of technology, creativity, meaning, and personal growth.`}
            </p>
            <p className="text-base leading-relaxed text-black/80 dark:text-white/80">
              {`My background spans both design and engineering, but I've also spent years exploring astrology, tarot, psychology, symbolism, and self-development.`}
            </p>
            <p className="text-base leading-relaxed text-black/80 dark:text-white/80">
              {`Lunary brings those worlds together. What started as a side project became something much bigger: a mission to build tools that help people feel more connected to themselves and more intentional about their lives.`}
            </p>
            <p className="text-base leading-relaxed text-black/60 dark:text-white/70">
              {`Building Lunary has become part of my own story of rebuilding, resilience, and creating something meaningful from the ground up.`}
            </p>
          </div>
        </section>

        {/* Progress */}
        <section>
          <h3 className="text-sm uppercase tracking-[0.12em] text-black/45 dark:text-white/45 mb-4 font-semibold">
            Progress So Far
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              "Founder-led and independently built",
              "Incorporated as a Delaware C-Corp",
              "Paying subscribers",
              "Subscription business model",
              "AI-powered experiences",
              "Astrology and tarot platform",
              "Thousands of search-indexed pages",
              "Growing organic search presence and content distribution",
              "Automated content engine",
              "Built using Next.js and Vercel",
              "Growing creator ecosystem",
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 p-3 rounded-lg border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/5"
              >
                <div className="h-5 w-5 rounded-full bg-black/30 dark:bg-white/30 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-black/70 dark:text-white/70">{item}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Background */}
        <section>
          <h3 className="text-sm uppercase tracking-[0.12em] text-black/45 dark:text-white/45 mb-4 font-semibold">
            Background
          </h3>
          <div className="space-y-4">
            <p className="text-base leading-relaxed text-black/80 dark:text-white/80">
              {`I'm a senior frontend and design engineer with over a decade of experience spanning design, user experience, accessibility, frontend engineering, design systems, and developer experience.`}
            </p>
            <p className="text-base leading-relaxed text-black/80 dark:text-white/80">
              {`I've worked across both design and software engineering, helping teams build products that are beautiful, accessible, scalable, and user-focused.`}
            </p>
            <p className="text-base leading-relaxed text-black/80 dark:text-white/80">
              {`My technical background includes React, Next.js, TypeScript, modern web architecture, design systems, and product development. Today I bring those skills into building Lunary.`}
            </p>
          </div>
        </section>

        {/* Current Focus */}
        <section>
          <h3 className="text-sm uppercase tracking-[0.12em] text-black/45 dark:text-white/45 mb-4 font-semibold">
            Current Focus
          </h3>
          <div className="space-y-2">
            {[
              "Growing Lunary",
              "Product development",
              "Organic growth and SEO",
              "Content systems and automation",
              "Strategic partnerships",
              "Early-stage fundraising conversations",
              "Building sustainable founder runway",
            ].map((item) => (
              <p key={item} className="text-base text-black/70 dark:text-white/70">
                &bull; {item}
              </p>
            ))}
          </div>
        </section>

        {/* What I'm Looking For */}
        <section>
          <h3 className="text-sm uppercase tracking-[0.12em] text-black/45 dark:text-white/45 mb-4 font-semibold">
            {`What I'm Looking For`}
          </h3>
          <p className="text-base leading-relaxed text-black/80 dark:text-white/80 mb-4">
            {`I'm always happy to connect with:`}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
            {[
              "Angel investors",
              "Early-stage founders",
              "Product builders",
              "Design engineers",
              "Strategic partners",
              "Creators",
              "Media opportunities",
              "People interested in symbolic intelligence",
              "People building the future of AI, developer tools, creativity, wellness, and personal growth",
            ].map((item) => (
              <p key={item} className="text-base text-black/70 dark:text-white/70">
                &bull; {item}
              </p>
            ))}
          </div>
          <p className="text-base text-black/60 dark:text-white/60">
            {`If any of those sound like you, I'd love to chat.`}
          </p>
        </section>

        {/* Quick Facts */}
        <section>
          <h3 className="text-sm uppercase tracking-[0.12em] text-black/45 dark:text-white/45 mb-4 font-semibold">
            Quick Facts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { icon: <MapPin size={20} aria-hidden="true" />, label: "Based in the UK" },
              { icon: <Moon size={20} aria-hidden="true" />, label: "Founder of Lunary" },
              { icon: <Code2 size={20} aria-hidden="true" />, label: "Senior Frontend & Design Engineer" },
              { icon: <Building2 size={20} aria-hidden="true" />, label: "Founder of Lunar Computing" },
              { icon: <Palette size={20} aria-hidden="true" />, label: "Background in design and engineering" },
              { icon: <Globe size={20} aria-hidden="true" />, label: "Exploring location-independent founder living" },
              { icon: <Bot size={20} aria-hidden="true" />, label: "Building with AI and automation" },
              { icon: <Dog size={20} aria-hidden="true" />, label: "Managed by two dogs" },
            ].map((fact) => (
              <div
                key={fact.label}
                className="flex items-center gap-3 p-3 rounded-lg border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/5"
              >
                <span className="text-xl">{fact.icon}</span>
                <p className="text-sm text-black/70 dark:text-white/70">{fact.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Building in Public */}
        <section>
          <h3 className="text-sm uppercase tracking-[0.12em] text-black/45 dark:text-white/45 mb-4 font-semibold">
            Building in Public
          </h3>
          <div className="space-y-4">
            <p className="text-base leading-relaxed text-black/80 dark:text-white/80">
              {`I share the journey of building Lunary across engineering, product development, design, growth, fundraising, and founder life.`}
            </p>
            <p className="text-base leading-relaxed text-black/60 dark:text-white/70">
              {`Building a company is rarely a straight line, and I believe some of the most valuable lessons come from sharing the process honestly.`}
            </p>
          </div>
        </section>

        {/* CTAs */}
        <section className="pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <a
              href="https://lunary.app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl border border-black/10 dark:border-white/10 bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity font-medium"
            >
              Visit Lunary
              <ArrowUpRight className="w-4 h-4" />
            </a>
            <a
              href="https://sammii.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/10 transition-colors font-medium"
            >
              View Portfolio
              <ArrowUpRight className="w-4 h-4" />
            </a>
            <a
              href="https://linkedin.com/in/sammii"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/10 transition-colors font-medium"
            >
              LinkedIn
              <LinkedInIcon />
            </a>
            <a
              href="mailto:hello@sammii.dev"
              className="flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/10 transition-colors font-medium"
            >
              Get in Touch
              <MailIcon />
            </a>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="mt-20 text-xs text-black/40 dark:text-white/40">
        <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">
          sammii.dev
        </Link>
      </footer>
    </main>
  );
}
