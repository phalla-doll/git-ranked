import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import type { GitHubUserDetail } from "@/types";
import { SortOption } from "@/types";

const GRAPHQL_URL = "https://api.github.com/graphql";

interface SearchRequest {
    query: string;
    sort: string;
    cursor?: string;
    userToken?: string;
}

interface GraphQLSearchResult {
    users: GitHubUserDetail[];
    userCount: number;
    hasNextPage: boolean;
    endCursor: string | null;
    rateLimited: boolean;
    error?: string;
}

async function searchUsersGraphQL(
    query: string,
    sort: string,
    first: number = 25,
    after: string | null = null,
    token: string,
): Promise<GraphQLSearchResult> {
    const headers: HeadersInit = {
        "Content-Type": "application/json",
        Authorization: `bearer ${token}`,
    };

    let sortQuery: string;
    switch (sort) {
        case SortOption.FOLLOWERS:
            sortQuery = "followers-desc";
            break;
        case SortOption.REPOS:
            sortQuery = "repositories-desc";
            break;
        case SortOption.CONTRIBUTIONS:
            sortQuery = "repositories-desc";
            break;
        default:
            sortQuery = "joined-desc";
    }

    const searchQuery = `location:"${query}" sort:${sortQuery}`;

    const graphqlQuery = `
    query($searchQuery: String!, $type: SearchType!, $first: Int!, $after: String) {
      search(query: $searchQuery, type: $type, first: $first, after: $after) {
        userCount
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            ... on User {
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
              repositories(ownerAffiliations: OWNER) { totalCount }
              contributionsCollection {
                contributionCalendar { totalContributions }
              }
            }
          }
        }
      }
    }
  `;

    try {
        const response = await fetch(GRAPHQL_URL, {
            method: "POST",
            headers,
            body: JSON.stringify({
                query: graphqlQuery,
                variables: {
                    searchQuery,
                    type: "USER",
                    first,
                    after,
                },
            }),
        });

        if (!response.ok) {
            if (response.status === 403 || response.status === 429) {
                return {
                    users: [],
                    userCount: 0,
                    hasNextPage: false,
                    endCursor: null,
                    rateLimited: true,
                    error: "API rate limit exceeded.",
                };
            }
            return {
                users: [],
                userCount: 0,
                hasNextPage: false,
                endCursor: null,
                rateLimited: false,
                error: `API Error (${response.status}): ${response.statusText}`,
            };
        }

        const result = await response.json();

        const searchResult = result.data?.search;
        const edges = searchResult?.edges || [];

        if (result.errors && (!searchResult || edges.length === 0)) {
            return {
                users: [],
                userCount: 0,
                hasNextPage: false,
                endCursor: null,
                rateLimited: false,
                error: result.errors[0]?.message || "Search failed",
            };
        }

        const users: GitHubUserDetail[] = [];
        for (const edge of edges) {
            const node = edge.node;
            if (!node || !node.databaseId || !node.login || !node.avatarUrl) {
                continue;
            }

            const user: GitHubUserDetail = {
                login: node.login,
                id: node.databaseId,
                avatar_url: node.avatarUrl,
                html_url: node.url,
                name: node.name,
                company: node.company,
                blog: node.websiteUrl,
                location: node.location,
                email: node.email,
                bio: node.bio,
                public_repos: node.repositories?.totalCount || 0,
                public_gists: node.gists?.totalCount || 0,
                followers: node.followers?.totalCount || 0,
                following: node.following?.totalCount || 0,
                created_at: node.createdAt,
                recent_activity_count:
                    node.contributionsCollection?.contributionCalendar
                        ?.totalContributions || 0,
                total_stars: 0,
            };
            users.push(user);
        }

        return {
            users,
            userCount: searchResult.userCount,
            hasNextPage: searchResult.pageInfo?.hasNextPage || false,
            endCursor: searchResult.pageInfo?.endCursor || null,
            rateLimited: false,
        };
    } catch (error) {
        return {
            users: [],
            userCount: 0,
            hasNextPage: false,
            endCursor: null,
            rateLimited: false,
            error:
                error instanceof Error ? error.message : "Connection failed.",
        };
    }
}

export async function POST(request: Request) {
    const body: SearchRequest = await request.json();
    const { query, sort, cursor, userToken } = body;

    if (!query) {
        return NextResponse.json(
            { error: "Query is required" },
            { status: 400 },
        );
    }

    let token: string;
    let rateLimitHeaders = {};

    if (userToken?.trim()) {
        token = userToken.trim();
    } else {
        const serverToken = process.env.GITHUB_TOKEN;
        if (!serverToken) {
            return NextResponse.json(
                {
                    error: "Server API key not configured. Please add your own GitHub token.",
                    rateLimited: false,
                },
                { status: 500 },
            );
        }

        const ip = getClientIp(request);
        const rateCheck = checkRateLimit(ip);

        if (!rateCheck.allowed) {
            return NextResponse.json(
                {
                    error: "Rate limit exceeded. Please add your own GitHub token for unlimited access.",
                    rateLimited: true,
                    resetAt: rateCheck.resetAt,
                },
                {
                    status: 429,
                    headers: {
                        "X-RateLimit-Remaining": "0",
                        "X-RateLimit-Reset": String(rateCheck.resetAt),
                    },
                },
            );
        }

        token = serverToken;
        rateLimitHeaders = {
            "X-RateLimit-Remaining": String(rateCheck.remaining),
            "X-RateLimit-Reset": String(rateCheck.resetAt),
        };
    }

    const result = await searchUsersGraphQL(
        query,
        sort,
        25,
        cursor || null,
        token,
    );

    return NextResponse.json(
        {
            users: result.users,
            total_count: result.userCount,
            hasNextPage: result.hasNextPage,
            endCursor: result.endCursor,
            rateLimited: result.rateLimited,
            error: result.error,
        },
        { headers: rateLimitHeaders },
    );
}
