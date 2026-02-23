---
title: How I Made My Portfolio Infinitely Extendable with 4 Lines of JSON
description: Adding a new project to my portfolio takes 30 seconds. No component changes. No new routes. No layout adjustments. Just 4 lines of JSON and an image dropped into a folder.
date: 2026-02-21
tags: [javascript, react, webdev, portfolio]
draft: false
---

Adding a new project to my portfolio takes 30 seconds. No component changes. No new routes. No layout adjustments. Just 4 lines of JSON and an image dropped into a folder.

I got tired of the typical portfolio maintenance cycle: build something cool, then spend an hour wiring it into your portfolio site, adjusting layouts, making sure the new card doesn't break the grid. So I designed mine to be completely data-driven from the start.

Here's how it works.

## The Single Source of Truth

Every project on my portfolio lives in one file: `projects.js`. Each project is an object with exactly 4 fields:

```js
{
  id: 'crystal-index',
  title: 'Crystal Index',
  techStack: 'TypeScript, Next.js, Prisma, SQL, GPT4, React 3 Fiber',
  info: 'Custom CMS for cataloguing crystals with structured filters for colour, chakra, and properties, and GPT-4-generated descriptions.',
}
```

That's it. Four lines. The entire portfolio renders from an array of these objects.

## The ID Does Triple Duty

The `id` field is where the design gets interesting. It's not just an identifier. It serves three purposes simultaneously:

1. **GitHub link path.** The portfolio constructs repository URLs by appending the ID to a base GitHub URL. `crystal-index` becomes `https://github.com/sammii-hk/crystal-index`. No separate URL field needed.

2. **Image filename lookup.** An auto-generated image map resolves the ID to the correct image file and extension. `crystal-index` maps to `/assets/images/crystal-index.jpg`. No manual image path configuration.

3. **React key.** The ID serves as the unique key when mapping over the array. Standard React pattern, but it comes free because the ID already exists for the other two purposes.

One field, three jobs. This means there's no redundant data, no fields that can fall out of sync, and no opportunity for a GitHub link to point to the wrong repo because the image and the link derive from the same source.

For projects under a GitHub organisation, the ID includes the org path: `unicorn-poo/succulent`. The image utility handles this by splitting on `/` and taking the last segment for the filename lookup, while the full path constructs the correct GitHub URL.

## Auto-Generated Image Map

I didn't want to manually track whether each project screenshot is a `.jpg` or `.png`. So I wrote a build script that scans the images directory and generates a JSON map:

```js
import { readdir, writeFile } from 'fs/promises';
import { join } from 'path';

const imagesDir = join(process.cwd(), 'public', 'assets', 'images');

async function generateImageMap() {
  const files = await readdir(imagesDir);
  const imageMap = {};

  files.forEach(file => {
    if (file === 'sammii.png') return;
    const name = file.replace(/\.(jpg|png)$/, '');
    const ext = file.endsWith('.png') ? 'png' : 'jpg';
    if (!imageMap[name]) imageMap[name] = ext;
  });

  const outputPath = join(process.cwd(), 'app', 'common', 'utils', 'image-map.json');
  await writeFile(outputPath, JSON.stringify(imageMap, null, 2));
}

generateImageMap();
```

The output is a simple lookup:

```json
{
  "crystal-index": "jpg",
  "lunary": "png",
  "succulent": "png",
  "day-lite": "jpg"
}
```

Then a utility function resolves any project ID to its full image path:

```js
import imageMapData from './image-map.json';
const imageMap = imageMapData;

export const getImagePath = (projectId) => {
  const projectBaseId = projectId.split('/').pop() || projectId;
  const extension = imageMap[projectBaseId] || 'jpg';
  return `/assets/images/${projectBaseId}.${extension}`;
};
```

Drop an image in the folder, run the script, done. The portfolio picks it up automatically.

## Zero Component Changes

The portfolio has two completely different view modes: a responsive grid with click-to-expand modals, and a full-screen vertical carousel. Both consume the exact same projects array.

The grid view maps over the array and renders cards:

```jsx
{projects.map((project) => (
  <div key={project.id} onClick={() => setSelectedProject(project)}>
    <ProjectItem project={project} isGrid={true} />
  </div>
))}
```

The carousel view maps over the same array and renders full-width slides:

```jsx
<Carousel
  items={projects}
  renderItem={({ item, isSnapPoint }) => (
    <CarouselItem key={item.id} isSnapPoint={isSnapPoint}>
      <ProjectItem project={item} />
    </CarouselItem>
  )}
/>
```

`ProjectItem` accepts an `isGrid` prop that switches between compact card layout and expanded layout. Same component, same data, two presentations. Adding a project to the array means it automatically appears in both views with no additional work.

## The 30-Second Workflow

When I finish a new project, here's what I actually do:

1. Take a screenshot
2. Drop it in `/public/assets/images/` as `project-name.png`
3. Run `node scripts/generate-image-map.mjs`
4. Add 4 lines to `projects.js`
5. Push to GitHub

The portfolio rebuilds and the new project appears in both views, with the correct image, the correct GitHub link, and the correct layout. Five steps, thirty seconds, zero component files touched.

## The Philosophy Behind It

This isn't just about saving time on a portfolio. It's a pattern I use everywhere.

My astrology app [Lunary](https://lunary.app) has a grimoire with over 2,000 articles. They're stored as structured data and rendered through shared components. Adding a new article about a crystal or a tarot card doesn't require touching any UI code.

My publishing tool Spellcast manages multiple social media accounts and platforms. Account configurations are data objects. Adding a new platform means adding to the config, not rebuilding the interface.

The principle is always the same: separate data from presentation. Make the data structure do the heavy lifting. Keep the components generic enough that they never need to know about specific content.

If you're spending more time wiring new content into your portfolio than building the projects themselves, you've got the architecture backwards. Make your portfolio work for you, not the other way around.

---

*I'm Sammii, founder of [Lunary](https://lunary.app) - an astrology app that actually teaches you to read your own birth chart. I write about the technical decisions behind building products as a solo developer. Follow along on [Hashnode](https://sammii.hashnode.dev) or check out the code on [GitHub](https://github.com/sammii-hk).*
