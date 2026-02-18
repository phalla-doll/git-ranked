import { LRUCache } from "lru-cache";
import { cache } from "react";
import type {
    GitHubEvent,
    GitHubRepository,
    GitHubUserDetail,
    GraphQLRepositoryNode,
    SortOption,
} from "@/types";

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

export const getUserByName = cache(
    async (
        username: string,
        apiKey?: string,
    ): Promise<GitHubUserDetail | null> => {
        if (apiKey) {
            try {
                const graphqlQuery = `
                query($login: String!) {
                  user(login: $login) {
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
                    repositories(first: 30, ownerAffiliations: OWNER, orderBy: {field: STARGAZERS, direction: DESC}) {
                      totalCount
                      nodes {
                        stargazerCount
                      }
                    }
                    contributionsCollection {
                      contributionCalendar { totalContributions }
                    }
                  }
                }
              `;

                const response = await fetch(GRAPHQL_URL, {
                    method: "POST",
                    headers: {
                        Authorization: `bearer ${apiKey}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        query: graphqlQuery,
                        variables: { login: username },
                    }),
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.data?.user) {
                        const data = result.data.user;
                        const totalStars =
                            data.repositories?.nodes?.reduce(
                                (acc: number, repo: GraphQLRepositoryNode) =>
                                    acc + (repo.stargazerCount || 0),
                                0,
                            ) || 0;

                        return {
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
                }
            } catch (_e) {
                console.warn("GraphQL user fetch failed, falling back to REST");
            }
        }

        const headers: HeadersInit = {
            Accept: "application/vnd.github.v3+json",
        };

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
        after?: string,
    ): Promise<{
        users: GitHubUserDetail[];
        total_count: number;
        hasNextPage: boolean;
        endCursor: string | null;
        rateLimited: boolean;
        error?: string;
    }> => {
        const cacheKey = `${query}:${sort}:${page}:${after || "none"}:${apiKey ? "user-key" : "server-key"}`;
        const cached = searchCache.get(cacheKey);
        if (cached) {
            return cached as {
                users: GitHubUserDetail[];
                total_count: number;
                hasNextPage: boolean;
                endCursor: string | null;
                rateLimited: boolean;
                error?: string;
            };
        }

        try {
            const response = await fetch("/api/github/search", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    query,
                    sort,
                    cursor: after,
                    userToken: apiKey,
                }),
            });

            const result = await response.json();

            const finalResult = {
                users: result.users || [],
                total_count: result.total_count || 0,
                hasNextPage: result.hasNextPage || false,
                endCursor: result.endCursor || null,
                rateLimited: result.rateLimited || false,
                error: result.error,
            };

            searchCache.set(cacheKey, finalResult);
            return finalResult;
        } catch (error) {
            return {
                users: [],
                total_count: 0,
                hasNextPage: false,
                endCursor: null,
                rateLimited: false,
                error:
                    error instanceof Error ? error.message : "Request failed",
            };
        }
    },
);
