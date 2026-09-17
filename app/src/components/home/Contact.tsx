import { EMAIL, GITHUB_URL_SAMMII, LINKEDIN_URL } from "../../../constants";

/** Contact (Phase 2G). One line of intent, four real links, nothing else. */
export const Contact = () => (
  <section id="contact" aria-labelledby="contact-heading" className="contact">
    <h2 id="contact-heading" className="section-eyebrow">
      Contact
    </h2>
    <p className="contact-line">
      Looking for a senior or staff design engineering role, London or remote. The fastest way to reach me is email.
    </p>
    <ul className="contact-links">
      <li><a href={`mailto:${EMAIL}`}>{EMAIL}</a></li>
      <li><a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">LinkedIn <span aria-hidden="true">↗</span></a></li>
      <li><a href={GITHUB_URL_SAMMII} target="_blank" rel="noopener noreferrer">GitHub <span aria-hidden="true">↗</span></a></li>
      <li><a href="/sammii-kellow-cv.pdf">CV, PDF</a></li>
    </ul>
  </section>
);
