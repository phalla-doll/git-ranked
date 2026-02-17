# GitRanked

A modern, minimalist leaderboard to discover and rank top GitHub developers in any location. Built with React 19, Tailwind CSS, and the GitHub API, featuring an Apple-inspired aesthetic.

## 🚀 Features

- **🌍 Location-Based Ranking**: Instantly fetch and rank users from any city or country (defaults to Cambodia).
- **📊 Dynamic Sorting**: Rank developers by:
  - **Followers**: Gauge community influence.
  - **Contributions**: Measure recent activity (Green Squares).
  - **Repositories**: See open-source output.
  - **Newest**: Discover rising stars.
- **🔍 Deep Search**: Find specific users by username to view their detailed profile card.
- **💎 Minimalist UI**: A clean, distraction-free interface using glassmorphism and refined typography.
- **⚡ Smart Data Handling**: 
  - Real-time GitHub API integration.
  - **Hybrid Fetching**: Uses GraphQL for accurate contribution data when an API key is provided, falling back to REST for basic data.
  - **Rate Limit Protection**: Automatic fallbacks to mock data and caching strategies to prevent app breakage.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS (with custom Apple-themed configuration)
- **Icons**: Lucide React
- **Data**: GitHub REST & GraphQL APIs

## 📦 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/gitranked.git
   cd gitranked
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 🔑 API Key Configuration

GitHub's free API has a rate limit of **60 requests per hour** for unauthenticated requests. 
To increase this to **5,000 requests per hour** and enable accurate **Contribution** counts via GraphQL:

1. Click the **Key Icon** button in the top navigation bar.
2. Enter your GitHub Personal Access Token (Classic).
   - You can generate one [here](https://github.com/settings/tokens).
   - **Scopes**: No specific scopes are required for reading public user data (`read:user` is sufficient).
3. The key is saved to your browser's `localStorage` for convenience.

## 📝 License

This project is licensed under the MIT License.