"use client";
import type { Lens } from "../../../common/data/projects";
import { EMAIL, GITHUB_URL_SAMMII, LINKEDIN_URL } from "../../../constants";
import { useLens } from "../lens/LensProvider";

/**
 * One CV per lens, built from the same master profile (cast/scripts/build-lens-cvs.py),
 * so the PDF someone downloads matches the version of the site they were reading.
 * All three are structured, two-page, ATS-safe.
 */
export const CV_BY_LENS: Record<Lens, { href: string; label: string; role: string }> = {
  design: { href: "/cv/sammii-kellow-cv-design-engineering.pdf", label: "design engineering", role: "design engineering" },
  ai: { href: "/cv/sammii-kellow-cv-ai-product-engineering.pdf", label: "AI product engineering", role: "AI product engineering" },
  product: { href: "/cv/sammii-kellow-cv-product-engineering.pdf", label: "product engineering", role: "product engineering" },
};

/** Contact (Phase 2G). One line of intent, four real links, nothing else. */
export const Contact = () => {
  const { committed } = useLens();
  const cv = CV_BY_LENS[committed];
  return (
    <section id="contact" aria-labelledby="contact-heading" className="contact">
      <h2 id="contact-heading" className="section-eyebrow">
        Contact
      </h2>
      <p className="contact-line">
        Looking for a senior or staff {cv.role} role, London or remote. The fastest way to reach me is email.
      </p>
      <ul className="contact-links">
        <li><a href={`mailto:${EMAIL}`}>{EMAIL}</a></li>
        <li><a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">LinkedIn <span aria-hidden="true">↗</span></a></li>
        <li><a href={GITHUB_URL_SAMMII} target="_blank" rel="noopener noreferrer">GitHub <span aria-hidden="true">↗</span></a></li>
        <li><a href={cv.href} download>CV for {cv.label}, PDF</a></li>
      </ul>
      <p className="contact-colophon">
        <span>© {new Date().getFullYear()} Sammii Kellow</span>
        <a href="/blog/">Blog</a>
        <a href="/rss.xml">RSS</a>
        <a href="https://labs.sammii.dev/">Labs</a>
      </p>
    </section>
  );
};
