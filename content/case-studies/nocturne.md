---
title: "Nocturne"
description: "A connected digital home built around spaces, widgets and tools you control. Live work in progress, currently invite-only."
techStack: "Next.js, TypeScript, React, SQLite, MCP, SwiftUI"
---

## The product

Nocturne brings pages, collections and connected tools into a digital home you can arrange yourself. A space can be a diary, a project workspace or a dashboard. Widgets sit on a free canvas, while collections and views keep the information underneath organised.

It is live and in active development, with invite-only access. The web product includes an iOS companion, with both surfaces continuing to develop.

## The engineering

The web application uses Next.js and TypeScript with SQLite storage. Spaces are composed from widgets rather than hard-coded dashboards. Widgets can work with the content held in Nocturne and with connections to external systems.

Connected systems remain the source of truth. Permissions determine which collections and connections a widget or assistant can use. The MCP interface lets an assistant work with pages and spaces through scoped actions; changes carry versions so newer edits are protected.

The native iOS project adds a companion interface and widgets. The product work spans the web interface, underlying data model, connection boundaries and native experience.

## Where it stands

The public product page shows the current interface and explains how to request an invitation. Nocturne is a working product under development, with access and capabilities still evolving.

[Explore Nocturne](https://nocturne.lunarcomputing.org/about).
