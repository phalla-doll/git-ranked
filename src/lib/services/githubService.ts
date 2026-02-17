import { LRUCache } from "lru-cache";
import { cache } from "react";
import type {
    GitHubEvent,
    GitHubRepository,
    GitHubUserDetail,
    GraphQLRepositoryNode,
    SearchResponse,
} from "@/types";
import { SortOption } from "@/types";

const BASE_URL = "https://api.github.com";
const GRAPHQL_URL = "https://api.github.com/graphql";

const searchCache = new LRUCache<
    string,
    {
        users: GitHubUserDetail[];
        total_count: number;
        rateLimited: boolean;
        error?: string;
    }
>({
    max: 100,
    ttl: 5 * 60 * 1000,
});

const calculateCommitsFromEvents = (events: GitHubEvent[]): number => {
    if (!Array.isArray(events)) return 0;
    return events.reduce((acc: number, event: GitHubEvent) => {
        if (
            event &&
            typeof event === "object" &&
            event.type === "PushEvent" &&
            event.payload &&
            typeof event.payload === "object" &&
            "size" in event.payload
        ) {
            return acc + (Number(event.payload.size) || 0);
        }
        return acc;
    }, 0);
};

const chunkArray = <T>(arr: T[], size: number): T[][] => {
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
    }
    return result;
};

const fetchGraphQLUserDetails = async (
    usernames: string[],
    token: string,
): Promise<Record<string, GitHubUserDetail>> => {
    const chunks = chunkArray(usernames, 10);
    const allUsers: Record<string, GitHubUserDetail> = {};

    for (const chunk of chunks) {
        const queries = chunk
            .map((username, index) => {
                const safeKey = `user_${index}`;
                return `
        ${safeKey}: user(login: "${username}") {
          login
          databaseId
          avatarUrl
          url
          name
          company
          websiteUrl
          location
          email
          bio
          createdAt
          followers { totalCount }
          following { totalCount }
          gists(privacy: PUBLIC) { totalCount }
          contributionsCollection {
            contributionCalendar {
              totalContributions
            }
          }
          repositories(first: 30, ownerAffiliations: OWNER, orderBy: {field: STARGAZERS, direction: DESC}) {
            totalCount
            nodes {
              stargazerCount
            }
          }
        }
      `;
            })
            .join("\n");

        const query = `query { ${queries} }`;

        try {
            const response = await fetch(GRAPHQL_URL, {
                method: "POST",
                headers: {
                    Authorization: `bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ query }),
            });

            const result = await response.json();

            if (result.data) {
                chunk.forEach((username, index) => {
                    const safeKey = `user_${index}`;
                    const data = result.data[safeKey];
                    if (data) {
                        const totalStars =
                            data.repositories?.nodes?.reduce(
                                (acc: number, repo: GraphQLRepositoryNode) =>
                                    acc + (repo.stargazerCount || 0),
                                0,
                            ) || 0;

                        allUsers[username.toLowerCase()] = {
                            login: data.login,
                            id: data.databaseId,
                            avatar_url: data.avatarUrl,
                            html_url: data.url,
                            name: data.name,
                            company: data.company,
                            blog: data.websiteUrl,
                            location: data.location,
                            email: data.email,
                            bio: data.bio,
                            public_repos: data.repositories?.totalCount || 0,
                            public_gists: data.gists?.totalCount || 0,
                            followers: data.followers?.totalCount || 0,
                            following: data.following?.totalCount || 0,
                            created_at: data.createdAt,
                            recent_activity_count:
                                data.contributionsCollection
                                    ?.contributionCalendar
                                    ?.totalContributions || 0,
                            total_stars: totalStars,
                        };
                    }
                });
            } else if (result.errors) {
                console.warn("GraphQL errors:", result.errors);
            }
        } catch (e) {
            console.warn("GraphQL chunk fetch failed", e);
        }
    }

    return allUsers;
};

export const getUserByName = cache(
    async (
        username: string,
        apiKey?: string,
    ): Promise<GitHubUserDetail | null> => {
        const headers: HeadersInit = {
            Accept: "application/vnd.github.v3+json",
        };

        if (apiKey) {
            headers.Authorization = `token ${apiKey}`;

            try {
                const map = await fetchGraphQLUserDetails([username], apiKey);
                if (map[username.toLowerCase()]) {
                    return map[username.toLowerCase()];
                }
            } catch (_e) {
                console.warn(
                    "GraphQL single fetch failed, falling back to REST",
                );
            }
        }

        try {
            const response = await fetch(`${BASE_URL}/users/${username}`, {
                headers,
            });
            if (!response.ok) return null;
            const user = (await response.json()) as GitHubUserDetail;

            try {
                const eventsRes = await fetch(
                    `${BASE_URL}/users/${username}/events?per_page=100`,
                    { headers },
                );
                if (eventsRes.ok) {
                    const events = await eventsRes.json();
                    user.recent_activity_count =
                        calculateCommitsFromEvents(events);
                }
            } catch (_e) {
                user.recent_activity_count = 0;
            }

            try {
                const reposRes = await fetch(
                    `${BASE_URL}/users/${username}/repos?per_page=100&type=owner&sort=pushed`,
                    { headers },
                );
                if (reposRes.ok) {
                    const repos = await reposRes.json();
                    if (Array.isArray(repos)) {
                        user.total_stars = repos.reduce(
                            (acc: number, repo: GitHubRepository) =>
                                acc + (repo.stargazers_count || 0),
                            0,
                        );
                    }
                }
            } catch (_e) {
                // Ignore star fetch errors
            }

            return user;
        } catch (error) {
            console.error("Error fetching user:", error);
            return null;
        }
    },
);

export const searchUsersInLocation = cache(
    async (
        query: string,
        sort: SortOption,
        page: number = 1,
        apiKey?: string,
    ): Promise<{
        users: GitHubUserDetail[];
        total_count: number;
        rateLimited: boolean;
        error?: string;
    }> => {
        const cacheKey = `${query}:${sort}:${page}:${apiKey ? "with-key" : "no-key"}`;
        const cached = searchCache.get(cacheKey);
        if (cached) {
            return cached;
        }

        const headers: HeadersInit = {
            Accept: "application/vnd.github.v3+json",
        };

        if (apiKey) {
            headers.Authorization = `token ${apiKey}`;
        }

        try {
            const q = `location:"${query}"`;
            const fetchSize = 50;
            const searchUrl = `${BASE_URL}/search/users?q=${encodeURIComponent(q)}&sort=${sort}&order=desc&per_page=${fetchSize}&page=${page}`;

            const searchRes = await fetch(searchUrl, { headers });

            if (!searchRes.ok) {
                if (searchRes.status === 403 || searchRes.status === 429) {
                    const result = {
                        users: [],
                        total_count: 0,
                        rateLimited: true,
                        error: "API rate limit exceeded. Please add a GitHub API key to increase your limit from 60 to 5,000 requests per hour.",
                    };
                    searchCache.set(cacheKey, result);
                    return result;
                }
                return {
                    users: [],
                    total_count: 0,
                    rateLimited: false,
                    error: `API Error (${searchRes.status}): ${searchRes.statusText}`,
                };
            }

            const searchData = (await searchRes.json()) as SearchResponse;
            const usernames = searchData.items.map((i) => i.login);

            let detailedUsers: GitHubUserDetail[] = [];

            if (apiKey && usernames.length > 0) {
                try {
                    const usersMap = await fetchGraphQLUserDetails(
                        usernames,
                        apiKey,
                    );

                    detailedUsers = usernames
                        .map((login) => usersMap[login.toLowerCase()] || null)
                        .filter((u): u is GitHubUserDetail => u !== null);
                } catch (e) {
                    console.error("GraphQL hydration failed", e);
                }
            }

            if (detailedUsers.length === 0) {
                const detailPromises = searchData.items.map(async (item) => {
                    try {
                        const detailRes = await fetch(
                            `${BASE_URL}/users/${item.login}`,
                            { headers },
                        );
                        if (!detailRes.ok) return null;
                        return (await detailRes.json()) as GitHubUserDetail;
                    } catch (_e) {
                        return null;
                    }
                });
                detailedUsers = (await Promise.all(detailPromises)).filter(
                    (u): u is GitHubUserDetail => u !== null,
                );
            }

            if (detailedUsers.length === 0 && searchData.items.length > 0) {
                const result = {
                    users: [],
                    total_count: searchData.total_count,
                    rateLimited: false,
                    error: "Failed to fetch user details. Please try again or add a GitHub API key.",
                };
                searchCache.set(cacheKey, result);
                return result;
            }

            if (sort === SortOption.FOLLOWERS) {
                detailedUsers.sort((a, b) => b.followers - a.followers);
            } else if (sort === SortOption.REPOS) {
                detailedUsers.sort((a, b) => b.public_repos - a.public_repos);
            } else if (sort === SortOption.JOINED) {
                detailedUsers.sort(
                    (a, b) =>
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime(),
                );
            }

            const result = {
                users: detailedUsers,
                total_count: searchData.total_count,
                rateLimited: false,
            };
            searchCache.set(cacheKey, result);
            return result;
        } catch (error) {
            console.error("Failed to fetch GitHub data", error);
            return {
                users: [],
                total_count: 0,
                rateLimited: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Connection failed.",
            };
        }
    },
);
