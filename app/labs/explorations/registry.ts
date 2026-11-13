import catalogue from "./catalogue.json";

export type Exploration = {
  id: string;
  moduleFamily: "world" | "sky" | "clock" | "lab" | "evolution";
  slug: string;
  title: string;
  topic: string;
  category: string;
  seoTitle: string;
  description: string;
  intro: string;
  instructions: string[];
  explanation: string;
  limitations: string;
  readouts: string[];
  sources: { label: string; url: string }[];
  relatedIds: string[];
  caption: string;
};

export const COLLECTION = catalogue.collection;
export const EXPLORATIONS: Exploration[] = catalogue.items.map((item) => ({
  ...item,
  moduleFamily: item.moduleFamily as Exploration["moduleFamily"],
  readouts: "readouts" in item ? item.readouts as string[] : [],
  caption: item.limitations,
}));

export const explorationHref = (slug: string) => `https://labs.sammii.dev/explorations/${slug}/`;
export const explorationImage = (slug: string) => `https://labs.sammii.dev/exploration-runtime/cards/${slug}.png`;
export const getExploration = (slug: string) => EXPLORATIONS.find((item) => item.slug === slug);
export const getRelatedExplorations = (item: Exploration) => item.relatedIds
  .map((id) => EXPLORATIONS.find((other) => other.id === id))
  .filter((other): other is Exploration => Boolean(other));

export const EXPLORATION_CATEGORIES = ["Light and time", "Quantum", "Worlds", "Skies", "Sound and pattern"];

export function explorationJsonLd(item: Exploration) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": explorationHref(item.slug),
        url: explorationHref(item.slug),
        name: item.title,
        description: item.description,
        inLanguage: "en-GB",
        author: { "@type": "Person", name: COLLECTION.author.name, url: COLLECTION.author.url },
        about: { "@type": "Thing", name: item.topic },
        isPartOf: { "@type": "CollectionPage", name: "Explorations", url: "https://labs.sammii.dev/explorations/" },
        image: { "@type": "ImageObject", url: explorationImage(item.slug), width: 1600, height: 900 },
        citation: item.sources.map((source) => source.url),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Labs", item: "https://labs.sammii.dev/" },
          { "@type": "ListItem", position: 2, name: "Explorations", item: "https://labs.sammii.dev/explorations/" },
          { "@type": "ListItem", position: 3, name: item.title, item: explorationHref(item.slug) },
        ],
      },
    ],
  };
}
