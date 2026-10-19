import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { EMAIL, LINKEDIN_URL } from "../constants";
import { SiteShell } from "../src/components/site/SiteShell";
import { HeadshotSlot } from "./HeadshotSlot";

/**
 * /speaking: the page an organiser or a podcast host needs. The talks, two
 * bios to lift as they are, and how to get in touch. Same grammar as /work:
 * eyebrow, one statement as the H1, then sections under eyebrows.
 */
const TITLE = "Speaking: talks on design engineering and AI agents";
const DESCRIPTION =
  "Talks on design engineering, building with AI agents, and what AI means for the mind. Talk outlines, a short and a long bio, and how to invite me to speak or on a podcast.";
const URL = "https://sammii.dev/speaking/";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: { title: TITLE, description: DESCRIPTION, url: URL, type: "website" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

const TALKS = [
  {
    title: "A proposal is not an approval: guardrails for AI agents that act in your name",
    summary:
      "A field report from a company run by one person and a set of AI agents. It covers the guardrails that let agents act in your name: approval as a state, truth checks in the pipeline, checking for the output rather than the job, containing the blast radius, and measuring before you automate.",
  },
  {
    title: "The gap moved: design engineering when agents write the code",
    summary:
      "When agents write the code, the gap does not close. It moves to the bugs no spec or test catches. This talk walks through real ones from a video app built with agents, and how each fix became a rule in code, so taste is enforced rather than remembered.",
  },
  {
    title: "I built a cat I don't control",
    summary:
      "How Moth, an autonomous AI cat, is made. The talk covers designing possibilities instead of outcomes, and a character who practises and gets better at drawing. It ends with what the analytics said about her films.",
  },
].map((t) => ({ ...t, format: "30-minute talk" }));

const SHORT_BIO =
  "Samantha Kellow is a design engineer and AI product engineer in London. She runs Lunar Computing on her own with a team of AI agents, building products including Lunary, a live astrology app, and Moth, an autonomous AI cat. Before that she was founding design engineer at Garden Computing and shipped frontend systems at ASOS. She has an MA in Visual Communication.";

const LONG_BIO =
  "Samantha Kellow is a design engineer and AI product engineer in London. She builds AI-native products end to end, from the agent systems underneath to the interface on top, and runs Lunar Computing on her own with a team of AI agents. Her products include Lunary, a live astrology app with paying subscribers, and Moth, an autonomous AI cat who lives in a world Samantha built and posts three films of her day, every day. She was founding design engineer at Garden Computing and, before that, built frontend systems at ASOS and bots. She came to engineering from design: her MA in Visual Communication was a room whose words only appeared under ultraviolet light. She writes at sammii.dev about design engineering, agents and consciousness.";

export default function SpeakingPage() {
  return (
    <SiteShell current="speaking">
      <main id="main" className="speaking">
        <header className="speaking-head">
          <p className="section-eyebrow">Speaking</p>
          <h1 className="speaking-title">Talks on design engineering, building with AI agents, and what AI means for the mind.</h1>
        </header>

        <section aria-labelledby="speaking-talks" className="speaking-section">
          <h2 id="speaking-talks" className="section-eyebrow">
            Talks <span className="speaking-count" aria-hidden="true">{TALKS.length}</span>
          </h2>
          <ul className="speaking-talks">
            {TALKS.map((t) => (
              <li key={t.title} className="speaking-talk">
                <h3 className="speaking-talk-title">{t.title}</h3>
                <p className="speaking-talk-summary">{t.summary}</p>
                <p className="speaking-talk-format">{t.format}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="speaking-bio" className="speaking-section">
          <h2 id="speaking-bio" className="section-eyebrow">Bio</h2>
          <div className="speaking-bios">
            <div>
              <h3 className="speaking-bio-label">Short bio</h3>
              <p className="speaking-bio-text">{SHORT_BIO}</p>
            </div>
            <div>
              <h3 className="speaking-bio-label">Long bio</h3>
              <p className="speaking-bio-text">{LONG_BIO}</p>
            </div>
          </div>
          <HeadshotSlot />
        </section>

        <section aria-labelledby="speaking-booking" className="speaking-section">
          <h2 id="speaking-booking" className="section-eyebrow">Booking</h2>
          <p className="contact-line speaking-booking">
            To invite me to speak or on a podcast: <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          </p>
          <ul className="contact-links">
            <li>
              <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">
                LinkedIn <ArrowUpRight size={14} className="icon-inline" aria-hidden="true" />
              </a>
            </li>
            <li>
              <a href="/blog/">Blog</a>
            </li>
          </ul>
        </section>
      </main>
    </SiteShell>
  );
}
