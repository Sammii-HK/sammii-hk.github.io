import fs from "fs";
import path from "path";
import Link from "next/link";
import matter from "gray-matter";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { Breadcrumbs } from "../../../src/components/Breadcrumbs";
import { SiteShell } from "../../../src/components/site/SiteShell";
import { getCaseStudyBySlug } from "../../../lib/case-studies";
import { ArrowLeft } from "lucide-react";

// Engineering reports that back a case study: content/reports/<slug>.md, served at /projects/<slug>/report/.
const REPORTS_DIR = path.join(process.cwd(), "content/reports");

type Props = { params: Promise<{ slug: string }> };

function readReport(slug: string) {
  const file = path.join(REPORTS_DIR, `${slug}.md`);
  if (!/^[a-z0-9-]+$/.test(slug) || !fs.existsSync(file)) return null;
  const { data, content } = matter(fs.readFileSync(file, "utf-8"));
  return { title: String(data.title), description: String(data.description), date: String(data.date), content };
}

export function generateStaticParams() {
  if (!fs.existsSync(REPORTS_DIR)) return [];
  return fs.readdirSync(REPORTS_DIR).filter((f) => f.endsWith(".md")).map((f) => ({ slug: f.replace(/\.md$/, "") }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const report = readReport(slug);
  if (!report) return {};
  const url = `https://sammii.dev/projects/${slug}/report/`;
  return {
    title: `${report.title} · sammii.dev`,
    description: report.description,
    alternates: { canonical: url },
    openGraph: { title: report.title, description: report.description, type: "article", url },
  };
}

export default async function ReportPage({ params }: Props) {
  const { slug } = await params;
  const report = readReport(slug);
  if (!report) notFound();
  const study = getCaseStudyBySlug(slug);
  const studyTitle = study?.title ?? slug;

  return (
    <SiteShell current="work">
      <main id="main" className="case-study">
        <Breadcrumbs
          crumbs={[
            { label: "sammii.dev", href: "/" },
            { label: "Work", href: "/work/" },
            { label: studyTitle, href: `/projects/${slug}/` },
            { label: "Report" },
          ]}
        />
        <article className="prose prose-neutral dark:prose-invert max-w-none case-body report-body">
          <h1>{report.title}</h1>
          <MDXRemote source={report.content} options={{ mdxOptions: { format: "md", remarkPlugins: [remarkGfm] } }} />
        </article>
        <nav className="case-foot" aria-label="More">
          <Link prefetch={false} href={`/projects/${slug}/`}>
            <ArrowLeft size={14} className="icon-inline" aria-hidden="true" /> Back to the {studyTitle} case study
          </Link>
          <Link prefetch={false} href="/work/">All work</Link>
        </nav>
      </main>
    </SiteShell>
  );
}
