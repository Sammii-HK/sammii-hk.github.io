'use client'
import { projects } from "../../common/data/projects"
import { Carousel, CarouselItem } from "./carousel/Carousel";
import { ProjectItem } from "./ProjectItem";

export const ProjectView = () => {  
  return (
    <>
      <Carousel
        items={projects}
        renderItem={({ item, isSnapPoint }) => (
          <CarouselItem key={item.id} isSnapPoint={isSnapPoint}>
            <ProjectItem project={item} />
          </CarouselItem>
        )}
      />
    </>
  )
};
