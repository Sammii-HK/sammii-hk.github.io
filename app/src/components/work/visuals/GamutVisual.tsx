import type { VisualProps } from "../Chapter";
import { GamutFragment } from "../GamutFragment";

// Gamut is the one project with a live fragment in V1. Static resting state
// is the same palette markup, server-rendered; the sliders enhance it.
export function GamutVisual({ fragment }: VisualProps) {
  return <GamutFragment interactive={!!fragment} />;
}
