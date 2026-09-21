import type { Metadata } from "next";
import Image from "next/image";
import { CodeXml, ExternalLink } from "lucide-react";
import { projects, type LabsKind, type Project } from "../common/data/projects";
import { getLabsProjects } from "../lib/lenses";
import { getImagePath } from "../common/utils/image-path";
import { getGithubRepoUrl } from "../common/utils/github-repo-url";
import { LabsShell } from "../src/components/labs/LabsShell";

/**
 * labs.sammii.dev (served from this route by a host rewrite in vercel.json).
 * The other side of the portal at the end of Selected Work: experiments,
 * studies and lab projects, unranked, each with the thing itself and the
 * code. Superseded work stays, last, with what replaced it.
 */
export const metadata: Metadata = {
  title: "Labs: experiments by Sammii Kellow",
  description: "Creative coding, shader and physics experiments, studies and lab projects by Sammii Kellow, a design engineer in London.",
  alternates: { canonical: "https://labs.sammii.dev/" },
  openGraph: { title: "Labs, by Sammii Kellow", description: "Experiments, studies and lab projects.", url: "https://labs.sammii.dev/", type: "website" },
};

const KINDS: { kind: LabsKind; label: string; lead: string }[] = [
  { kind: "experiment", label: "Experiments", lead: "One idea each, built to see it move." },
  { kind: "study", label: "Studies", lead: "Longer looks at a single question." },
  { kind: "lab-project", label: "Lab projects", lead: "Bigger builds that never needed to be products." },
];

const byId = (id: string) => projects.find((p) => p.id === id);

function LabCard({ p }: { p: Project }) {
  const replacedBy = p.labs?.supersededBy ? byId(p.labs.supersededBy) : undefined;
  const showRepo = !p.privateRepo && !p.noRepo;
  return (
    <li className="lab-card" data-superseded={p.labs?.superseded ? "" : undefined}>
      <figure className="lab-card-shot">
        <Image src={getImagePath(p.id)} alt={`${p.title} screenshot`} width={1000} height={500} sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw" loading="lazy" />
      </figure>
      <div className="lab-card-body">
        <h3 className="lab-card-title">{p.title}</h3>
        <p className="lab-card-stack">{p.techStack}</p>
        <p className="lab-card-info">{p.info}</p>
        {replacedBy && (
          <p className="lab-card-note">
            Superseded by{" "}
            <a href={replacedBy.liveUrl ?? `https://sammii.dev/projects/${replacedBy.caseStudy}/`}>{replacedBy.title}</a>.
          </p>
        )}
        <div className="lab-card-links">
          {p.liveUrl && (
            <a href={p.liveUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink size={13} aria-hidden="true" /> Try it
            </a>
          )}
          {showRepo && (
            <a href={getGithubRepoUrl(p.id)} target="_blank" rel="noopener noreferrer">
              <CodeXml size={13} aria-hidden="true" /> View code
            </a>
          )}
        </div>
      </div>
    </li>
  );
}

export default function LabsPage() {
  const labs = getLabsProjects();
  return (
    <LabsShell>
      <div className="labs-index">
        <header className="labs-index-head">
          <p className="section-eyebrow">Labs</p>
          <h1 className="labs-index-title">Where the rule stops being obedient.</h1>
          <p className="labs-index-lead">
            {labs.length} experiments, studies and lab projects: shaders, physics, typography, a pixel village in VS Code. Built to
            understand something, kept because they still do. The finished work is on{" "}
            <a href="https://sammii.dev/">sammii.dev</a>.
          </p>
        </header>
        <section aria-labelledby="labs-charts" className="labs-index-group">
          <h2 id="labs-charts" className="section-eyebrow">
            Charts <span className="work-index-count" aria-hidden="true">1</span>
          </h2>
          <p className="labs-index-group-lead">Information design about the things design engineers work with. Interactive, and a poster you can download.</p>
          <ul className="lab-grid" aria-label="Charts">
            <li className="lab-card">
              <div className="lab-card-body">
                <h3 className="lab-card-title">The family tree of colour spaces</h3>
                <p className="lab-card-stack">SVG, React, CSS Color 4</p>
                <p className="lab-card-info">25 colour spaces from Munsell and CIE XYZ to OKLCH and CSS Color 4, on a timeline in six lanes, with the derivations drawn in and live ramps in each space.</p>
                <div className="lab-card-links">
                  <a href="/charts/colour-spaces/">Open the chart</a>
                </div>
              </div>
            </li>
          </ul>
        </section>
        {KINDS.map(({ kind, label, lead }) => {
          const items = labs.filter((p) => p.labs?.kind === kind);
          if (items.length === 0) return null;
          return (
            <section key={kind} aria-labelledby={`labs-${kind}`} className="labs-index-group">
              <h2 id={`labs-${kind}`} className="section-eyebrow">
                {label} <span className="work-index-count" aria-hidden="true">{items.length}</span>
              </h2>
              <p className="labs-index-group-lead">{lead}</p>
              <ul className="lab-grid" aria-label={label}>
                {items.map((p) => (
                  <LabCard key={p.id} p={p} />
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </LabsShell>
  );
}
