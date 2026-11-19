import { ExplorationStage } from '../../../labs/explorations/ExplorationStage';
import { ExplorationSignals } from '../../../labs/explorations/ExplorationSignals';
import { EXPLORATIONS } from '../../../labs/explorations/registry';

/** The article and standalone page mount the same original experiment. */
export function InteractiveExploration({ slug }: { slug: string }) {
  const exploration = EXPLORATIONS.find((item) => item.slug === slug);
  if (!exploration) return null;
  return (
    <section className="not-prose my-10" data-exploration-slug={slug} aria-label={`Interactive: ${exploration.title}`}>
      <ExplorationSignals slug={slug} />
      <ExplorationStage slug={slug} compact />
    </section>
  );
}
