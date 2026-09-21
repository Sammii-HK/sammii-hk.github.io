/**
 * What changing a CSS property costs the renderer, for Blink (Chromium):
 * whether it forces layout, paint, or only a composite. Categories follow
 * Chromium's rendering pipeline documentation and the csstriggers data
 * (a snapshot, 2019); browsers keep moving properties down the list.
 */
export type Cost = "layout" | "paint" | "composite";
export type Prop = { name: string; cost: Cost; group: string; note?: string };

export const COSTS: { id: Cost; label: string; what: string }[] = [
  { id: "layout", label: "Layout", what: "Geometry changes, so the browser recomputes positions and sizes (possibly of the whole tree), then repaints and composites. The expensive one." },
  { id: "paint", label: "Paint", what: "Pixels change but geometry does not: the affected layers are rasterised again, then composited." },
  { id: "composite", label: "Composite only", what: "Nothing is re-laid-out or repainted; the compositor moves or blends existing layers on the GPU. The cheap one, and the only one that stays smooth off the main thread." },
];

export const PROPS: Prop[] = [
  // composite only
  { name: "transform", cost: "composite", group: "Motion", note: "Move, scale, rotate, skew: the compositor applies it to the layer. This is how to animate position." },
  { name: "opacity", cost: "composite", group: "Motion", note: "Blended on the GPU. The other property safe to animate." },
  { name: "filter", cost: "composite", group: "Effects", note: "Composited when the element has its own layer; otherwise a paint." },
  { name: "will-change", cost: "composite", group: "Motion", note: "A hint to promote the element to its own layer ahead of an animation. Overuse costs memory." },
  { name: "backdrop-filter", cost: "composite", group: "Effects", note: "GPU blur of what is behind the layer; cheap to move, expensive in area." },
  { name: "clip-path", cost: "composite", group: "Effects", note: "Composited for simple shapes on a promoted layer; paints otherwise." },
  // paint
  { name: "color", cost: "paint", group: "Text" },
  { name: "background-color", cost: "paint", group: "Background" },
  { name: "background-image", cost: "paint", group: "Background" },
  { name: "background-position", cost: "paint", group: "Background" },
  { name: "background-size", cost: "paint", group: "Background" },
  { name: "border-color", cost: "paint", group: "Borders" },
  { name: "border-radius", cost: "paint", group: "Borders", note: "Rounded corners are paint, but on a composited layer they can force an expensive mask." },
  { name: "border-style", cost: "paint", group: "Borders" },
  { name: "box-shadow", cost: "paint", group: "Effects", note: "A blurred shadow is a large paint; animate opacity of a pseudo-element with the shadow instead." },
  { name: "outline", cost: "paint", group: "Borders" },
  { name: "text-decoration", cost: "paint", group: "Text" },
  { name: "text-shadow", cost: "paint", group: "Text" },
  { name: "visibility", cost: "paint", group: "Box" },
  { name: "cursor", cost: "paint", group: "Box" },
  { name: "accent-color", cost: "paint", group: "Box" },
  { name: "caret-color", cost: "paint", group: "Text" },
  // layout
  { name: "width", cost: "layout", group: "Box" },
  { name: "height", cost: "layout", group: "Box" },
  { name: "min-width", cost: "layout", group: "Box" },
  { name: "max-width", cost: "layout", group: "Box" },
  { name: "padding", cost: "layout", group: "Box" },
  { name: "margin", cost: "layout", group: "Box" },
  { name: "border-width", cost: "layout", group: "Borders" },
  { name: "top", cost: "layout", group: "Position", note: "Animating top or left lays out every frame. Use transform: translate() instead." },
  { name: "left", cost: "layout", group: "Position" },
  { name: "right", cost: "layout", group: "Position" },
  { name: "bottom", cost: "layout", group: "Position" },
  { name: "position", cost: "layout", group: "Position" },
  { name: "display", cost: "layout", group: "Box", note: "Changes the box type, so the subtree is rebuilt." },
  { name: "float", cost: "layout", group: "Position" },
  { name: "font-size", cost: "layout", group: "Text", note: "Every line re-wraps." },
  { name: "font-family", cost: "layout", group: "Text" },
  { name: "font-weight", cost: "layout", group: "Text", note: "Different glyph widths, so text re-flows. Variable-font weight animates but still lays out." },
  { name: "line-height", cost: "layout", group: "Text" },
  { name: "letter-spacing", cost: "layout", group: "Text" },
  { name: "text-align", cost: "layout", group: "Text" },
  { name: "white-space", cost: "layout", group: "Text" },
  { name: "vertical-align", cost: "layout", group: "Text" },
  { name: "overflow", cost: "layout", group: "Box" },
  { name: "flex", cost: "layout", group: "Flex and grid" },
  { name: "flex-direction", cost: "layout", group: "Flex and grid" },
  { name: "justify-content", cost: "layout", group: "Flex and grid" },
  { name: "align-items", cost: "layout", group: "Flex and grid" },
  { name: "gap", cost: "layout", group: "Flex and grid" },
  { name: "grid-template-columns", cost: "layout", group: "Flex and grid" },
  { name: "grid-template-rows", cost: "layout", group: "Flex and grid" },
  { name: "order", cost: "layout", group: "Flex and grid" },
  { name: "aspect-ratio", cost: "layout", group: "Box" },
  { name: "box-sizing", cost: "layout", group: "Box" },
];
