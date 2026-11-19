---
title: "The typography genome: five hundred years of type as one family tree"
description: >-
  Twenty-eight families of Latin type, from Gutenberg's Textura to variable fonts, drawn as a family tree with a live specimen at every node. Why the serif lane never breaks, why the first sans was called grotesque, and what the stand-in fonts cannot show you.
date: '2027-01-18T09:00:00+00:00'
tags:
  - charts
  - typography
  - type history
  - variable fonts
series: "Typography"
chart: "typography"
draft: false
---

Hover the node marked Didone and the panel sets the word Hamburgefonstiv in Bodoni Moda: hairline serifs, strokes that go from thick to almost nothing, a letter that looks drawn with a ruler. Move one node to the left, to Transitional, and it resets in Libre Baskerville. Softer, rounder, less sure of itself. Move left again, past Italic, to Garalde and it is EB Garamond, and the e has a level crossbar and the whole thing looks like a book.

You have just walked three hundred years of serif type backwards, and every step was a font changing under your cursor rather than a paragraph telling you about it. That is the whole idea of [labs.sammii.dev/charts/typography](https://labs.sammii.dev/charts/typography/).

## One line from Venice

The thing I most wanted the tree to make visible is that the serif lane does not break. It starts with Nicolas Jenson's roman in Venice in 1470, a type modelled on the hand humanist scribes wrote in Italy, and every serif node on the chart descends from it by solid lines: Garalde (Griffo for Aldus in 1495, Garamond by 1530), Transitional (Baskerville in 1757, with the Romain du Roi of 1692 before it), Didone (Didot in 1784, Bodoni by 1790). The slab serifs hang off the Didones. Times New Roman (1932) hangs off the transitionals, with a dotted line back to the Garaldes. Even Fraunces, from 2020, has two parents in the tree, Didone and Garalde.

So every book face you read descends from a Venetian printer's imitation of a scribe. I find that genuinely moving, and I find it more convincing as a line on a chart than I ever did as a sentence.

## How to read it

There are five lanes, top to bottom: Blackletter, Serif, Sans serif, Monospace and display, and Technology. Each node is one family of type, placed at the year of its first exemplar. Solid lines are descent. Dotted lines are influence.

Hover a node, or tab to it, and its lineage lights up: everything it descends from and everything that descends from it. Influence lights its own edge but is not inherited, so Johnston's dotted line back to the humanist roman does not drag the whole serif lane into the sans serif lane's family. Click a node and it stays pinned.

The panel gives you the lane, the year and who made it, then the specimen (the sample word and a line of ABCDEFG abcdefg 0123 & ?), then what the style is and why it mattered, then a sentence that reads "Descends from ... Led to ...".

Above the tree there is a **Year** slider. Drag it back and the tree un-grows: at 1500 you have Textura, the humanist roman, the first Garalde and nothing else. Drag it forward and the nodes come back in date order. The time axis is deliberately uneven: 1450 to 1800 takes about a third of the width and 1800 to 2025 takes the rest, because the modern centuries are the dense ones. There is also a **Download the poster (SVG)** button.

If you want to send someone straight to a node, the page takes `?focus=`. [The humanist roman](https://labs.sammii.dev/charts/typography/?focus=humanist), [the grotesque](https://labs.sammii.dev/charts/typography/?focus=grotesque), [Univers](https://labs.sammii.dev/charts/typography/?focus=univers) and [PostScript](https://labs.sammii.dev/charts/typography/?focus=postscript) are good places to start.

## Named because it looked wrong

The sans serif lane does not descend from anything. Its root is William Caslon IV's two-line English Egyptian of 1816: capitals only, monoline, a curiosity. It was called grotesque because it looked wrong. The tree gives it a dotted line from the slab serifs, an influence rather than a parent, and then it sits there for eighty years until H. Berthold AG's Akzidenz-Grotesk in 1898 makes it a working family, with sizes, weights and widths for jobbing work. Helvetica tidied it in 1957.

From the grotesque the lane splits three ways, and you can see the split by hovering. Akzidenz leads to Helvetica and Univers and, much later, Inter. Johnston (1916) takes the humanist proportions of the roman and leads to Gill Sans in 1928. Futura (1927) goes geometric. Frutiger, in 1976, is a child of Univers with a dotted line from Johnston, which is the airport sign in one sentence.

## The grid made continuous

Univers is the node I keep coming back to. Adrian Frutiger designed it in 1957 as a system: 21 variants on a numbered grid of weight and width. The panel calls it the idea of a type family as a coordinate space.

Then look at the Technology lane, which has no parents outside itself and starts in 1984 with PostScript Type 1, when type stopped being metal and became maths. TrueType in 1991, OpenType in 1996, web fonts in 2009, variable fonts in 2016. Variable fonts have a dotted line back to Univers, because that is what they are: Univers's grid made continuous, in one file. And from 2016 the technology lane reaches back into the serif, sans and monospace lanes. Inter, Fraunces and Recursive all carry an influence line from variable fonts. They are variable fonts first and styles second.

That is also the reason [Kern](/blog/the-kerning-pair-problem) exists. The panel says so.

## The stand-ins, honestly

The originals are not on Google Fonts, so most specimens are set in a stand-in, and where a node has one the panel names it ("Shown in ..."). Inter, Fraunces and Recursive are set in themselves. Some of those stand-ins are close. Some are a compromise you should know about:

- Textura is shown in UnifrakturMaguntia, which is a Fraktur, the nearest on Google Fonts.
- The humanist roman is shown in Cormorant Garamond, which is a Garalde. The panel says so: "the closest live cut". So the one letter that defines the node, the slanted crossbar on the e, is not quite what you see.
- Helvetica is shown in Inter, which is a neo-grotesque for screens and also, on this same tree, Helvetica's descendant.
- The grotesque and Univers are both shown in Archivo, so those two specimens look the same.
- The technology nodes are not styles at all, so they are set in whichever face makes the point: Inter, Fraunces or Recursive.

The classification is a choice too. It follows Vox-ATypI (1954) where that helps and ignores it where it does not. Each node gets one lane and mostly one parent, which is tidier than history. And it is Latin type only.

## Where to read more

The tree is a companion to the Love Letters, and several of them are on it: [Garamond](/blog/love-letter-to-garamond), [Baskerville](/blog/love-letter-to-baskerville), [Bodoni](/blog/love-letter-to-bodoni), [Johnston](/blog/love-letter-to-johnston-sans), [Futura](/blog/love-letter-to-futura), [Helvetica](/blog/love-letter-to-helvetica) and [Univers](/blog/love-letter-to-univers). The letters are where the people and the arguments are. The tree is where you see how they connect.

Walk it at [labs.sammii.dev/charts/typography](https://labs.sammii.dev/charts/typography/).

## Sources

- Robert Bringhurst, The Elements of Typographic Style
- Stephen Coles, The Anatomy of Type
- Monotype and Berthold specimen histories
- The OpenType 1.8 specification (2016)
