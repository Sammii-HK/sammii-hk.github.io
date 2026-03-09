---
title: "Building a vertical snap carousel with touch-drag pagination"
description: I needed a vertical carousel for my portfolio that snaps cleanly between items and has pagination you can drag on mobile, without a 50kb library. Here's how I built it with CSS scroll-snap, a minimal React hook, and custom touch handling.
date: 2026-02-26
tags: [css, react, javascript, ux]
draft: false
---

I needed a vertical carousel for my portfolio that felt native: snaps cleanly between items, has pagination you can drag on mobile, and doesn't require a 50kb library to pull off.

Here's how I built it with CSS scroll-snap, a minimal React hook, and a bit of custom touch handling that makes the pagination sidebar actually pleasant to use.

## The CSS foundation

The whole thing starts with scroll-snap, which is more powerful than most developers realise.

```css
.scroll {
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
  height: 100%;
  scrollbar-width: none;
}

.scroll::-webkit-scrollbar {
  display: none;
}

.item {
  flex-shrink: 0;
  width: 100%;
  height: 100%;
}

.itemSnapPoint {
  scroll-snap-align: start;
}
```

`scroll-snap-type: y mandatory` tells the browser: when the user stops scrolling, always snap to the nearest snap point. `scroll-snap-align: start` on each item means the top of the item aligns with the top of the scroll container.

No JavaScript scroll handling. No scroll position calculations. The browser does all of it.

## The hook

Rather than reinvent the wheel, I used `react-snap-carousel`: a minimal hook that gives you the state you need without imposing any UI.

```jsx
import { useSnapCarousel } from 'react-snap-carousel';

const { scrollRef, pages, activePageIndex, goTo, snapPointIndexes } = useSnapCarousel({ axis: 'y' });
```

- `scrollRef` — attach to your scroll container
- `pages` — array of page index groups
- `activePageIndex` — which page is currently snapped
- `goTo(index)` — programmatic navigation
- `snapPointIndexes` — which indices are snap targets

The carousel itself is straightforward:

```jsx

  {projects.map((project, i) => (
    
      
    
  ))}

```

## The pagination animation: dots to numbers

The pagination sidebar is where the UI gets interesting. Each button shows a dot at rest and the page number when active. Instead of swapping elements, both live in the DOM simultaneously and transition with CSS.

```jsx
 goTo(i)}
  ref={(el) => (buttonRefs.current[i] = el)}
>
  
  {i + 1}

```

```css
.paginationButtonDot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.paginationButtonNumber {
  position: absolute;
  font-size: 14px;
  opacity: 0;
  transform: scale(0);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.paginationButtonActive .paginationButtonDot {
  opacity: 0;
  transform: scale(0);
}

.paginationButtonActive .paginationButtonNumber {
  opacity: 1;
  transform: scale(1);
}
```

The dot shrinks away as the number grows in. Both transitions happen simultaneously. No layout shift, no flicker.

## Touch-drag pagination: the interesting part

The bit I'm most pleased with is the touch-drag behaviour on the pagination sidebar. On mobile you can put your finger on the dots and drag up or down to scrub through the carousel, rather than tapping individual dots.

The key function is `getButtonIndexFromTouch`:

```js
const getButtonIndexFromTouch = (clientY) => {
  for (let i = 0; i < buttonRefs.current.length; i++) {
    const btn = buttonRefs.current[i];
    if (!btn) continue;
    const { top, bottom } = btn.getBoundingClientRect();
    const padding = 4;
    if (clientY >= top - padding && clientY <= bottom + padding) {
      return i;
    }
  }
  return null;
};
```

It loops through all the button refs, calls `getBoundingClientRect()` on each, and returns the index of the button whose hit area contains the touch position. The 4px padding gives a bit of forgiveness so you don't have to land exactly on the dot.

The touch handlers:

```js
const handleTouchStart = (e) => {
  const controls = controlsRef.current;
  if (!controls) return;
  const { top, bottom, left, right } = controls.getBoundingClientRect();
  const { clientX, clientY } = e.touches[0];
  if (clientX >= left && clientX <= right && clientY >= top && clientY <= bottom) {
    setIsDragging(true);
  }
};

const handleTouchMove = (e) => {
  if (!isDragging) return;
  const index = getButtonIndexFromTouch(e.touches[0].clientY);
  if (index !== null && index !== lastIndexRef.current) {
    lastIndexRef.current = index;
    goTo(index);
  }
};

const handleTouchEnd = () => setIsDragging(false);
```

`lastIndexRef` prevents redundant `goTo` calls as the touch moves across a single button's area. The start handler checks whether the initial touch is within the controls container before activating drag mode, so the main content stays scrollable.

## Responsive adjustments

On mobile the controls shrink down so they don't eat into the content area:

```css
@media (max-width: 768px) {
  .controls {
    right: 4px;
    gap: 4px;
  }

  .paginationButton {
    width: 24px;
    height: 24px;
  }

  .paginationButtonDot {
    width: 5px;
    height: 5px;
  }

  .paginationButtonNumber {
    font-size: 10px;
  }
}
```

The scroll container uses `calc(100vh - 160px)` as its max height to account for nav and footer, so nothing overflows on smaller screens.

## When CSS scroll-snap is enough

If you don't need the touch-drag pagination or programmatic `goTo`, you might not need a hook at all. Pure CSS scroll-snap with anchor links for navigation works fine for simple cases.

`react-snap-carousel` earns its place when you need the active page index exposed to React: to highlight the current dot, drive animations on the active slide, or tie other UI state to the scroll position. It's under 2kb minified with no dependencies beyond React. For that scope of problem, it's the right tool.

---


---
