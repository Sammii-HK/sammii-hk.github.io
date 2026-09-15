import { Section } from "./Section";
import { EMAIL, GITHUB_URL_SAMMII, LINKEDIN_URL } from "../../../constants";

export const Contact = () => (
  <Section id="contact" title="Contact">
    <ul className="px-1 flex flex-wrap gap-x-6 gap-y-2 text-sm sm:text-base">
      <li>
        <a className="underline underline-offset-4 focus-ring rounded" href={`mailto:${EMAIL}`}>
          {EMAIL}
        </a>
      </li>
      <li>
        <a className="underline underline-offset-4 focus-ring rounded" href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">
          LinkedIn
        </a>
      </li>
      <li>
        <a className="underline underline-offset-4 focus-ring rounded" href={GITHUB_URL_SAMMII} target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
      </li>
      <li>
        <a className="underline underline-offset-4 focus-ring rounded" href="/sammii-kellow-cv.pdf">
          CV (PDF)
        </a>
      </li>
    </ul>
  </Section>
);
