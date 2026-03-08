---
title: "Crystal Index"
description: "Custom CMS for cataloguing crystals with structured filters and 3D visualisation"
techStack: "TypeScript, Next.js, Prisma, SQL, GPT-4, React Three Fiber"
---

## The problem

Cataloguing a crystal collection requires structured data that typical note-taking tools do not support: each crystal has a colour, chakra association, metaphysical properties, hardness, origin, and care instructions. I wanted a purpose-built CMS with filterable columns, AI-generated descriptions, and a 3D visualisation of each crystal.

## Architecture

### Prisma data model

The database schema models crystals with structured fields: name, colour (enum), chakra (enum), hardness (Mohs scale), origin, and a JSON field for freeform properties. Prisma generates type-safe queries and handles migrations. Relational links connect crystals to multiple chakras and properties via join tables.

### Structured filtering

The browse interface lets users filter by any combination of colour, chakra, and property. Filters compose as AND conditions across categories and OR within a category (e.g. "purple OR blue" AND "heart chakra"). The filter state serialises to URL parameters for shareable filtered views.

### GPT-4 descriptions

When adding a new crystal, GPT-4 generates a description based on the structured fields. The prompt includes the crystal's name, colour, chakra, and known properties, and produces a concise paragraph covering appearance, traditional associations, and suggested uses. Generated descriptions are editable before saving.

### React Three Fiber visualisation

Each crystal entry includes a 3D visualisation rendered with React Three Fiber. The visualisation uses procedural geometry (rough polyhedrons for raw crystals, smooth geometries for polished ones) with physically-based materials that approximate the crystal's colour and translucency. The scene responds to mouse drag for rotation.

## Challenges

**Filter performance**: Composing multiple filters across join tables can produce slow queries. The filter system builds a single Prisma query with nested where clauses rather than fetching all crystals and filtering client-side. Indexed foreign keys on the join tables keep query times under 100ms.

**3D material realism**: Making procedural 3D crystals look convincing required tuning PBR material properties per crystal type. Amethyst needs subsurface scattering and a purple tint; clear quartz needs high transmission and refraction. A material preset system maps crystal types to Three.js material configurations.

**Description quality**: GPT-4 occasionally generates inaccurate metaphysical claims. The prompt constrains output to well-established traditional associations and flags the descriptions as "traditional associations" rather than factual claims. All generated text is reviewer-editable.

## Outcome

Crystal Index provides a structured, searchable catalogue for crystal collections with rich metadata, AI-assisted descriptions, and interactive 3D previews. The filtering system makes it practical for collections of hundreds of entries, and the 3D visualisation adds a tactile quality that images alone cannot provide.
