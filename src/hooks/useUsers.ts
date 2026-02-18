import { useCallback, useEffect, useRef, useState } from "react";
import { searchUsersInLocation } from "@/lib/services/githubService";
import type { GitHubUserDetail, SortOption } from "@/types";
import { SortOption as SO } from "@/types";

const USERS_PER_PAGE = 50;
const MAX_CONTRIBUTION_USERS = 1000;

interface ContributionCache {
    location: string;
    users: GitHubUserDetail[];
    totalCount: number;
}

export function useUsers(
    location: string,
    sortBy: SortOption,
    page: number,
    apiKey: string,
) {
    const [users, setUsers] = useState<GitHubUserDetail[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState(0);
    const [rateLimitHit, setRateLimitHit] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState<{
        current: number;
        total: number;
    } | null>(null);

    const cursorsRef = useRef<Record<number, string>>({});
    const contributionCacheRef = useRef<ContributionCache | null>(null);

    const isContributionSort = sortBy === SO.CONTRIBUTIONS;

    const fetchAllUsersForContributions = useCallback(async () => {
        setLoading(true);
        setUsers([]);
        setError(null);
        setRateLimitHit(false);
        setLoadingProgress({ current: 0, total: 0 });

        const allUsers: GitHubUserDetail[] = [];
        let cursor: string | null = null;
        let totalFetched = 0;
        let estimatedTotal = MAX_CONTRIBUTION_USERS;

        try {
            while (totalFetched < MAX_CONTRIBUTION_USERS) {
                const result = await searchUsersInLocation(
                    location,
                    SO.FOLLOWERS,
                    1,
                    apiKey,
                    cursor || undefined,
                );

                if (result.error) {
                    setError(result.error);
                    break;
                }

                if (result.rateLimited) {
                    setRateLimitHit(true);
                    setError(
                        "API rate limit exceeded. Please try again later.",
                    );
                    break;
                }

                allUsers.push(...result.users);
                totalFetched += result.users.length;

                if (totalFetched === 0 || !result.hasNextPage) {
                    break;
                }

                cursor = result.endCursor;
                estimatedTotal = Math.min(
                    result.total_count,
                    MAX_CONTRIBUTION_USERS,
                );
                setLoadingProgress({
                    current: totalFetched,
                    total: estimatedTotal,
                });
            }

            const sortedUsers = allUsers.sort(
                (a, b) =>
                    (b.recent_activity_count || 0) -
                    (a.recent_activity_count || 0),
            );

            contributionCacheRef.current = {
                location,
                users: sortedUsers,
                totalCount: sortedUsers.length,
            };

            setUsers(sortedUsers.slice(0, USERS_PER_PAGE));
            setTotalCount(sortedUsers.length);
            setHasNextPage(sortedUsers.length > USERS_PER_PAGE);
        } catch (err) {
            console.error(err);
            setError(
                "An unexpected error occurred while processing your request.",
            );
        } finally {
            setLoading(false);
            setLoadingProgress(null);
        }
    }, [location, apiKey]);

    const fetchPaginatedUsers = useCallback(async () => {
        setLoading(true);
        setUsers([]);
        setError(null);
        setRateLimitHit(false);

        try {
            const {
                users: fetchedUsers,
                total_count,
                rateLimited,
                error: apiError,
                hasNextPage: hasNext,
                endCursor,
            } = await searchUsersInLocation(
                location,
                sortBy,
                page,
                apiKey,
                cursorsRef.current[page - 1],
            );

            if (apiError) {
                setError(apiError);
            } else {
                setUsers(fetchedUsers);
                setTotalCount(total_count);
                setRateLimitHit(rateLimited);
                setHasNextPage(hasNext);

                if (endCursor && hasNext) {
                    cursorsRef.current = {
                        ...cursorsRef.current,
                        [page]: endCursor,
                    };
                }
            }
        } catch (err) {
            console.error(err);
            setError(
                "An unexpected error occurred while processing your request.",
            );
        } finally {
            setLoading(false);
        }
    }, [location, page, sortBy, apiKey]);

    useEffect(() => {
        cursorsRef.current = {};
        const cached = contributionCacheRef.current;

        if (cached && cached.location === location) {
            setUsers(cached.users.slice(0, USERS_PER_PAGE));
            setTotalCount(cached.totalCount);
            setHasNextPage(cached.users.length > USERS_PER_PAGE);
            return;
        }

        contributionCacheRef.current = null;

        if (isContributionSort) {
            fetchAllUsersForContributions();
        } else {
            fetchPaginatedUsers();
        }
    }, [
        location,
        isContributionSort,
        fetchAllUsersForContributions,
        fetchPaginatedUsers,
    ]);

    useEffect(() => {
        if (isContributionSort) {
            const cached = contributionCacheRef.current;
            if (cached) {
                const startIndex = (page - 1) * USERS_PER_PAGE;
                const endIndex = startIndex + USERS_PER_PAGE;
                setUsers(cached.users.slice(startIndex, endIndex));
                setHasNextPage(endIndex < cached.users.length);
            }
        }
    }, [page, isContributionSort]);

    return {
        users,
        loading,
        error,
        totalCount,
        rateLimitHit,
        hasNextPage,
        loadingProgress,
    };
}
