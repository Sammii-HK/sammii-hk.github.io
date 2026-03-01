"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import { projects } from "../../../common/data/projects";
import { ProjectItem } from "./ProjectItem";
import { ProjectModal } from "./ProjectModal";

type ProjectType = {
  id: string;
  title: string;
  techStack: string;
  info: string;
  type?: "product" | "experiment";
  liveUrl?: string;
};

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] tracking-[0.2em] text-black/30 dark:text-white/25 uppercase mb-3 mt-1 px-1 select-none">
    {children}
  </p>
);

const CardGrid = ({
  items,
  onCardClick,
  onCardKeyDown,
}: {
  items: ProjectType[];
  onCardClick: (project: ProjectType, el: HTMLDivElement | null) => void;
  onCardKeyDown: (e: React.KeyboardEvent, project: ProjectType, el: HTMLDivElement | null) => void;
}) => {
  const hoveredCardRef = useRef<HTMLDivElement | null>(null);
  const cardXPcRef = useRef(50);
  const cardYPcRef = useRef(50);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // Pastel: floor each channel at 140 so colours stay light like the logo
    const cv = (n: number) => 140 + Math.floor((115 / 100) * Math.max(0, Math.min(100, n)));
    const animate = () => {
      if (hoveredCardRef.current) {
        const t = performance.now() / 1000;
        // Layer sin waves on top of cursor position within the card
        const rPc = Math.max(0, Math.min(100, cardXPcRef.current + Math.sin(t * 1.1) * 28));
        const gPc = Math.max(0, Math.min(100, cardYPcRef.current + Math.cos(t * 0.7) * 22));
        const bPc = 100 - rPc;
        hoveredCardRef.current.style.borderColor = `rgb(${cv(rPc)} ${cv(gPc)} ${cv(bPc)} / 70%)`;
      }
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <div
      className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 md:gap-6"
      role="list"
      aria-label="Projects"
    >
      {items.map((project) => (
        <div
          key={project.id}
          role="listitem"
          tabIndex={0}
          aria-label={`${project.title}. ${project.techStack}. Click to view details.`}
          aria-haspopup="dialog"
          className="project-card bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-lg overflow-hidden border border-black/10 dark:border-white/10 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-white/5 group flex flex-col cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white focus-visible:ring-offset-2"
          onClick={(e) => onCardClick(project, e.currentTarget)}
          onKeyDown={(e) => onCardKeyDown(e, project, e.currentTarget)}
          onMouseEnter={(e) => { hoveredCardRef.current = e.currentTarget; }}
          onMouseMove={(e) => {
            hoveredCardRef.current = e.currentTarget;
            const rect = e.currentTarget.getBoundingClientRect();
            cardXPcRef.current = ((e.clientX - rect.left) / rect.width) * 100;
            cardYPcRef.current = ((e.clientY - rect.top) / rect.height) * 100;
          }}
          onMouseLeave={(e) => {
            hoveredCardRef.current = null;
            e.currentTarget.style.borderColor = "";
          }}
        >
          <ProjectItem project={project} isGrid={true} />
        </div>
      ))}
    </div>
  );
};

export const ProjectGrid = () => {
  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(null);
  const selectedCardRef = useRef<HTMLDivElement | null>(null);

  const handleCardKeyDown = useCallback(
    (e: React.KeyboardEvent, project: ProjectType, cardElement: HTMLDivElement | null) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectedCardRef.current = cardElement;
        setSelectedProject(project);
      }
    },
    []
  );

  const handleCardClick = useCallback(
    (project: ProjectType, cardElement: HTMLDivElement | null) => {
      selectedCardRef.current = cardElement;
      setSelectedProject(project);
    },
    []
  );

  const handleModalClose = useCallback(() => {
    setSelectedProject(null);
  }, []);

  const products = projects.filter((p) => p.type === "product");
  const experiments = projects.filter((p) => p.type === "experiment");

  return (
    <>
      <div
        className="w-full h-full px-2 sm:px-4 md:px-6 py-4 sm:py-6 overflow-y-auto scroll-smooth snap-y snap-mandatory custom-scrollbar"
        id="project-grid-scroll"
        role="region"
        aria-label="Project gallery"
      >
        <div className="max-w-7xl mx-auto pb-4 flex flex-col gap-8">
          {products.length > 0 && (
            <div className="snap-start">
              <SectionLabel>Products</SectionLabel>
              <CardGrid
                items={products}
                onCardClick={handleCardClick}
                onCardKeyDown={handleCardKeyDown}
              />
            </div>
          )}

          {experiments.length > 0 && (
            <div className="snap-start">
              <SectionLabel>Experiments</SectionLabel>
              <CardGrid
                items={experiments}
                onCardClick={handleCardClick}
                onCardKeyDown={handleCardKeyDown}
              />
            </div>
          )}
        </div>
      </div>

      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={handleModalClose}
        />
      )}
    </>
  );
};
