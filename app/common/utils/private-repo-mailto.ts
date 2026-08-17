import { EMAIL } from "../../constants";

export const getPrivateRepoMailto = (projectTitle: string): string => {
  const subject = encodeURIComponent(`Code access request: ${projectTitle}`);
  return `mailto:${EMAIL}?subject=${subject}`;
};
