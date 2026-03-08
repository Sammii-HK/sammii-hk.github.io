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

## Interactive Card Border Glow

Project cards feature a cursor-reactive border glow that complements the header gradient.

### How It Works

**1. Cursor Position Tracking**

Each card tracks the cursor position within its bounds as a percentage (0-100% on each axis):

```typescript
const rect = e.currentTarget.getBoundingClientRect();
cardXPcRef.current = ((e.clientX - rect.left) / rect.width) * 100;
cardYPcRef.current = ((e.clientY - rect.top) / rect.height) * 100;
```

**2. Animated Pastel Border**

A `requestAnimationFrame` loop layers sinusoidal waves on top of the cursor position to create a continuously shifting pastel border colour:

```typescript
const cv = (n: number) => 140 + Math.floor((115 / 100) * Math.max(0, Math.min(100, n)));
const t = performance.now() / 1000;
const rPc = Math.max(0, Math.min(100, cardXPcRef.current + Math.sin(t * 1.1) * 28));
const gPc = Math.max(0, Math.min(100, cardYPcRef.current + Math.cos(t * 0.7) * 22));
const bPc = 100 - rPc;
hoveredCardRef.current.style.borderColor = `rgb(${cv(rPc)} ${cv(gPc)} ${cv(bPc)} / 70%)`;
```

The `cv` function floors each RGB channel at 140, keeping the palette pastel and harmonious with the header gradient. Two sine waves at different frequencies (1.1 and 0.7) create organic, non-repeating colour drift that responds to where you hover on the card.

**3. Clean Exit**

On mouse leave the border colour resets to the default, and the animation loop only computes colours when a card is actively hovered.

## Image Optimisation

Project screenshots are served at 2800x1400 (2:1 ratio at 2x density). On Vercel, Next.js image optimisation automatically serves WebP at the correct size for each viewport via the `sizes` prop. The first six cards use `priority` for faster LCP.

## Design Philosophy

Clean, minimal, and gallery-focused. The design puts projects front and centre while the gradient and glow effects add subtle, engaging elements that showcase technical capability without overwhelming the content.

---

*Built with attention to detail, performance, and user experience.*
