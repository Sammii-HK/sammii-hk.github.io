import type { VisualProps } from "../Chapter";
import { Screenshot } from "../Chapter";

// The AI lens is about the AI response, so it shows the AI response: a real
// recorded run replayed on prism.sammii.dev/ai-response. Other lenses keep the
// component library screenshot.
const AI_RESPONSE = "/assets/images/prism-ai-response.webp";

export function PrismVisual({ lens, image, title, priority }: VisualProps) {
  if (lens === "ai") return <Screenshot image={AI_RESPONSE} title={`${title} AI response`} priority={priority} />;
  return <Screenshot image={image} title={title} priority={priority} />;
}
