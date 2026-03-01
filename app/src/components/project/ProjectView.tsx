'use client'
import { projects } from "../../../common/data/projects"
import { Carousel, CarouselItem } from "../carousel/Carousel";
import { ProjectItem } from "./ProjectItem";

const sortedProjects = [...projects].sort((a, b) => {
  if (a.type === b.type) return 0;
  return a.type === "product" ? -1 : 1;
});

export const ProjectView = () => {
  return (
    <>
      <Carousel
        items={sortedProjects}
        renderItem={({ item, isSnapPoint }) => (
          <CarouselItem key={item.id} isSnapPoint={isSnapPoint}>
            <ProjectItem project={item} />
          </CarouselItem>
        )}
      />
    </>
  )
};
