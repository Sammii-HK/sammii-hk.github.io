---
title: "One component, two layouts: the dual view pattern in React"
description: My portfolio has two completely different layouts that share one component and one data file. Here's the dual view pattern that makes it possible.
date: 2026-03-01
tags: [react, webdev, design, typescript]
draft: false
---

My portfolio has two completely different layouts. A grid of cards that open into modals. A full-screen vertical carousel with snap scrolling. They look nothing alike and behave nothing alike.

They share one component and one data file.

That pattern is worth writing about.

## The shared data layer

Everything starts with `projects.js`: a flat array of objects, one per project. Four fields each: `id`, `title`, `techStack`, `info`. Both views import it directly. Neither knows the other exists.

```js
export const projects = [
  {
    id: "lunary",
    title: "Lunary",
    techStack: "Next.js, Prisma, PostgreSQL",
    info: "A real-time astrology platform with birth charts, transit tracking, and synastry analysis.",
  },
  // ...
];
```

The `id` doubles as the GitHub repo slug, the image filename key, and the React list key. One field, three uses. That's a different article — the point here is that a single import drives both views.

## ProjectItem: one component, two faces

The component takes an `isGrid` boolean prop. That one prop controls everything about how it renders.

```tsx
interface ProjectItemProps {
  project: Project;
  isGrid: boolean;
}

export function ProjectItem({ project, isGrid }: ProjectItemProps) {
  if (isGrid) {
    return (
      
        
        
          {project.title}
          {project.info}
          {project.techStack}
          [Code]({`https://github.com/sammii-hk/${project.id}`})
        
      
    );
  }

  return (
    
      
        
          
            ## {project.title}

            [Code]({`https://github.com/sammii-hk/${project.id}`})
          
          
          {project.info}

          {project.techStack}
        
      
    
  );
}
```

Grid mode: compact card, description truncated on mobile, smaller code button, image above content. Carousel mode: full-width 12-column layout, title and code link on the same row, full description, no truncation.

Same data. Same component. Two completely different outputs.

## Grid view: cards and modals

`ProjectGrid` renders a CSS grid and makes each card clickable, opening a `ProjectModal` for the full details.

```tsx
export function ProjectGrid() {
  const [selected, setSelected] = useState(null);

  return (
    <>
      
        {projects.map((project) => (
           setSelected(project)}>
            
          
        ))}
      
      {selected && (
         setSelected(null)} />
      )}
    
  );
}
```

The grid is the browsing surface. The modal is the detail view. The card itself stays compact — its job is to catch your eye, not to tell you everything.

## Carousel view: full-screen snap

`ProjectView` wraps the same component in a vertical scroll-snap carousel. No modal needed here — each slide IS the full view.

```tsx
export function ProjectView() {
  const { scrollRef, activePageIndex, goTo, snapPointIndexes } =
    useSnapCarousel({ axis: "y" });

  return (
    
      {projects.map((project, i) => (
        
          
        
      ))}
    
  );
}
```

The carousel mode has room to breathe. Full-width image, full description, no clipping. The density trade-off is intentional: the grid lets you scan, the carousel lets you read.

## ViewToggle: persisted preference

The toggle between views uses `localStorage` so it sticks between sessions.

```tsx
export function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    
       onChange("grid")}
      >
        
      
       onChange("list")}
      >
        -       
    
  );
}
```

In the parent:

```tsx
const [view, setView] = useState<"grid" | "list">(() => {
  if (typeof window === "undefined") return "grid";
  return (localStorage.getItem("portfolioView") as "grid" | "list") ?? "grid";
});

const handleViewChange = (next: "grid" | "list") => {
  setView(next);
  localStorage.setItem("portfolioView", next);
};
```

The SSR guard (`typeof window !== 'undefined'`) prevents a hydration mismatch on first render. The `tablist` role and `aria-selected` give screen readers the right semantics.

## When this pattern works

This works well when:

- The same data needs different densities (list vs grid vs card)
- The same data serves different interaction models (browse vs deep-dive)
- You want mobile and desktop to feel fundamentally different without duplicating state
- The two layouts are genuinely complementary rather than redundant

The portfolio use case is a good fit because the data is identical in both views — the difference is entirely presentational. Grid is for scanning. Carousel is for reading. Same projects, different intentions.

## When to split into separate components instead

The pattern breaks down when:

- The prop branching gets deeply nested. If `isGrid` starts controlling more than layout — data fetching, event handling, child components — you have two components wearing one coat. Split them.
- Performance matters. Both branches of `ProjectItem` render on every mount even if only one is shown. For large lists or heavy components, lazy-loading separate implementations is worth the duplication.
- The data shapes diverge. If the grid needs a summary and the carousel needs the full object, the shared component will grow an awkward prop surface. Two components sharing a type is cleaner than one component doing too much.

The rule of thumb: one component, two layouts works when the branching is shallow and the data is identical. The moment you find yourself passing `isGrid` three levels deep, reach for composition instead.

---


---
