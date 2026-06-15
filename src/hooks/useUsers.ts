import { useCallback, useEffect, useRef, useState } from "react";
import { analytics } from "@/lib/analytics";
import type { GitHubUserDetail, SortOption } from "@/types";

const PAGE_SIZE = 100;
const MAX_DISPLAY = 500;

interface UsersCache {
    location: string;
    sortBy: SortOption;
    users: GitHubUserDetail[];
    totalCount: number;
    dataAsof: string | null;
}

interface SearchResponse {
    users: GitHubUserDetail[];
    total_count: number;
    page: number;
    page_size: number;
    total_pages: number;
    has_more: boolean;
    data_asof?: string | null;
    error?: string;
    errorType?: string;
}

export function useUsers(
    location: string,
    sortBy: SortOption,
    _refreshTrigger: number = 0,
) {
    const [users, setUsers] = useState<GitHubUserDetail[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState(0);
    const [dataAsof, setDataAsof] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);

    const cacheRef = useRef<UsersCache | null>(null);
    const locationRef = useRef(location);
    const sortByRef = useRef(sortBy);

    locationRef.current = location;
    sortByRef.current = sortBy;

    const fetchPage = useCallback(
        async (pageNum: number, isLoadMore: boolean = false): Promise<void> => {
            if (isLoadMore) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }

            try {
                const params = new URLSearchParams({
                    q: locationRef.current,
                    sort: sortByRef.current,
                    page: pageNum.toString(),
                    pageSize: PAGE_SIZE.toString(),
                });

                const response = await fetch(`/api/leaderboard?${params}`);

                if (!response.ok) {
                    const errorData = await response.json();
                    const errorMessage =
                        errorData.error ||
                        `HTTP error! status: ${response.status}`;
                    throw new Error(errorMessage);
                }

                const data: SearchResponse = await response.json();

                if (data.error) {
                    setError(data.error);
                    analytics.apiError(data.error);
                    return;
                }

                const newUsers = data.users;

                if (isLoadMore) {
                    setUsers((prev) =>
                        [...prev, ...newUsers].slice(0, MAX_DISPLAY),
                    );
                } else {
                    setUsers(newUsers.slice(0, MAX_DISPLAY));
                }

                setTotalCount(data.total_count);
                setDataAsof(data.data_asof ?? null);
                setHasMore(data.has_more);
                setError(null);

                cacheRef.current = {
                    location: locationRef.current,
                    sortBy: sortByRef.current,
                    users: isLoadMore
                        ? [...(cacheRef.current?.users || []), ...newUsers]
                        : newUsers,
                    totalCount: data.total_count,
                    dataAsof: data.data_asof ?? null,
                };
            } catch (err) {
                console.error(err);

                let errorMessage =
                    "An unexpected error occurred while processing your request.";

                if (err instanceof Error) {
                    if (
                        err.message.includes("connection") ||
                        err.message.includes("timeout") ||
                        err.message.includes("circuit breaker") ||
                        err.message.includes("rate limiting") ||
                        err.message.includes("Failed to fetch") ||
                        err.message.includes("NetworkError")
                    ) {
                        errorMessage =
                            "Network error. Please check your connection and try again.";
                    } else {
                        // The API already returns user-friendly messages for
                        // data-source / not-found errors; surface them as-is.
                        errorMessage = err.message;
                    }
                }

                setError(errorMessage);
                analytics.apiError(errorMessage);
            } finally {
                if (isLoadMore) {
                    setLoadingMore(false);
                } else {
                    setLoading(false);
                }
            }
        },
        [],
    );

    const loadMore = useCallback(async () => {
        if (loadingMore || !hasMore) {
            return;
        }
        const nextPage = page + 1;
        setPage(nextPage);
        await fetchPage(nextPage, true);
    }, [loadingMore, hasMore, page, fetchPage]);

    const reset = useCallback(async () => {
        setUsers([]);
        setPage(1);
        setHasMore(false);
        setError(null);
        setDataAsof(null);

        const cached = cacheRef.current;

        if (
            cached &&
            cached.location === locationRef.current &&
            cached.sortBy === sortByRef.current
        ) {
            setUsers(cached.users.slice(0, MAX_DISPLAY));
            setTotalCount(cached.totalCount);
            setDataAsof(cached.dataAsof);
            setPage(Math.ceil(cached.users.length / PAGE_SIZE));
            setHasMore(cached.totalCount > PAGE_SIZE);
            return;
        }

        cacheRef.current = null;
        await fetchPage(1, false);
    }, [fetchPage]);

    // biome-ignore lint/correctness/useExhaustiveDependencies: Dependencies are needed to reset on changes
    useEffect(() => {
        reset();
    }, [location, sortBy, _refreshTrigger, reset]);

    return {
        users,
        allUsers: users,
        loading,
        loadingMore,
        error,
        totalCount,
        dataAsof,
        hasMore,
        loadMore,
    };
}
