import { NextResponse } from "next/server";
import { getUsers } from "@/lib/services/notionService";
import { SortOption } from "@/types";

const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 100;

interface SearchQueryParams {
    q?: string;
    sort?: string;
    page?: string;
    pageSize?: string;
}

interface RouteContext {
    params: Promise<Record<string, never>>;
}

export async function GET(_request: Request, context: RouteContext) {
    await context.params;

    try {
        const { searchParams } = new URL(_request.url);
        const { q, sort, page, pageSize } = Object.fromEntries(
            searchParams,
        ) as SearchQueryParams;

        const currentPage = Math.max(1, parseInt(page || "1", 10));
        const requestedPageSize = Math.min(
            MAX_PAGE_SIZE,
            Math.max(1, parseInt(pageSize || DEFAULT_PAGE_SIZE.toString(), 10)),
        );

        const result = await getUsers();

        if (result.error) {
            const isNetworkError =
                result.error.includes("connection") ||
                result.error.includes("timeout") ||
                result.error.includes("circuit breaker") ||
                result.error.includes("rate limiting");

            return NextResponse.json(
                {
                    users: [],
                    total_count: 0,
                    page: currentPage,
                    page_size: requestedPageSize,
                    total_pages: 0,
                    has_more: false,
                    error: result.error,
                    errorType: isNetworkError ? "network" : "server",
                    timestamp: new Date().toISOString(),
                },
                { status: isNetworkError ? 503 : 500 },
            );
        }

        let filteredUsers = result.users;

        if (q?.trim()) {
            const lowerQuery = q.trim().toLowerCase();
            filteredUsers = result.users.filter((user) => {
                return (
                    user.location?.toLowerCase().includes(lowerQuery) ||
                    user.login.toLowerCase().includes(lowerQuery) ||
                    user.name?.toLowerCase().includes(lowerQuery)
                );
            });
        }

        const sortBy = sort || SortOption.FOLLOWERS;
        const sortedUsers = [...filteredUsers].sort((a, b) => {
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

        const total_count = sortedUsers.length;
        const total_pages = Math.ceil(total_count / requestedPageSize);
        const has_more = currentPage < total_pages;

        const startIndex = (currentPage - 1) * requestedPageSize;
        const endIndex = startIndex + requestedPageSize;
        const paginatedUsers = sortedUsers.slice(startIndex, endIndex);

        return NextResponse.json({
            users: paginatedUsers,
            total_count,
            page: currentPage,
            page_size: requestedPageSize,
            total_pages,
            has_more,
            error: null,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Error in /api/notion/users/search:", error);

        const errorMessage =
            error instanceof Error ? error.message : "Internal server error";
        const isNetworkError =
            errorMessage.includes("fetch") ||
            errorMessage.includes("connection") ||
            errorMessage.includes("timeout");

        return NextResponse.json(
            {
                users: [],
                total_count: 0,
                page: 1,
                page_size: DEFAULT_PAGE_SIZE,
                total_pages: 0,
                has_more: false,
                error: errorMessage,
                errorType: isNetworkError ? "network" : "server",
                timestamp: new Date().toISOString(),
            },
            { status: isNetworkError ? 503 : 500 },
        );
    }
}
