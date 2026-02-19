import { useCallback, useEffect, useRef, useState } from "react";
import { analytics } from "@/lib/analytics";
import { searchUsersInLocation } from "@/lib/services/githubService";
import type { GitHubUserDetail, SortOption } from "@/types";
import { SortOption as SO } from "@/types";

const MAX_USERS = 100;
const MAX_CONTRIBUTION_USERS = 2000;

interface ContributionCache {
    location: string;
    users: GitHubUserDetail[];
    totalCount: number;
}

export function useUsers(
    location: string,
    sortBy: SortOption,
    apiKey: string,
    refreshTrigger: number = 0,
) {
    const [users, setUsers] = useState<GitHubUserDetail[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState(0);
    const [rateLimitHit, setRateLimitHit] = useState(false);
    const [rateLimitResetAt, setRateLimitResetAt] = useState<number | null>(
        null,
    );
    const [loadingProgress, setLoadingProgress] = useState<{
        current: number;
        total: number;
    } | null>(null);

    const contributionCacheRef = useRef<ContributionCache | null>(null);
    const locationRef = useRef(location);
    const sortByRef = useRef(sortBy);
    const apiKeyRef = useRef(apiKey);

    locationRef.current = location;
    sortByRef.current = sortBy;
    apiKeyRef.current = apiKey;

    const isContributionSort = sortBy === SO.CONTRIBUTIONS;

    const fetchAllUsersForContributions = useCallback(async () => {
        setLoading(true);
        setUsers([]);
        setError(null);
        setRateLimitHit(false);
        setRateLimitResetAt(null);
        setLoadingProgress({ current: 0, total: 0 });

        const allUsers: GitHubUserDetail[] = [];
        let cursor: string | null = null;
        let totalFetched = 0;
        let estimatedTotal = MAX_CONTRIBUTION_USERS;

        try {
            while (totalFetched < MAX_CONTRIBUTION_USERS) {
                const result = await searchUsersInLocation(
                    locationRef.current,
                    SO.REPOS,
                    1,
                    apiKeyRef.current,
                    cursor || undefined,
                );

                if (result.error) {
                    setError(result.error);
                    analytics.apiError(result.error);
                    break;
                }

                if (result.rateLimited) {
                    setRateLimitHit(true);
                    setRateLimitResetAt(result.resetAt || null);
                    setError(
                        "API rate limit exceeded. Please try again later.",
                    );
                    analytics.rateLimitHit();
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
                location: locationRef.current,
                users: sortedUsers,
                totalCount: sortedUsers.length,
            };

            setUsers(sortedUsers.slice(0, MAX_USERS));
            setTotalCount(sortedUsers.length);
        } catch (err) {
            console.error(err);
            const errorMessage =
                "An unexpected error occurred while processing your request.";
            setError(errorMessage);
            analytics.apiError(errorMessage);
        } finally {
            setLoading(false);
            setLoadingProgress(null);
        }
    }, []);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        setRateLimitHit(false);
        setRateLimitResetAt(null);

        try {
            const {
                users: fetchedUsers,
                total_count,
                rateLimited,
                resetAt,
                error: apiError,
            } = await searchUsersInLocation(
                locationRef.current,
                sortByRef.current,
                1,
                apiKeyRef.current,
            );

            if (apiError) {
                setError(apiError);
                analytics.apiError(apiError);
            } else {
                setUsers(fetchedUsers.slice(0, MAX_USERS));
                setTotalCount(total_count);
                setRateLimitHit(rateLimited);
                if (rateLimited) {
                    analytics.rateLimitHit();
                }
                setRateLimitResetAt(resetAt || null);
            }
        } catch (err) {
            console.error(err);
            const errorMessage =
                "An unexpected error occurred while processing your request.";
            setError(errorMessage);
            analytics.apiError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    // biome-ignore lint/correctness/useExhaustiveDependencies: refreshTrigger intentionally triggers re-fetch
    useEffect(() => {
        setUsers([]);
        setTotalCount(0);

        const cached = contributionCacheRef.current;

        if (cached && cached.location === location) {
            setUsers(cached.users.slice(0, MAX_USERS));
            setTotalCount(cached.totalCount);
            return;
        }

        contributionCacheRef.current = null;

        if (isContributionSort) {
            fetchAllUsersForContributions();
        } else {
            fetchUsers();
        }
    }, [
        location,
        isContributionSort,
        fetchAllUsersForContributions,
        fetchUsers,
        refreshTrigger,
    ]);

    return {
        users,
        loading,
        error,
        totalCount,
        rateLimitHit,
        rateLimitResetAt,
        loadingProgress,
    };
}
