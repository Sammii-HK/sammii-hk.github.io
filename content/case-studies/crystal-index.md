---
title: "Crystal Index"
description: "Custom CMS for cataloguing crystals with structured filters and 3D visualisation"
techStack: "TypeScript, Next.js, Prisma, SQL, GPT-4, React Three Fiber, SwiftUI"
---

## The problem

Crystal collections resist the note-taking apps most people reach for first. A collection isn't a simple list: each crystal carries a colour, a chakra association, a set of metaphysical properties, a Mohs hardness rating, an origin, and its own care instructions, and generic tools don't hold that structure well. Crystal Index is a purpose-built CMS for it: filterable structured fields, GPT-4-generated descriptions, and a 3D visualisation for each entry, plus a native iOS companion app for identifying crystals by camera against the same catalogue.

## Architecture

### Data model

The database schema models each crystal as structured fields: name, colour (enum), chakra (enum), hardness on the Mohs scale, origin, plus a JSON field for freeform properties. Prisma handles migrations and generates type-safe queries. Join tables link crystals to multiple chakras and properties, so a single stone can carry more than one chakra association.

### Filtering

Users filter the browse view by any combination of colour, chakra, and property. Conditions AND across categories and OR within a category, so "purple OR blue" AND "heart chakra" is a valid query. Filter state serialises to URL parameters, which makes any filtered view shareable as a link.

### Generated descriptions

Adding a new crystal triggers a GPT-4 call seeded with the structured fields: name, colour, chakra, and known properties. It produces a short paragraph on appearance, traditional associations, and suggested uses. Descriptions are editable before saving.

### 3D visualisation

Each entry renders a 3D visualisation in React Three Fiber, built from procedural geometry: rough polyhedrons for raw specimens, smoother forms for polished ones, with physically-based materials tuned to approximate colour and translucency. Mouse drag rotates the scene.

### iOS companion

A native SwiftUI app extends the catalogue to camera-based identification: point a phone at a crystal and it's matched against the same API the web CMS reads from. RevenueCat handles the app's subscriptions.

## Challenges

Filtering across join tables was the first performance risk. Composing colour, chakra, and property filters naively meant fetching every crystal and filtering client-side, which doesn't scale. The fix was a single Prisma query with nested where clauses instead, with indexed foreign keys on the join tables keeping query times under 100ms even as filters compose.

Getting the 3D materials to read as convincing crystals, rather than generic glossy shapes, took more tuning than expected. Amethyst needed subsurface scattering and a purple tint; clear quartz needed high transmission and refraction. That tuning now lives in a material preset system mapping crystal types to Three.js material configurations.

The GPT-4 descriptions carried a different risk: occasional inaccurate metaphysical claims stated as fact. The prompt is constrained to well-established traditional associations, and the output is explicitly framed as "traditional associations" rather than settled fact. Every generated description stays editable before it's saved.

## Outcome

Crystal Index is live at crystalindex.co.uk. It gives crystal collections a structured, searchable catalogue with rich metadata, AI-assisted descriptions, and an interactive 3D preview on every entry. The filtering system holds up at collections of hundreds of entries, and the 3D visualisation adds a tactile quality that photos alone don't provide. A native SwiftUI companion app extends the catalogue to camera-based crystal identification, backed by RevenueCat subscriptions.
