# GitRanked

A GitHub Developer Leaderboard that discovers and ranks top GitHub developers based on their location, powered by a Notion database.

## Features

- **Location-based Search**: Search for GitHub developers by location with autocomplete suggestions
- **Multi-sort Leaderboard**: Sort developers by followers, repositories, or join date
- **User Profiles**: View detailed profile information including repos, followers, contributions, and stars
- **Notion-Powered Data**: Fetches curated data from a Notion database
- **Pagination**: Navigate through results with 100 developers per page
- **Statistics Dashboard**: View aggregate stats (total developers, top influence, total repositories)
- **Responsive Design**: Mobile-friendly with Apple-inspired minimalist aesthetics
- **Dark Mode Support**: Built-in dark mode via Tailwind CSS

## Tech Stack

- **Next.js 16.1.6** - React framework with App Router
- **React 19.2.3** - UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Utility-first CSS framework
- **Notion SDK (@notionhq/client)** - Notion API integration
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

### Notion Configuration

To use this application, you need to set up a Notion integration and database:

1. **Create a Notion Integration**:
   - Go to [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
   - Click "New integration"
   - Give it a name (e.g., "GitRanked")
   - Copy the "Internal Integration Token"

2. **Create a Notion Database**:
   - Create a new database in Notion with the following properties:
     - **Title**: `login` (GitHub username)
     - **Rich Text**: `id`, `name`, `company`, `location`, `bio`
     - **URL**: `avatar_url`, `html_url`
     - **Email**: `email`
     - **Number**: `public_repos`, `public_gists`, `followers`, `following`, `total_stars`, `recent_activity_count`
     - **Date**: `created_at`

3. **Share the Database**:
   - Click the ••• menu at the top right of your database
   - Select "Add connections"
   - Search for and select your integration
   - Copy the database ID from the URL (the part after the `/`)

4. **Configure Environment Variables**:
   - Create a `.env.local` file in the project root
   - Add the following:
     ```
     NOTION_TOKEN=your_integration_token_here
     NOTION_DATABASE_ID=your_database_id_here
     ```

5. **Populate the Database**:
   - Add GitHub user data to the Notion database
   - The application will fetch and display this data

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
6. **Search for User**: Use the search bar to find a specific GitHub user

## Data Source

This application uses a Notion database as its primary data source:

- Data is curated and stored in Notion
- No live GitHub API calls are made
- All data is pre-filtered and cleaned
- Updates are made directly in the Notion database

## Notion API Limits

The Notion API has the following rate limits:

- **Rate Limit**: 3 requests per second
- **Pagination**: 100 results per query
- **Strategy**: The application implements caching to minimize API calls

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

The easiest way to deploy this Next.js app is using [Vercel Platform](https://vercel.com/new):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)

### Environment Variables

When deploying, make sure to add the following environment variables:

- `NOTION_TOKEN` - Your Notion integration token
- `NOTION_DATABASE_ID` - Your Notion database ID

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Troubleshooting

### "Notion database not configured" error

- Ensure you have a `.env.local` file with both `NOTION_TOKEN` and `NOTION_DATABASE_ID`
- Verify the database ID is correct (it should match your Notion database URL)
- Make sure you've shared the database with your integration

### "Failed to fetch data from Notion" error

- Check that your Notion integration has proper permissions
- Verify the database has all required properties
- Check the Notion API status page for outages

### No users showing up

- Ensure your Notion database has data in it
- Verify the property names match exactly what the application expects
- Check the browser console for any error messages

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [React Documentation](https://react.dev) - Learn about React
- [Tailwind CSS](https://tailwindcss.com) - Learn about Tailwind CSS
- [Notion API Documentation](https://developers.notion.com) - Learn about Notion's API
