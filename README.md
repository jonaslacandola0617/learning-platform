# Tuklas Learning Platform

An expandable Filipino learning platform built with Next.js App Router. The first playable activity is **GMRC: Hula ang Salita**.

## Current features

- Learning dashboard with one playable game and space for future activities
- Topic-based setup for 5, 10, or 15 automatically generated words
- Animals, action words, describing words, everyday objects, and good values
- Every generated word and clue remains editable before the game starts
- Built-in word banks keep generation instant even without an API key
- Automatic letter pools, revealed letters, hints, scoring, and completion flow
- Existing illustrations and instant visual fallbacks
- Optional Gemini word generation and Cloudflare Workers AI illustrations
- Responsive layouts for desktop, tablet, and mobile

## Run locally

```bash
npm install
npm run dev
```

## Optional AI generation

AI generation is opt-in. Copy `.env.example` to `.env.local` for local development, then add the same server-side variables to the Vercel project for production. Never expose any of these keys through a `NEXT_PUBLIC_` environment variable.

Add `GEMINI_API_KEY` to generate fresh, structured word sets and clues with Gemini. Without the key—or whenever the free quota is unavailable—the app automatically falls back to the included topic banks.

Add `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` to enable the optional AI image mode. It uses `@cf/black-forest-labs/flux-1-schnell` by default with a stable seed. Successful responses are CDN-cacheable for 30 days, reducing repeated generation for the same word and clue. If Cloudflare is unavailable or its daily allocation is exhausted, the game automatically falls back to its visual card.

Free API allowances and limits can change. Before enabling AI images on a public deployment, add a Vercel Firewall rate limit to protect the public endpoint from abuse.

## Build

```bash
npm run build
npm run lint
```
