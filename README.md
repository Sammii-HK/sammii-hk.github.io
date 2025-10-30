# Portfolio

**Live Site:** [sammii.dev](https://sammii.dev)

A portfolio showcasing my development projects with an interactive holographic gradient effect.

## About

This portfolio demonstrates my front-end development skills with a focus on clean design, smooth animations, and engaging user interactions. The standout feature is a dynamic holographic gradient effect that responds to cursor movement and scroll position in real-time.

## Technologies

- Next.js 14
- TypeScript
- Tailwind CSS
- React

## The Holographic Gradient Effect

The core feature of this portfolio is a custom gradient effect that creates a dynamic, holographic appearance on the site logo. The effect responds to both cursor/touch position and scroll position, creating a constantly evolving visual experience.

### How It Works

**1. Color Calculation from Position**

The gradient uses viewport position percentages (xPc and yPc, 0-100%) to calculate RGB values:

```typescript
const colourCreator = (number: number) => {
  return Math.floor((255 / 100) * Math.min(number, 100));
};

const colour1 = colourCreator(xPc);      // Based on X position
const colour2 = colourCreator(yPc);      // Based on Y position  
const colour3 = 255 - colourCreator(xPc); // Inverse of X for contrast
```

**2. Three Overlapping Radial Gradients**

Three strategically positioned radial gradients are layered to create depth and movement:

- **Top center** (50% 0): Uses `[R1, G3, B2]` color permutation
- **Bottom left** (6.7% 75%): Uses `[R3, G2, B1]` permutation
- **Bottom right** (93.3% 75%): Uses `[R2, G1, B3]` permutation

By interchanging the RGB values across gradients, colors appear to move around within the typography, creating the holographic effect.

**3. Scroll-Based Color Transitions**

When scrolling, colors don't simply map to scroll position—they use sinusoidal wave functions for dramatic transitions:

```typescript
// Calculate scroll percentage (0-100)
const scrollPercent = (scrollTop / maxScroll) * 100;

// Multiple sine waves create rich color cycles
const wave1 = Math.sin((scrollPercent / 100) * Math.PI * 6) * 50 + 50;  // 3 cycles
const wave2 = Math.cos((scrollPercent / 100) * Math.PI * 4) * 30;        // 2 cycles
const yPc = Math.max(0, Math.min(100, wave1 + wave2));

// X position also varies for additional dynamism
const xPc = Math.sin((scrollPercent / 100) * Math.PI * 2) * 25 + 50;
```

By combining two waves at different frequencies (3 and 2 cycles), interference patterns create many more apparent color transitions—far more than a simple linear mapping. The waves interact to produce a rich, constantly evolving color spectrum as you scroll.

**4. Smooth Interpolation**

To prevent jarring jumps when switching between cursor control and scroll control, linear interpolation smooths all transitions:

```typescript
// Linear interpolation at 0.2 factor (20% per frame)
const lerp = (current, target, factor) => current + (target - current) * factor;
```

This runs continuously via `requestAnimationFrame`, ensuring 60fps smooth transitions.

### Technical Implementation

- **Multi-input System:** Unified handling of pointer events (desktop) and touch events (mobile)
- **Event Coordination:** Scroll takes priority over cursor; smooth handoff between input methods
- **Performance:** Passive event listeners, `requestAnimationFrame` for updates, CSS gradients (no canvas overhead)
- **Responsive:** Works seamlessly on desktop, tablet, and mobile with proper touch event handling

## Design Philosophy

Clean, minimal, and gallery-focused—the design puts projects front and center while the gradient effect adds a subtle, engaging element that showcases technical capability.

---

*Built with attention to detail, performance, and user experience.*
