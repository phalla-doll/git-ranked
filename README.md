# GitRanked

A GitHub Developer Leaderboard that discovers and ranks top GitHub developers based on their location.

## Features

- **Location-based Search**: Search for GitHub developers by location with autocomplete suggestions
- **Multi-sort Leaderboard**: Sort developers by followers, repositories, or join date
- **User Profiles**: View detailed profile information including repos, followers, contributions, and stars
- **Real-time GitHub Data**: Fetches live data from GitHub's REST and GraphQL APIs
- **Rate Limit Management**: Handles GitHub API rate limits with optional personal API token support
- **Pagination**: Navigate through results with 100 developers per page
- **Statistics Dashboard**: View aggregate stats (total developers, top influence, total repositories)
- **Responsive Design**: Mobile-friendly with Apple-inspired minimalist aesthetics
- **Dark Mode Support**: Built-in dark mode via Tailwind CSS

## Tech Stack

- **Next.js 16.1.6** - React framework with App Router
- **React 19.2.3** - UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Utility-first CSS framework
- **Biome** - Linting and formatting
- **LRU Cache** - API response caching (5-minute TTL)
- **@hugeicons** - Icon library

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

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

### Building for Production

```bash
npm run build
npm start
```

## Usage

1. **Search by Location**: Enter a location (e.g., "Cambodia", "San Francisco", "Tokyo") in the search bar
2. **View Leaderboard**: Browse ranked developers with metrics for followers, repositories, and join date
3. **Sort Results**: Use the dropdown to sort by followers, repositories, or join date
4. **View Profiles**: Click on any developer to see detailed statistics and activity
5. **Navigate Pages**: Use pagination controls to browse through results (100 per page)

## GitHub API Configuration

### Rate Limits

- **Without API Token**: 60 requests/hour (GitHub's anonymous limit)
- **With API Token**: 5,000 requests/hour

### Adding a Personal Access Token

To increase the API rate limit:

1. Go to [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. Create a new token (no scopes needed for public data)
3. Enter the token in the application's API key panel
4. The token is stored locally in your browser's `localStorage`

The application will prompt you to add a token when you're approaching the rate limit.

## Development

### Linting

```bash
npm run lint
```

### Formatting

```bash
npm run format
```

## Deployment

The easiest way to deploy this Next.js app is using the [Vercel Platform](https://vercel.com/new):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [React Documentation](https://react.dev) - Learn about React
- [Tailwind CSS](https://tailwindcss.com) - Learn about Tailwind CSS
- [GitHub API](https://docs.github.com/en/rest) - Learn about GitHub's REST API
