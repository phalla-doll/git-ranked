import { cache } from "react";
import type { GitHubEvent, GitHubRepository, GitHubUserDetail } from "@/types";

const BASE_URL = "https://api.github.com";
const GRAPHQL_URL = "https://api.github.com/graphql";

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
                                (acc: number, repo: unknown) =>
                                    acc +
                                    ((repo as { stargazerCount?: number })
                                        ?.stargazerCount || 0),
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
