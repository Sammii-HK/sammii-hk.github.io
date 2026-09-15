import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { HeroLab } from "../src/components/hero-lab/HeroLab";
import "./hero-lab.css";

// Development-only design playground for the Phase 2D hero. Not linked from
// anywhere; 404s in production builds; never indexed.
export const metadata: Metadata = {
  title: "hero lab",
  robots: { index: false, follow: false },
};

export default function HeroLabPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <Suspense fallback={null}>
      <HeroLab />
    </Suspense>
  );
}
