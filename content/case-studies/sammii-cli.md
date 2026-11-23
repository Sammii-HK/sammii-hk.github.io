---
title: "sammii-cli"
description: "A portfolio you run instead of visit: npx sammii opens a gradient header, a keyboard menu and colour-coded project cards, rendered by React into the terminal with Ink"
techStack: "Node.js, React, Ink, ink-select-input, ink-gradient"
---

## The idea

A portfolio almost always means a browser tab, so much so that the format goes unquestioned. But developers spend a lot of their day somewhere else: the terminal. I wanted a version of my portfolio that someone could run from where they already are, with one command and nothing to install:

```bash
npx sammii
```

It is published on npm as [`sammii`](https://www.npmjs.com/package/sammii), currently at version 1.0.1, and the source is on [GitHub](https://github.com/Sammii-HK/sammii-cli). Running it draws a gradient header with my name in block letters, a small menu, and views for an about section, my projects and my links.

The interesting part is that it is a React app. There is no DOM and no browser, but there are components, props, state and hooks, and the output is a grid of monospace characters.

## React without a browser

[Ink](https://github.com/vadimdemedes/ink) is a React renderer for the terminal. Where React DOM turns a component tree into elements on a page, Ink lays the tree out with flexbox (it uses Yoga, the same layout engine React Native uses) and writes the result to stdout as text and ANSI escape codes. A `Box` is a flex container, a `Text` is a run of styled characters, and when state changes Ink redraws the frame.

That meant the whole thing could be written with the patterns I use every day. The entire entry point is four lines of real code:

```js
#!/usr/bin/env node
import { render } from 'ink';
import { createElement } from 'react';
import App from '../src/App.js';

render(createElement(App));
```

## No build step, on purpose

You might notice there is no JSX anywhere. Every component is written with `React.createElement`:

```js
React.createElement(Box, { flexDirection: 'column', marginLeft: 2, marginBottom: 1 },
  React.createElement(Box, null,
    React.createElement(Text, { color, bold: true }, `  ${project.name}`),
  ),
  React.createElement(Text, { color: DIM, dimColor: true }, `    ${project.tech}`),
  // ...
)
```

That is a deliberate trade. JSX needs a compiler, and a compiler means a build step, a `dist` folder and the chance of publishing a package whose compiled output is out of step with its source. Plain `createElement` calls run directly in Node as ES modules, so the file in the repository is exactly the file that runs on your machine. The package's `build` script just says so:

```json
"build": "echo 'No build step needed'"
```

The `bin` field points `sammii` at `bin/cli.js`, and the shebang on its first line tells your shell to run it with Node. That is all `npx` needs: it fetches the package, finds the binary and executes it. It reads a little more verbosely than JSX, but the components are small and the nesting stays shallow, so I have not missed it.

## The header

The name is drawn in block letters made from full blocks and box-drawing characters, the style figlet calls ANSI Shadow:

```js
React.createElement(Gradient, { name: 'vice' },
  React.createElement(Text, { bold: true },
    `
  ███████╗ █████╗ ███╗   ███╗███╗   ███╗██╗██╗
  ██╔════╝██╔══██╗████╗ ████║████╗ ████║██║██║
  ...`
  )
)
```

I wrote the letters straight into the source as a template literal rather than generating them at runtime. A figlet library would have meant another dependency and a font file to load every time someone runs the command, all to produce the same six lines. `ink-gradient` then sweeps a colour gradient across those characters. `vice` is one of its named presets, a fade from teal to a soft violet that leads naturally into the purple I use for the rest of the interface. Under the header, my title is set in that purple, followed by my location in grey after a `//`.

## A menu as a tiny state machine

The whole app has one piece of state:

```js
const [view, setView] = useState('menu');
```

`view` is one of `menu`, `about`, `projects` or `links`. When it is `menu`, the app renders the list; otherwise it renders the matching view with a footer explaining how to get back. Selection is handled by `ink-select-input`, which owns the highlighted index and the arrow keys. I replaced its default rendering with my own components, so the selected item gets a purple `▸` indicator and bold purple text while the others stay plain:

```js
React.createElement(SelectInput, {
  items: menuItems,
  onSelect: handleSelect,
  indicatorComponent: ({ isSelected }) =>
    React.createElement(Text, { color: PURPLE }, isSelected ? '▸ ' : '  '),
  itemComponent: ({ isSelected, label }) =>
    React.createElement(Text, { color: isSelected ? PURPLE : undefined, bold: isSelected }, label),
})
```

Choosing Exit calls `exit()` from Ink's `useApp` hook, which unmounts the React tree and hands the terminal back. Choosing anything else just sets `view`.

Outside the menu, a `useInput` hook listens for keys. Escape returns from a view to the menu, and `q` quits from the menu. One honest note: inside a view, `q` also takes you back to the menu rather than quitting, even though the footer there says "q to quit", and the Escape case is handled twice in the same handler. Neither breaks anything (you are always one more key away from leaving) but it is the kind of small mismatch that is easy to miss when you test the happy path by hand, and it is the next thing I would tidy.

## Content as data

All the words live in a separate `data.js` that exports four things: `bio`, `about`, `products` and `experiments`. The components never contain copy, so updating the portfolio means editing an array of objects:

```js
{
  name: 'Kern',
  tech: 'Next.js, Tailwind CSS, Framer Motion, TypeScript',
  desc: 'Interactive typography explorer for variable fonts, optical sizing, and fluid type scales',
  url: 'kern-9u5vawme5-sammiis-projects.vercel.app',
  github: 'github.com/Sammii-HK/kern',
},
```

The first version shipped with ten products and eight experiments. The same evening I synced it with the web portfolio, bringing it to 21 products and 16 experiments, and added a GitHub link to each. That change also moved the URL. It originally sat on the title line, dimmed, next to the project name. With a GitHub link joining it, the title line was getting crowded, so both links moved to their own row under the description, the live URL in cyan and the repository in grey:

```js
React.createElement(Box, { marginLeft: 4, gap: 2 },
  project.url
    ? React.createElement(Text, { color: CYAN, underline: true }, project.url)
    : null,
  project.github
    ? React.createElement(Text, { color: DIM, underline: true }, project.github)
    : null
)
```

Products are headed in pink and experiments in green, so a long scroll of cards still reads as two groups.

## Layout in a grid of characters

A terminal has no pixels to spare and no idea how wide your content wants to be. Ink's flexbox handles the structure, and I used fixed widths where text needs to wrap: the about paragraph sits in a `Box` 70 columns wide, and each project description in one 66 columns wide, both with `wrap: 'wrap'` so long lines break at word boundaries instead of running off the edge. The section rules are 50 `─` characters. With their indents, those wrapped blocks fit inside a standard 80-column terminal.

Indentation does the job that whitespace and font size do on the web. Section titles sit at one indent, card titles at the next, and tech stacks and descriptions one step further in, with the tech stack dimmed. It is the same hierarchy as the web portfolio, expressed in spaces.

## Colour, light and dark

The palette is five hex values: purple `#a78bfa`, cyan `#67e8f9`, pink `#f472b6`, green `#4ade80` and a grey `#6b7280` for secondary text. Ink passes colours to chalk, which converts hex to whatever the terminal can show, from truecolour down to the basic sixteen.

On the web, following the visitor's light or dark setting is my job. In a terminal it is not: the background belongs to the user's terminal theme, and the app never paints one. So the choice that matters is picking colours that hold up on both. These are all mid-tone hues, light enough to read on a dark theme and saturated enough to survive on a pale one, and the grey sits in the middle of the range. The secondary text also uses `dimColor`, which asks the terminal to render it in its own dim style, so it follows the theme rather than fighting it.

## What ships, and what it taught me

The package has no `files` field, so npm publishes everything that is not ignored, including the README screenshot. Most of its unpacked size is that one image. Two dependencies, `chalk` and `ink-link`, are listed but never imported: links are printed as underlined text rather than as clickable terminal hyperlinks, which is what `ink-link` would have provided. Many terminals detect and linkify URLs on their own, but a proper hyperlink would be a better experience.

sammii-cli is small, and it is meant to be. What I like about it is how little had to change to move React to a completely different surface. State, components and composition all carried straight over. What did not carry over was everything I take for granted in a browser: a layout that adapts to its container, a background I control, links you can click. Working without them made it very clear which parts of an interface are React and which parts are the platform underneath.
