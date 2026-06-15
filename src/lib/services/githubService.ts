import { cache } from "react";
import type { GitHubEvent, GitHubRepository, GitHubUserDetail } from "@/types";

const BASE_URL = "https://api.github.com";
const GRAPHQL_URL = "https://api.github.com/graphql";
const LIGHT_USER_BATCH_SIZE = 50;

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
                console.log(
                    "[GitHub GraphQL] Attempting GraphQL fetch for user:",
                    username,
                );
                const now = new Date();
                const oneYearAgo = new Date(now);
                oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

                console.log("[GitHub GraphQL] Date range:", {
                    from: oneYearAgo.toISOString(),
                    to: now.toISOString(),
                });

                const graphqlQuery = `
                query($login: String!, $fromDate: DateTime!, $toDate: DateTime!) {
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
                    contributionsCollection(from: $fromDate, to: $toDate) {
                      contributionCalendar {
                        totalContributions
                        weeks {
                          contributionDays {
                            date
                            contributionCount
                          }
                        }
                      }
                    }
                  }
                }
              `;

                console.log(
                    "[GitHub GraphQL] Sending request to:",
                    GRAPHQL_URL,
                );
                console.log(
                    "[GitHub GraphQL] API Key (masked):",
                    apiKey
                        ? `${apiKey.substring(0, 7)}...${apiKey.substring(apiKey.length - 4)}`
                        : "NOT PROVIDED",
                );

                const response = await fetch(GRAPHQL_URL, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${apiKey}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        query: graphqlQuery,
                        variables: {
                            login: username,
                            fromDate: oneYearAgo.toISOString(),
                            toDate: now.toISOString(),
                        },
                    }),
                });

                console.log(
                    "[GitHub GraphQL] Response status:",
                    response.status,
                    response.statusText,
                );

                if (response.ok) {
                    const result = await response.json();
                    console.log(
                        "[GitHub GraphQL] Response data:",
                        JSON.stringify(result, null, 2),
                    );
                    if (result.data?.user) {
                        const data = result.data.user;
                        console.log(
                            "[GitHub GraphQL] User data extracted:",
                            data.login,
                        );
                        const totalStars =
                            data.repositories?.nodes?.reduce(
                                (acc: number, repo: unknown) =>
                                    acc +
                                    ((repo as { stargazerCount?: number })
                                        ?.stargazerCount || 0),
                                0,
                            ) || 0;

                        console.log(
                            "[GitHub GraphQL] Total stars calculated:",
                            totalStars,
                        );
                        console.log(
                            "[GitHub GraphQL] Contributions:",
                            data.contributionsCollection?.contributionCalendar
                                ?.totalContributions,
                        );

                        const userResult = {
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
                            contribution_streak: computeCurrentStreak(
                                data.contributionsCollection
                                    ?.contributionCalendar?.weeks,
                            ),
                        };

                        console.log(
                            "[GitHub GraphQL] Returning user with recent_activity_count:",
                            userResult.recent_activity_count,
                        );
                        return userResult;
                    } else {
                        console.error(
                            "[GitHub GraphQL] No user data in response:",
                            result,
                        );
                    }
                } else {
                    const errorData = await response.json().catch(() => null);
                    console.error(
                        "[GitHub GraphQL] Response NOT OK. Status:",
                        response.status,
                    );
                    if (errorData) {
                        console.error(
                            "[GitHub GraphQL] Error details:",
                            JSON.stringify(errorData, null, 2),
                        );
                    }
                }
            } catch (error) {
                console.error(
                    "[GitHub GraphQL] Exception occurred, falling back to REST:",
                    error,
                );
                console.warn("GraphQL user fetch failed, falling back to REST");
            }
        }

        const headers: HeadersInit = {
            Accept: "application/vnd.github.v3+json",
        };

        console.log("[GitHub REST] Using REST fallback for user:", username);

        try {
            console.log("[GitHub REST] Fetching basic user profile...");
            const response = await fetch(`${BASE_URL}/users/${username}`, {
                headers,
            });
            console.log(
                "[GitHub REST] Profile response status:",
                response.status,
            );
            if (!response.ok) {
                console.error(
                    "[GitHub REST] Profile fetch failed:",
                    response.status,
                );
                return null;
            }
            const user = (await response.json()) as GitHubUserDetail;
            console.log(
                "[GitHub REST] Basic user data received:",
                user.login,
                user.name,
                user.public_repos,
            );

            try {
                console.log(
                    "[GitHub REST] Fetching events for contributions...",
                );
                const eventsRes = await fetch(
                    `${BASE_URL}/users/${username}/events?per_page=100`,
                    { headers },
                );
                console.log(
                    "[GitHub REST] Events response status:",
                    eventsRes.status,
                );
                if (eventsRes.ok) {
                    const events = await eventsRes.json();
                    console.log(
                        "[GitHub REST] Events fetched:",
                        events.length,
                        "events",
                    );
                    user.recent_activity_count =
                        calculateCommitsFromEvents(events);
                    console.log(
                        "[GitHub REST] Calculated recent_activity_count:",
                        user.recent_activity_count,
                    );
                } else {
                    console.warn(
                        "[GitHub REST] Events fetch failed:",
                        eventsRes.status,
                    );
                    user.recent_activity_count = 0;
                }
            } catch (error) {
                console.error("[GitHub REST] Events fetch error:", error);
                user.recent_activity_count = 0;
            }

            try {
                console.log("[GitHub REST] Fetching repos for stars...");
                const reposRes = await fetch(
                    `${BASE_URL}/users/${username}/repos?per_page=100&type=owner&sort=pushed`,
                    { headers },
                );
                console.log(
                    "[GitHub REST] Repos response status:",
                    reposRes.status,
                );
                if (reposRes.ok) {
                    const repos = await reposRes.json();
                    console.log(
                        "[GitHub REST] Repos fetched:",
                        repos.length,
                        "repos",
                    );
                    if (Array.isArray(repos)) {
                        user.total_stars = repos.reduce(
                            (acc: number, repo: GitHubRepository) =>
                                acc + (repo.stargazers_count || 0),
                            0,
                        );
                        console.log(
                            "[GitHub REST] Calculated total_stars:",
                            user.total_stars,
                        );
                    }
                } else {
                    console.warn(
                        "[GitHub REST] Repos fetch failed:",
                        reposRes.status,
                    );
                }
            } catch (error) {
                console.error("[GitHub REST] Repos fetch error:", error);
                // Ignore star fetch errors
            }

            console.log(
                "[GitHub REST] Returning user data. recent_activity_count:",
                user.recent_activity_count,
            );
            return user;
        } catch (error) {
            console.error("Error fetching user:", error);
            return null;
        }
    },
);

export interface GitHubLightUser {
    login: string;
    id: number | null;
    avatar_url: string;
    html_url: string;
    name: string | null;
    company: string | null;
    location: string | null;
    public_repos: number;
    public_gists: number;
    followers: number;
    following: number;
    created_at: string | null;
}

interface ContributionDay {
    date?: string;
    contributionCount?: number;
}

interface ContributionWeek {
    contributionDays?: ContributionDay[];
}

/**
 * Computes the current contribution streak (consecutive days ending at the
 * most recent day with at least one contribution) from a GitHub contribution
 * calendar. The calendar covers a rolling ~1 year, so streaks are capped at
 * that window. Today is allowed to have zero contributions without breaking
 * the streak, since the day may simply not be over yet.
 */
function computeCurrentStreak(weeks: ContributionWeek[] | undefined): number {
    if (!Array.isArray(weeks)) return 0;

    const days = weeks
        .flatMap((week) => week?.contributionDays ?? [])
        .filter((day): day is Required<ContributionDay> => Boolean(day?.date))
        .sort((a, b) => a.date.localeCompare(b.date));

    if (days.length === 0) return 0;

    let streak = 0;
    // Walk backwards from the most recent day. Skip a trailing zero-count
    // "today" so an in-progress day doesn't reset the streak to 0.
    for (let i = days.length - 1; i >= 0; i--) {
        const count = days[i].contributionCount ?? 0;
        if (count > 0) {
            streak++;
        } else if (i === days.length - 1) {
        } else {
            break;
        }
    }

    return streak;
}

const LIGHT_USER_FIELDS = `
    login
    databaseId
    avatarUrl
    url
    name
    company
    location
    createdAt
    followers { totalCount }
    following { totalCount }
    gists(privacy: PUBLIC) { totalCount }
    repositories(ownerAffiliations: OWNER) { totalCount }
`;

/**
 * Posts a query to the GitHub GraphQL API and returns the parsed `data`.
 * Throws on transport/HTTP failure so callers can surface the error instead
 * of silently degrading to placeholder data.
 */
async function githubGraphQL<T = Record<string, unknown>>(
    query: string,
    variables: Record<string, unknown>,
    apiKey: string,
): Promise<T> {
    const response = await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
        throw new Error(
            `GitHub GraphQL request failed (${response.status} ${response.statusText})`,
        );
    }

    const json = (await response.json()) as {
        data?: T;
        errors?: unknown;
    };

    if (json.errors) {
        // Field-level errors (e.g. a single unknown login) are expected and
        // non-fatal — the corresponding alias is simply null in `data`.
        console.error(
            "[GitHub GraphQL] field errors:",
            JSON.stringify(json.errors),
        );
    }

    return (json.data ?? {}) as T;
}

async function fetchLightUserChunk(
    chunk: string[],
    apiKey: string,
    result: Map<string, GitHubLightUser>,
): Promise<void> {
    const fieldDefs = chunk
        .map(
            (_, i) =>
                `u${i}: user(login: $l${i}) { ${LIGHT_USER_FIELDS.trim()} }`,
        )
        .join("\n");
    const variableDefs = chunk.map((_, i) => `$l${i}: String!`).join(", ");
    const variables: Record<string, string> = {};
    chunk.forEach((login, i) => {
        variables[`l${i}`] = login;
    });

    const query = `query(${variableDefs}) {\n${fieldDefs}\n}`;

    const data = await githubGraphQL<Record<string, unknown>>(
        query,
        variables,
        apiKey,
    );

    for (let i = 0; i < chunk.length; i++) {
        const requestedLogin = chunk[i];
        const user = data[`u${i}`] as {
            login?: string;
            databaseId?: number;
            avatarUrl?: string;
            url?: string;
            name?: string | null;
            company?: string | null;
            location?: string | null;
            createdAt?: string;
            followers?: { totalCount?: number };
            following?: { totalCount?: number };
            gists?: { totalCount?: number };
            repositories?: { totalCount?: number };
        } | null;
        if (!user) {
            continue;
        }
        // Key by the requested login so callers can look the user up by the
        // login they passed in, even if GitHub canonicalises case/renames.
        result.set(requestedLogin, {
            login: user.login ?? requestedLogin,
            id: user.databaseId ?? null,
            avatar_url:
                user.avatarUrl ?? `https://github.com/${requestedLogin}.png`,
            html_url: user.url ?? `https://github.com/${requestedLogin}`,
            name: user.name ?? null,
            company: user.company ?? null,
            location: user.location ?? null,
            public_repos: user.repositories?.totalCount ?? 0,
            public_gists: user.gists?.totalCount ?? 0,
            followers: user.followers?.totalCount ?? 0,
            following: user.following?.totalCount ?? 0,
            created_at: user.createdAt ?? null,
        });
    }
}

export async function getUsersByLogins(
    logins: string[],
    apiKey?: string,
): Promise<Map<string, GitHubLightUser>> {
    const result = new Map<string, GitHubLightUser>();

    if (logins.length === 0) {
        return result;
    }

    if (!apiKey) {
        throw new Error("GitHub token is not configured (GITHUB_TOKEN unset)");
    }

    const chunks: string[][] = [];
    for (let i = 0; i < logins.length; i += LIGHT_USER_BATCH_SIZE) {
        chunks.push(logins.slice(i, i + LIGHT_USER_BATCH_SIZE));
    }

    // Let chunk failures propagate so the route returns an error rather than
    // silently rendering a slice of users with zeroed-out metrics.
    await Promise.all(
        chunks.map((chunk) => fetchLightUserChunk(chunk, apiKey, result)),
    );

    return result;
}
