## Components

Saer found 198 component definition(s) in the scanned packages (158 exported) and 366 component use site(s): 210 resolved to a definition in the scanned packages, 0 to one in another workspace package, 140 to third-party packages, 12 rendered through a variable or prop, and 0 UNRESOLVED (100% of the use sites Saer could follow were resolved).

Found **2 exact-name duplicate(s)**, **0 variant finding(s)**, **0 component(s) overridden at use sites**, **5 unused component(s)** and **0 experimental near-duplicate(s)**. 0 component(s) are used only in stories or tests; 0 could not be judged (UNKNOWN).

### Most used components

Components defined in product code, by JSX uses.

| Component | Defined in | JSX uses | Files |
|---|---|---|---|
| `LabsShell` | `app/src/components/labs/LabsShell.tsx:13` | 41 | 41 |
| `Heading` | `app/src/components/case-study/CaseStudyBlocks.tsx:21` | 8 | 1 |
| `Md` | `app/src/components/case-study/CaseStudyBlocks.tsx:19` | 8 | 1 |
| `Screenshot` | `app/src/components/work/Chapter.tsx:29` | 7 | 7 |
| `SiteShell` | `app/src/components/site/SiteShell.tsx:14` | 5 | 5 |
| `Box` | `app/src/components/charts/EventLoop.tsx:134` | 4 | 1 |
| `Knob` | `app/src/components/charts/KeypressFlow.tsx:73` | 4 | 1 |
| `Knob` | `app/src/components/charts/Retina.tsx:296` | 4 | 1 |
| `EnvironmentProvider` | `app/src/components/env/EnvironmentProvider.tsx:43` | 4 | 4 |
| `Headline` | `app/src/components/hero-lab/Headline.tsx:13` | 4 | 1 |
| `MediaItem` | `app/src/components/case-study/CaseStudyBlocks.tsx:23` | 3 | 1 |
| `Knob` | `app/src/components/charts/Now.tsx:256` | 3 | 1 |
| `Support` | `app/src/components/hero-lab/Support.tsx:17` | 3 | 1 |
| `Annotation` | `app/src/components/hero-lab/compositions.tsx:27` | 3 | 1 |
| `CtaLink` | `app/[hub]/page.tsx:62` | 2 | 1 |

### Duplicate components (same exported name)

The same exported component name defined in more than one file. Deterministic: the name is defined twice. Whether the definitions do the same job is not: the evidence for each pair (rendered root, shared props, JSX tree similarity) is shown so you can judge. Local copies of a library component (copied in from a component registry, with a `components.json`) are listed last and may be intentional.

#### `Breadcrumbs` (2 definitions)

`Breadcrumbs` is exported from 2 files. A shared name is not proof of a shared role: the evidence for each pair is below.

- `app/src/components/Breadcrumbs.tsx:3`: 2 JSX use(s), renders a fragment (`<>`)
- `app/src/components/site/Breadcrumbs.tsx:6`: 2 JSX use(s), renders `<Breadcrumbs>` (project component in `app/src/components/Breadcrumbs.tsx`)

- `app/src/components/Breadcrumbs.tsx` and `app/src/components/site/Breadcrumbs.tsx`: different rendered roots (a fragment (`<>`) and `<Breadcrumbs>` (project component in `app/src/components/Breadcrumbs.tsx`)); 0 shared prop(s); JSX tree similarity 0.00

#### `LensPhrase` (2 definitions)

`LensPhrase` is exported from 2 files. A shared name is not proof of a shared role: the evidence for each pair is below.

- `app/src/components/hero-lab/LensPhrase.tsx:16`: 1 JSX use(s), renders `<a>`
- `app/src/components/lens/LensPhrase.tsx:13`: 1 JSX use(s), renders `<a>`

- `app/src/components/hero-lab/LensPhrase.tsx` and `app/src/components/lens/LensPhrase.tsx`: same rendered root `<a>`; 1 shared prop(s) (lens); JSX tree similarity 1.00

### Variants

Values passed to variant props (`variant`, `size`, `intent`, `color`, `tone`, and every key of a `cva`/`tv` definition) compared with the values the component declares (its `cva`/`tv` definition or a string-literal union type). Deterministic. A value is called unused only when every use passes a literal Saer can read, the default is accounted for, and no unscanned package in reach passes it. A value TypeScript already checks is never reported as undeclared (a mismatch there means Saer misread the type).

No declared-versus-used mismatch found.


Variant values in use (the components with the most distinct values first):

| Component | Prop | Declared | Used (uses) | Not passed | Unreadable |
|---|---|---|---|---|---|
| `CtaLink` | `variant` | `primary`, `secondary` | `primary` (1), `secondary` (1) | 0 | 0 |

### One-off overrides

Use sites of a shared component (used in two or more files) that pass a `className` or `style` setting a property the component's own styling already sets, under the same variant (`hover:`, `md:` ...): places where the component is not giving its users what they need. Classes for properties it does not set (`mt-4`, `w-full`) are additions, not overrides. Deterministic over the class names written in the code; tests, stories and generated files never count.

None found.


### Unused components

Exported components with no JSX use, no reference as a value, no dynamic import of their module, no string that could select them, no unresolved import that could be them, not part of a library package's public exports, and no mention in the workspace packages in reach that were not scanned. Framework entry points (`page.tsx`, `pages/`, `layout.tsx` ...) and email, OG, test, story and generated files are never checked.

- `ColumnsContainer` in `app/src/components/ColumnsContainer.tsx:3`
- `GlowButton` in `app/src/components/GlowButton.tsx:16`
- `ViewToggle` in `app/src/components/ViewToggle.tsx:12`
- `Carousel` in `app/src/components/carousel/Carousel.tsx:21`
- `CarouselItem` in `app/src/components/carousel/Carousel.tsx:138`

### Experimental: near-duplicates

**EXPERIMENTAL.** Inferred from structure, not deterministic. Two components with different names that render the same root element, have a compatible API (shared props) and a near-identical JSX tree of some size. They may be one component written twice; compare them before merging anything. Three or more alike are shown once, as a family: often one interface implemented on purpose. Composition (one renders the other, or both wrap the same project component) and icons are never paired.

None found.


### What Saer could not establish (components)

Every component use site and internal import Saer followed was resolved.

### Component library evidence

- Lucide: OBSERVED_IMPORT, 116 JSX uses. Evidence: `package.json`
- Prism: OBSERVED_DECLARED_ORIGIN, 1 JSX uses. Evidence: `saer.components.json`, `app/src/components/prism/Select.tsx`
  Local file integrity and use are verified. Upstream attribution is declared by this repository, not independently authenticated.

### Components coverage

- Files read: 262 in the scanned packages, 0 more reached through imports
- Internal imports resolved: 484/484 (100%)
- Third-party component packages (most used): `lucide-react` (116), `next` (18), `next-mdx-remote` (3), `react` (2), `@vercel/analytics` (1)
- Definitions in files that never produce findings: og image 5

