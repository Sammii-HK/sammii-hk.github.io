export const projects = [
  {
    id: 'lunary',
    title: 'Lunary',
    techStack: 'Next.js, Typescript, Astronomy Engine',
    info: 'Progressive Web App calculating planetary and lunar positions in real time using the Astronomy Engine library, with personalised lunar data and subscription features.',
  },
  {
    id: 'crystal-index',
    title: 'Crystal Index',
    techStack: 'TypeScript, Next.js, Prisma, SQL, GPT4, React 3 Fiber',
    info: 'Custom CMS for cataloguing crystals with structured filters for colour, chakra, and properties, and GPT-4-generated descriptions.',
  },
  {
    id: 'unicorn-poo/succulent',
    title: 'Succulent',
    techStack: 'Next.js, Ayrshare API, AI SDK, Stripe, Shopify API',
    info: 'Social media management platform with integrated print-on-demand and e-commerce automation. Unified publishing, scheduling, and product creation across 13+ social platforms with automated store synchronization.',
  },
  {
    id: 'day-lite',
    title: 'Day Lite',
    techStack: 'React, Javascript, Mapbox GL, Vite',
    info: 'Interactive globe visualising daylight patterns worldwide in real time using geospatial data from MapBox GL.',
  },
  {
    id: 'scape-squared',
    title: 'Scape²',
    techStack: 'Next.js, Vercel E-commerce, Shopify',
    info: 'Customised Vercel E-commerce template integrated with Shopify APIs to create and deploy a functional online storefront.',
  },
  
  
  {
    id: 'glint',
    title: 'Glint',
    techStack: 'Next.js, Vercel Edge Middleware, PostgreSQL, Recharts',
    info: 'Custom analytics platform built on Next.js Edge Middleware for zero-latency tracking and PostgreSQL for persistence. Self-populating dashboard via Cloudflare Worker cron job that simulates traffic from global edge locations.',
  },
  {
    id: 'the-colour-game',
    title: 'The CSS Color Game',
    techStack: 'Next.js, Vercel Edge Middleware, React Email, Resend',
    info: 'A daily color platform built with Next.js that combines an interactive color recognition game with automated email delivery and social sharing.',
  },
  {
    id: 'balloon-bonanza',
    title: 'Balloon Bonanza',
    techStack: 'React, Typescript, Matter.js, Vite',
    info: 'A real-time physics simulation using Matter.js to render interactive balloons with realistic collision dynamics and constraint-based interactions.',
  },
  {
    id: 'liquidity',
    title: 'Liquidity',
    techStack: 'Next.js, Typescript, GSAP, Rapier2D',
    info: 'Experimental Next.js project exploring advanced animation techniques for creating liquid text effects through multiple approaches.',
  },
  {
    id: 'rainbow-laser-pointer',
    title: 'Rainbow Laser Pointer',
    techStack: 'React, TypeScript, HTML5 Canvas',
    info: 'An interactive canvas-based laser pointer application with smooth trail rendering and color transitions.',
  },
  
  {
    id: 'spellcast',
    title: 'Spellcast',
    techStack: 'Next.js, Turborepo, Drizzle ORM, PostgreSQL, Docker, Postiz',
    info: 'Self-hosted social media scheduling platform managing multiple brands across 8+ platforms. Turborepo monorepo with a Next.js frontend, a Node.js BFF, and a self-hosted Postiz + Temporal stack on Hetzner via Docker Compose.',
  },
  {
    id: 'podify',
    title: 'Podify',
    techStack: 'Next.js, Claude (OpenRouter), Kokoro TTS, ffmpeg',
    info: 'AI podcast generator that turns any text, URL, or content path into a fully produced two-host episode at roughly $0.04 each. Kokoro TTS synthesis, ffmpeg audio assembly, RSS feed output, and a web UI with real-time generation progress.',
  },
  {
    id: 'artify',
    title: 'Artify',
    techStack: 'Next.js, Remotion, FLUX, Kling, DeepInfra, fal.ai',
    info: 'Automated daily content pipeline generating witchcraft and astrology illustrations, carousels, reels, and stories using FLUX image-to-image generation, Kling video synthesis, and Remotion compositions — then scheduling everything via Spellcast.',
  },
  {
    id: 'celestial-map',
    title: 'Celestial map',
    techStack: 'D3.js, HTML5 Canvas, Vite',
    info: 'Interactive star globe rendered on Canvas using D3 orthographic projection. Realistic star colours from B-V colour index, magnitude-scaled sizes with glow effects, constellation lines and labels, Milky Way band, drag-to-rotate with idle spin, and a time slider that shifts the sky in right ascension.',
  },
  // {
  //   id: 'softly-becoming',
  //   title: 'Softly Becoming',
  //   techStack: 'Next.js, Vercel Edge Middleware, React Email, Resend, Vercel Blob, Stripe',
  //   info: 'A modern, full-stack digital wellness platform combining newsletter automation, social media management, and digital product sales.',
  // },
  // {
  //   id: 'notifiy-me',
  //   title: 'Notify Me',
  //   techStack: 'Next.js, Prisma, Cloudflare Workers, AI SDK, Pushover',
  //   info: 'An automated social media content generation and scheduling platform that creates, reviews, and schedules posts across multiple platforms using AI.',
  // },
  // {
  //   id: 'rss-reply',
  //   title: 'RSS Reply',
  //   techStack: '',
  //   info: '',
  // },
  // {
  //   id: 'content-creator',
  //   title: 'Content Creator',
  //   techStack: 'Next.js, Prisma, Vercel Blob, AI SDK, Vercel Cron',
  //   info: 'A self-learning, AI-driven system that generates, analyses, and optimises short-form social videos automatically. It combines LLM-based script generation, ffmpeg video rendering, visual analysis, engagement prediction, and trend awareness to continually improve content performance.',
  // },
  // {
  //   id: 'unicorn-poo/pizzazz',
  //   title: 'Pizzazz',
  //   techStack: 'Typescript',
  //   info: 'A simple and customizable JavaScript library that adds animated effects to mouse clicks.',
  // },
  // {
  //   id: 'unicorn-poo/posti',
  //   title: 'Posti Email',
  //   techStack: 'Next.js, Vercel Edge Middleware, React Email',
  //   info: 'Self-hosted email tracking with open and click tracking. Supports AWS SES and Cloudflare Workers Email. No third-party tracking services required.',
  // },
  // {
  //   id: 'in-the-dark',
  //   title: 'In the Dark',
  //   techStack: '',
  //   info: '',
  // },




  {
    id: 'artistry',
    title: 'Artistry',
    techStack: 'React, Python, SQL',
    info: 'Integrates the Rijksmuseum API to retrieve and search artwork data, storing results in a SQL database accessed through a Python REST API.',
  },
  {
    id: 'communication-infographic',
    title: 'Communication Infographic',
    techStack: 'React, Javascript',
    info: 'Interactive timeline highlighting key developments in communication technology, built with React and SVG animations.',
  },
  {
    id: 'space-invaders',
    title: 'Space Invaders',
    techStack: 'Javascript',
    info: 'Recreation of the classic arcade game built in JavaScript with keyboard controls, scoring, and progressive difficulty.',
  },
  {
    id: 'volcanoVisualisation',
    title: 'Volcano Visualisation',
    techStack: 'D3.js, Javascript, React 3 Fiber',
    info: '3D globe mapping volcanic eruptions worldwide using GeoJSON datasets with D3.js and React Three Fiber.',
  },
  {
    id: 'p5-interactive-graphics',
    title: 'P5 Interactive Graphics',
    techStack: 'P5.js, Javascript',
    info: 'A front-end application, which renders a dynamic interactive graphic visualisation which reacts to the users cursor movement and position, created with P5.js and Javascript.',
  },
  {
    id: 'matter-js-animation',
    title: 'Matter.js',
    techStack: 'Matter.js, Javascript',
    info: 'Interactive physics demo using Matter.js to simulate object motion and collision dynamics in real time.',
  },
  {
    id: 'three-js-particles',
    title: 'Three.js 3D Model',
    techStack: 'Three.js, Javascript',
    info: '3D scene rendered with Three.js displaying a butterfly model surrounded by animated geometric particles in a panoramic environment.',
  },
  {
    id: 'nasa-api',
    title: 'NASA API',
    techStack: 'React, Javascript, NASA API',
    info: 'Displays imagery and data from NASA’s Mars Rover and Astronomy Picture of the Day APIs with efficient image rendering and request handling.',
  },
  {
    id: 'on-set-london',
    title: 'On Set',
    techStack: 'React, MapBox GL, JavaScript, MongoDB',
    info: 'Map-based app indexing film locations across London using MongoDB for storage and MapBox GL for geospatial rendering.',
  },
];