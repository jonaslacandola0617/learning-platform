# Tuklas Learning Platform

An expandable Filipino learning platform built with Next.js App Router. The first playable activity is **GMRC: Hula ang Salita**.

## Current features

- Learning dashboard with one playable game and space for future activities
- Teacher/parent setup for 5, 10, or 15 custom words
- Automatic letter pools, revealed letters, hints, scoring, and completion flow
- Existing illustrations and instant visual fallbacks
- Optional OpenAI image generation through a server-side Vercel function
- Responsive layouts for desktop, tablet, and mobile

## Run locally

```bash
npm install
npm run dev
```

## Optional AI images

AI generation is opt-in. Add `OPENAI_API_KEY` to `.env.local` for local development and to the Vercel deployment environment for production. Never expose the key through a `NEXT_PUBLIC_` environment variable.

The app uses `gpt-image-1-mini` with low-quality landscape output to keep per-round cost low. If the key is absent or generation fails, the game automatically falls back to its visual card.

Before enabling AI images on a public deployment, add a Vercel Firewall rate limit and an OpenAI project budget so unauthenticated requests cannot create unbounded charges.

## Build

```bash
npm run build
npm run lint
```
