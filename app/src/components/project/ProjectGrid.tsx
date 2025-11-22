"use client";
import { projects } from "../../../common/data/projects";
import { ProjectItem } from "./ProjectItem";

export const ProjectGrid = () => {
  return (
    <div
      className="w-full mt-16 px-4 md:px-6 py-8 overflow-y-auto h-full"
      id="project-grid-scroll"
    >
      <div className="max-w-7xl mx-auto pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-lg overflow-hidden border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 transition-all hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-white/5 group flex flex-col"
            >
              <ProjectItem project={project} isGrid={true} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
