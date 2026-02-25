---
title: "Building Accessibility That Actually Works, Not Checkbox Compliance"
description: Focus trapping, keyboard navigation, screen reader announcements, and reduced motion — built from the start, not bolted on at the end.
date: 2026-02-26
tags: [accessibility, react, webdev, a11y]
draft: false
---

Most developer portfolios tick the accessibility checkbox with `alt` tags and call it done. I built mine with proper focus management, keyboard navigation, screen reader support, and motion preferences. Not because a linter told me to, but because accessibility is engineering quality.

Here's what that actually looks like in code.

## Focus trapping in modals

When a modal opens, the entire page behind it should become inert. Most implementations skip this:

```typescript
useEffect(() => {
  if (!isOpen) return;

  const previouslyFocused = document.activeElement as HTMLElement;
  closeButtonRef.current?.focus();
  document.body.style.overflow = 'hidden';

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key !== 'Tab') return;

    const focusable = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable?.length) return;

    const first = focusable[0] as HTMLElement;
    const last = focusable[focusable.length - 1] as HTMLElement;

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => {
    document.removeEventListener('keydown', handleKeyDown);
    document.body.style.overflow = '';
    previouslyFocused?.focus();
  };
}, [isOpen, onClose]);
```

What this does:

1. **Stores the trigger element** — so focus can return when the modal closes.
2. **Moves focus to the close button** — keyboard users know they're inside the modal.
3. **Traps Tab/Shift+Tab** — focus cycles within the modal only.
4. **Escape closes** — standard expectation.
5. **Restores focus on close** — without this, keyboard users are stranded.
6. **Locks background scroll** — `overflow: hidden` prevents the page moving behind the modal.

### Screen reader announcement

```typescript
useEffect(() => {
  if (!isOpen) return;
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.className = 'sr-only';
  announcement.textContent = `${title} project details dialog opened`;
  document.body.appendChild(announcement);
  return () => announcement.remove();
}, [isOpen, title]);
```

A live region announces the modal title. The `sr-only` class hides it visually. Cleanup removes it so announcements don't stack.

## Keyboard navigation: the tablist pattern

The view toggle follows WAI-ARIA tablist:

```tsx
<div role="tablist" aria-label="View options">
  {options.map((option, index) => (
    <button
      role="tab"
      aria-selected={value === option.value}
      aria-controls={`panel-${option.value}`}
      tabIndex={value === option.value ? 0 : -1}
      onKeyDown={(e) => handleKeyDown(e, index)}
    >{option.label}</button>
  ))}
</div>
```

```typescript
const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
  let newIndex = index;
  switch (e.key) {
    case 'ArrowRight': case 'ArrowDown':
      newIndex = (index + 1) % options.length; break;
    case 'ArrowLeft': case 'ArrowUp':
      newIndex = (index - 1 + options.length) % options.length; break;
    case 'Home': newIndex = 0; break;
    case 'End': newIndex = options.length - 1; break;
    default: return;
  }
  e.preventDefault();
  onChange(options[newIndex].value);
};
```

Only the active tab is in the tab order (`tabIndex={0}`). Arrow keys move between tabs. Home/End jump to first/last. This matches browser-native tab interfaces.

## The grid: cards as list items

```tsx
<div role="region" aria-label="Projects">
  <div role="list">
    {projects.map(project => (
      <div
        role="listitem"
        tabIndex={0}
        aria-label={`${project.title}. Technologies: ${project.tech.join(', ')}. Press Enter to view details.`}
        aria-haspopup="dialog"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault(); openModal(project);
          }
        }}
      >{/* card content */}</div>
    ))}
  </div>
</div>
```

`aria-haspopup="dialog"` signals a modal will open. Both Enter and Space trigger it — matching native button behaviour.

## Reduced motion: the nuclear option

```css
@media (prefers-reduced-motion: reduce) {
  * {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
```

This kills every animation globally. Setting `0.01ms` instead of `0` ensures `transitionend` events still fire — so JavaScript callbacks don't break.

## focus-visible vs focus

```css
.focus-ring:focus { outline: none; }
.focus-ring:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}
```

`:focus-visible` only fires for keyboard navigation. Mouse users don't see outlines. Keyboard users get clear indicators. Both groups get what makes sense for their input method.

## Skip links

```css
.skip-link { position: absolute; top: -40px; left: 0; transition: top 0.2s; }
.skip-link:focus { top: 0; }
```

Hidden by default, appears on Tab. Lets keyboard users jump past navigation. Light/dark mode aware.

## Why this matters

If your modal doesn't trap focus, it's a bug. If your toggle doesn't respond to arrow keys, it's broken. If your animations ignore motion preferences, you're overriding a system-level accessibility setting.

Accessibility isn't a feature you add at the end. It's the same category as "buttons should be clickable" and "links should navigate". It's engineering quality.

The code samples here aren't theoretical. They're running in production. And they took about the same effort as building the visual design — because when you build accessibility in from the start, it's just part of the component architecture.

---

*I'm Sammii, founder of [Lunary](https://lunary.app) and indie developer building tools I actually want to use. I write about shipping products solo, the technical decisions behind them, and figuring it all out in public.*
