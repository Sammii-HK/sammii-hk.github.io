import { projects } from "../../../common/data/projects";

/**
 * Structural hero. The copy is the existing intro block, moved here verbatim
 * from ProjectGrid so nothing changes visually in this phase. Phase 2D
 * replaces it with the three-lens sentence.
 */
export const Hero = () => {
  const products = projects.filter((p) => p.type === "product").length;
  const experiments = projects.filter((p) => p.type === "experiment").length;
  const caseStudies = projects.filter((p) => !!p.caseStudy).length;

  return (
    <section id="hero" aria-labelledby="hero-heading" className="px-2 sm:px-4 md:px-6 pt-6 sm:pt-10 pb-2">
      <div className="max-w-7xl mx-auto px-1">
        <h1 id="hero-heading" className="text-lg sm:text-xl md:text-2xl font-bold text-black dark:text-white mb-2">
          AI product engineer and design engineer.
        </h1>
        <p className="text-sm sm:text-base text-black/60 dark:text-white/60 leading-relaxed max-w-2xl">
          I build AI-native products end to end: the agent systems and MCP tooling, and the interface that makes them usable.
          Background in design and visual communication, now shipping autonomous multi-agent pipelines, published developer
          tools, and full-stack products. Everything below is something I built.
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 text-xs sm:text-sm">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-black/15 dark:border-white/15 text-black/70 dark:text-white/70">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Open to roles and contract · remote or London
          </span>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-1 mt-4 text-xs sm:text-sm text-black/40 dark:text-white/35">
          <span>{products} products</span>
          <span>{experiments} experiments</span>
          <span>{caseStudies} case studies</span>
        </div>
      </div>
    </section>
  );
};
