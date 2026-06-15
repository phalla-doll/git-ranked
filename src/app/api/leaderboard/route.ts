import { NextResponse } from "next/server";
import { getCommitters, toRegionSlug } from "@/lib/services/committersService";
import {
    type GitHubLightUser,
    getUsersByLogins,
} from "@/lib/services/githubService";
import { type GitHubUserDetail, SortOption } from "@/types";

const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 100;
const BUILD_TTL_MS = 5 * 60 * 1000;

export const revalidate = 300;

interface BuiltLeaderboard {
    users: GitHubUserDetail[];
    dataAsof: string | null;
}

interface BuiltCacheEntry {
    data: BuiltLeaderboard;
    expires: number;
}

const builtCache = new Map<string, BuiltCacheEntry>();
const buildPromises = new Map<string, Promise<BuiltLeaderboard>>();

function sortUsers(
    users: GitHubUserDetail[],
    sortBy: SortOption,
): GitHubUserDetail[] {
    if (sortBy === SortOption.CONTRIBUTIONS) {
        return [...users];
    }

    return [...users].sort((a, b) => {
        switch (sortBy) {
            case SortOption.FOLLOWERS:
                return (b.followers || 0) - (a.followers || 0);
            case SortOption.REPOS:
                return (b.public_repos || 0) - (a.public_repos || 0);
            case SortOption.JOINED:
                return (
                    new Date(a.created_at || 0).getTime() -
                    new Date(b.created_at || 0).getTime()
                );
            default:
                return 0;
        }
    });
}

async function buildLeaderboard(region: string): Promise<BuiltLeaderboard> {
    const cached = builtCache.get(region);
    if (cached && cached.expires > Date.now()) {
        return cached.data;
    }

    const inFlight = buildPromises.get(region);
    if (inFlight) {
        return inFlight;
    }

    const promise = (async () => {
        const { users: commiters, dataAsof } = await getCommitters(region);
        const logins = commiters.map((committer) => committer.login);
        const apiKey = process.env.GITHUB_TOKEN;

        // GitHub enrichment (avatars, followers, repos, location, join date) is
        // best-effort. committers.top already provides the ranking and
        // contribution counts, so a missing/invalid token must not 500 the
        // whole leaderboard — degrade to committers.top data + fallback avatars.
        let githubMap = new Map<string, GitHubLightUser>();
        if (apiKey) {
            try {
                githubMap = await getUsersByLogins(logins, apiKey);
            } catch (error) {
                console.warn(
                    "[leaderboard] GitHub enrichment skipped, rendering committers.top data only:",
                    error instanceof Error ? error.message : error,
                );
            }
        } else {
            console.warn(
                "[leaderboard] GITHUB_TOKEN unset, rendering committers.top data only.",
            );
        }

        const users: GitHubUserDetail[] = commiters.map((committer) => {
            const gh = githubMap.get(committer.login);
            return {
                login: committer.login,
                id: gh?.id ?? 0,
                avatar_url:
                    gh?.avatar_url ??
                    `https://github.com/${committer.login}.png`,
                html_url:
                    gh?.html_url ?? `https://github.com/${committer.login}`,
                name: gh?.name ?? committer.name ?? null,
                company: gh?.company ?? null,
                blog: null,
                location: gh?.location ?? null,
                email: null,
                bio: null,
                public_repos: gh?.public_repos ?? 0,
                public_gists: gh?.public_gists ?? 0,
                followers: gh?.followers ?? 0,
                following: gh?.following ?? 0,
                created_at: gh?.created_at ?? "",
                recent_activity_count: committer.contributions ?? undefined,
                total_stars: 0,
            };
        });

        const result: BuiltLeaderboard = { users, dataAsof };
        builtCache.set(region, {
            data: result,
            expires: Date.now() + BUILD_TTL_MS,
        });
        return result;
    })();

    buildPromises.set(region, promise);
    try {
        return await promise;
    } finally {
        buildPromises.delete(region);
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    const currentPage = Math.max(
        1,
        Number.parseInt(searchParams.get("page") || "1", 10),
    );
    const requestedPageSize = Math.min(
        MAX_PAGE_SIZE,
        Math.max(
            1,
            Number.parseInt(
                searchParams.get("pageSize") || DEFAULT_PAGE_SIZE.toString(),
                10,
            ),
        ),
    );
    const sortByParam = searchParams.get("sort");
    const sortBy = (
        Object.values(SortOption).includes(sortByParam as SortOption)
            ? sortByParam
            : SortOption.CONTRIBUTIONS
    ) as SortOption;

    const region = toRegionSlug(searchParams.get("q"));

    try {
        const { users, dataAsof } = await buildLeaderboard(region);
        const sorted = sortUsers(users, sortBy);

        const total_count = sorted.length;
        const total_pages = Math.ceil(total_count / requestedPageSize);
        const has_more = currentPage < total_pages;
        const startIndex = (currentPage - 1) * requestedPageSize;
        const paginatedUsers = sorted.slice(
            startIndex,
            startIndex + requestedPageSize,
        );

        return NextResponse.json({
            users: paginatedUsers,
            total_count,
            page: currentPage,
            page_size: requestedPageSize,
            total_pages,
            has_more,
            data_asof: dataAsof,
            error: null,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Error in /api/leaderboard:", error);

        const errorMessage =
            error instanceof Error ? error.message : "Internal server error";

        // An unknown region returns a 404 from committers.top — that is a
        // "no data for this location" case, not an outage.
        const isUnknownRegion = /committers\.top fetch failed \(404\)/.test(
            errorMessage,
        );
        const isNetworkError =
            !isUnknownRegion &&
            (errorMessage.includes("committers.top") ||
                errorMessage.includes("connection") ||
                errorMessage.includes("timeout") ||
                errorMessage.includes("ENOTFOUND") ||
                errorMessage.includes("ECONNREFUSED"));

        let clientError: string;
        let errorType: string;
        let status: number;
        if (isUnknownRegion) {
            clientError = `No leaderboard data available for "${region}" yet.`;
            errorType = "not_found";
            status = 404;
        } else if (isNetworkError) {
            clientError =
                "Unable to reach ranking data source. Please try again later.";
            errorType = "network";
            status = 503;
        } else {
            clientError = errorMessage;
            errorType = "server";
            status = 500;
        }

        return NextResponse.json(
            {
                users: [],
                total_count: 0,
                page: currentPage,
                page_size: requestedPageSize,
                total_pages: 0,
                has_more: false,
                data_asof: null,
                error: clientError,
                errorType,
                timestamp: new Date().toISOString(),
            },
            { status },
        );
    }
}
