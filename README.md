# GitRanked

A GitHub developer leaderboard that ranks top contributors by region, powered by [committers.top](https://committers.top) ranking data enriched with live GitHub profile details.

Live site: **https://gitranked.manthaa.dev**

## Overview

GitRanked builds a leaderboard for a region (currently **Cambodia**) by combining two sources:

1. **committers.top** — provides the regional ranking and contribution counts.
2. **GitHub GraphQL/REST API** — enriches each ranked user with avatar, followers, public repos, location, join date, and contribution streak.

GitHub enrichment is best-effort: if no `GITHUB_TOKEN` is configured, the app still renders using committers.top data and fallback avatars.

## Features

- **Regional Leaderboard**: Ranks developers from committers.top, enriched with live GitHub data.
- **Multi-sort**: Sort by contributions (default), followers, repositories, or join date.
- **User Profiles**: Click any developer to open a modal with live GitHub details — repos, followers, contributions, total stars, and a contribution streak.
- **Username Search**: Look up a specific GitHub user by login.
- **Pagination**: Loads 100 developers per page with a "load more" pattern, up to a 500-user display cap.
- **Responsive Design**: Mobile-friendly, Apple-inspired minimalist aesthetics with a self-hosted Sunghyun Sans font.
- **Analytics**: Google Analytics via `@next/third-parties`.

> **Note:** Location-based search is currently disabled — the input is read-only and the app pins the region to Cambodia. The username search still works.

## Tech Stack

- **Next.js 16.1.6** — React framework with App Router
- **React 19.2.3** — UI library (with the React Compiler via `babel-plugin-react-compiler`)
- **TypeScript 5** — Type-safe development
- **Tailwind CSS v4** — Utility-first CSS framework
- **Recharts** — Charts in user profiles
- **next-themes** — Theme provider (configured light-only)
- **@hugeicons** — Icon library
- **lru-cache** — In-memory cache used by the rate limiter
- **@next/third-parties** — Google Analytics integration
- **Biome 2.2.0** — Linting and formatting

## Getting Started

### Installation

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### Environment Variables

The app reads a single, **optional** environment variable:

- `GITHUB_TOKEN` — a GitHub personal access token used to enrich the leaderboard with live profile data via the GitHub API. Without it, the app still works but falls back to committers.top data and degrades enrichment gracefully (and is more likely to hit GitHub's unauthenticated rate limits).

Create a `.env.local` file in the project root:

```
GITHUB_TOKEN=your_github_token_here
```

A classic or fine-grained token with public read access is sufficient (`public_repo` / read-only public data).

### Development

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Building for Production

```bash
npm run build
npm start
```

## Usage

1. **Browse the Leaderboard**: View ranked developers with contributions, followers, repositories, and join date.
2. **Sort Results**: Use the sort control to order by contributions, followers, repositories, or newest.
3. **View Profiles**: Click any developer to open a detailed profile modal.
4. **Search for a User**: Use the username search to look up a specific GitHub user.
5. **Load More**: Page through results 100 at a time, up to the 500-user display cap.

## Architecture

### API Routes

- `GET /api/leaderboard` — builds the regional leaderboard (committers.top ranking + GitHub enrichment), with server-side sorting and pagination.
- `GET /api/github/users/[login]` — fetches live GitHub detail for a single user (used by the profile modal).
- `GET /api/health` — health/diagnostics endpoint.

### Data Flow

1. `committersService` fetches the regional ranking JSON and scrapes contribution counts/names from committers.top.
2. `githubService` enriches the ranked logins via the GitHub GraphQL API (with REST for some calls).
3. The leaderboard route sorts and paginates the combined result.

All leaderboard data is fetched live — no data files are committed to the repo.

### Caching

Caching happens at several layers:

- **committers.top data**: in-memory cache with a **10-minute** TTL (plus Next.js `revalidate: 600`).
- **Built leaderboard**: in-memory cache with a **5-minute** TTL (plus route `revalidate: 300`) and in-flight request de-duplication.
- **Rate limiter**: `lru-cache` with a 1-hour TTL (utility present in `src/lib/rateLimit.ts`).

## Scripts

| Script | Command | Description |
| --- | --- | --- |
| `dev` | `next dev` | Start the development server |
| `build` | `next build` | Production build |
| `start` | `next start` | Start the production server |
| `lint` | `biome check` | Lint the codebase |
| `format` | `biome format --write` | Format the codebase |

## Deployment

The easiest way to deploy this Next.js app is using the [Vercel Platform](https://vercel.com/new):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)

When deploying, optionally set `GITHUB_TOKEN` for richer, rate-limit-friendly GitHub enrichment.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Troubleshooting

### Leaderboard shows limited data / generic avatars

- This usually means `GITHUB_TOKEN` is missing or invalid. The app degrades gracefully to committers.top data, but setting a valid token restores full enrichment.

### Rate limit errors from GitHub

- Unauthenticated GitHub requests are heavily rate-limited. Set `GITHUB_TOKEN` to raise the limit.

### No users showing up

- Confirm committers.top is reachable for the configured region.
- Check the server logs and browser console for fetch errors.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) — Next.js features and API
- [React Documentation](https://react.dev) — React
- [Tailwind CSS](https://tailwindcss.com) — Tailwind CSS
- [committers.top](https://committers.top) — Regional GitHub ranking source
- [GitHub GraphQL API](https://docs.github.com/en/graphql) — GitHub data API
