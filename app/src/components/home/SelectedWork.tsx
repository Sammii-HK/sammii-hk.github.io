import { Section } from "./Section";
import { ProjectGrid } from "../project/ProjectGrid";

/**
 * Section boundary only. The three temporary card grids inside ProjectGrid
 * stay until Phase 2E replaces them with the featured / supporting hierarchy.
 */
export const SelectedWork = () => (
  <Section id="work" title="Selected work" headingClassName="sr-only">
    <ProjectGrid />
  </Section>
);
