---
title: "The £8/Month Server Running My Entire Business"
description: A single Hetzner VPS runs Spellcast, Postiz, Postgres, Redis, Temporal, and Caddy. Here's what's on it, how it's structured, and why it costs less than a lunch.
date: 2026-03-16
tags: [devops, indie-hacking, infrastructure, docker]
draft: false
---

Everything I run lives on a single server. One Hetzner VPS in Helsinki, £8/month.

It hosts Spellcast (my social scheduling platform), Postiz (the underlying publishing engine), PostgreSQL, Redis, Temporal (workflow engine), and Caddy for HTTPS. Six services. One box. Handles hundreds of social posts a week.

Here's exactly what's running and why.

## The server

Hetzner CX22: 2 vCPUs, 4 GB RAM, 40 GB NVMe, located in Helsinki. £8.29/month at current prices.

The choice of Hetzner over AWS or DigitalOcean is mostly cost. An equivalent AWS EC2 instance (t3.medium, 2 vCPU, 4 GB) is around £25-30/month plus storage and bandwidth. Hetzner is straightforwardly cheaper for the same hardware.

The trade-off: no managed services, no auto-scaling, no load balancing. For a solo product in the early growth stage, that's fine. The complexity of managed cloud doesn't pay for itself until you actually need it.

## What's running

Everything runs in Docker. The full `docker-compose.yml` manages:

```yaml
services:
  postgres:
    image: postgres:16
    volumes:
      - postgres-data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine

  postiz:
    image: spellcast-postiz:latest
    ports:
      - "5000:5000"
      - "4200:4200"

  temporal:
    image: temporalio/auto-setup:latest
    ports:
      - "7233:7233"

  caddy:
    image: caddy:2-alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - caddy-data:/data
      - ./Caddyfile:/etc/caddy/Caddyfile
```

The Spellcast API container runs alongside these but is managed separately (built from source, redeployed on changes).

### What each service does

**Postiz** handles the actual social media publishing: OAuth integrations, the publishing queue, and direct API calls to Twitter, LinkedIn, Instagram, and the rest. It's an open-source scheduling engine that I've extended with custom features.

**Temporal** is the workflow engine. It handles long-running processes reliably: if a post fails to publish, Temporal retries it with backoff. If the server restarts mid-workflow, it picks up where it left off. This is overkill for small volume but it means I've never had a post silently fail to go out.

**Caddy** handles HTTPS automatically. Zero config: point a domain at the server, write a two-line Caddyfile, done. No Let's Encrypt certificate management, no nginx config.

**Postgres** stores everything: users, posts, schedules, account sets, brand voices, analytics. One database, two schemas (spellcast and postiz).

**Redis** handles the publishing queue, session caching, and pub/sub between Postiz services.

## Networking

All services are on the same Docker network (`spellcast_default`). They communicate by service name over the internal network. Nothing except Caddy and the publishing engine ports are exposed to the internet.

The Spellcast API reaches Postiz at `http://postiz:5000` internally. External traffic hits Caddy, which reverse-proxies to the right service. This means only ports 80 and 443 are open to the world.

## Deployments

Deploying a change to the Spellcast API:

```bash
cd /opt/spellcast
git pull
docker build -f docker/api/Dockerfile -t spellcast-api:latest --platform linux/amd64 .
docker stop spellcast-api && docker rm spellcast-api
docker run -d --name spellcast-api --restart unless-stopped \
  --expose 3000 \
  --env-file docker/.env \
  --network spellcast_default \
  spellcast-api:latest
```

About 3-4 minutes from `git pull` to live. Not zero-downtime, but acceptable for a product at this stage. The Next.js frontend deploys to Vercel separately (Vercel handles that side; the VPS handles backend only).

## What it costs to run

| Service | Cost |
|---------|------|
| Hetzner CX22 | £8.29/month |
| Cloudflare R2 (media/podcast storage) | ~£0.50/month |
| Vercel (frontend + API BFF) | £0 (hobby tier) |
| Domain (sammii.dev, lunary.app, etc.) | ~£2/month amortised |
| **Total** | **~£11/month** |

The full infrastructure for five active projects costs less than a Spotify subscription.

## When this stops working

Single-server setups have real limits. The current one breaks if:

- Traffic exceeds what 4 GB RAM can handle (Postgres, Redis, and Postiz are the hungry ones)
- The server goes down (no redundancy)
- A single noisy process starves the others

None of these are currently problems. When they are, the answer is probably a second server (one for Postgres/Redis, one for app containers) rather than a jump to managed cloud. That keeps costs under £25/month and solves the resource contention issue.

The principle: run on the smallest infrastructure that actually works, and move up only when you have a real reason. Premature scaling is one of the more expensive ways to spend money before you have revenue.

---

*I'm Sammii, founder of [Lunary](https://lunary.app) and indie developer building tools I actually want to use. I write about shipping products solo, the technical decisions behind them, and figuring it all out in public.*
