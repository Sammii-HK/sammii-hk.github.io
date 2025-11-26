"use client";
import { useState, useCallback, useRef } from "react";
import { projects } from "../../../common/data/projects";
import { ProjectItem } from "./ProjectItem";
import { ProjectModal } from "./ProjectModal";

type ProjectType = {
  id: string;
  title: string;
  techStack: string;
  info: string;
};

export const ProjectGrid = () => {
  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(null);
  const selectedCardRef = useRef<HTMLDivElement | null>(null);

  // Handle keyboard activation of cards
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

  return (
    <>
      <div
        className="w-full h-full px-2 sm:px-4 md:px-6 py-4 sm:py-6 overflow-y-auto scroll-smooth snap-y snap-mandatory custom-scrollbar"
        id="project-grid-scroll"
        role="region"
        aria-label="Project gallery"
      >
        <div className="max-w-7xl mx-auto pb-4">
          <div 
            className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 md:gap-6"
            role="list"
            aria-label="Projects"
          >
            {projects.map((project, index) => (
              <div
                key={project.id}
                role="listitem"
                tabIndex={0}
                aria-label={`${project.title}. ${project.techStack}. Click to view details.`}
                aria-haspopup="dialog"
                className="bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-lg overflow-hidden border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 transition-all hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-white/5 group flex flex-col cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white focus-visible:ring-offset-2 snap-start"
                onClick={(e) => handleCardClick(project, e.currentTarget)}
                onKeyDown={(e) => handleCardKeyDown(e, project, e.currentTarget)}
              >
                <ProjectItem project={project} isGrid={true} />
              </div>
            ))}
          </div>
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

