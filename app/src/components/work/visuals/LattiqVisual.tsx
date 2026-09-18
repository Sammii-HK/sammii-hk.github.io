import type { VisualProps } from "../Chapter";
import { Screenshot } from "../Chapter";

// Local state becoming shared state. Two clients, each with its own IndexedDB
// copy, converging through Yjs CRDTs over a WebSocket room. Static; the only
// motion is a slow pulse on the sync line, off under reduced motion.
export function LattiqVisual({ image, title, priority }: VisualProps) {
  return (
    <div className="lattiq">
      <div className="lattiq-sync" aria-label="Two local documents converging through CRDT sync">
        <span className="lattiq-node">
          <span className="lattiq-node-head">Client A</span>
          <span className="lattiq-node-body">IndexedDB · saves every keystroke, works offline</span>
        </span>
        <span className="lattiq-link" aria-hidden="true">
          <span className="lattiq-link-label">Yjs CRDTs · WebSocket room</span>
        </span>
        <span className="lattiq-node">
          <span className="lattiq-node-head">Client B</span>
          <span className="lattiq-node-body">same document, its own local copy, merged without conflicts</span>
        </span>
      </div>
      <div className="lattiq-shot">
        <Screenshot image={image} title={title} priority={priority} />
      </div>
    </div>
  );
}
