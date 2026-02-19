import { useCallback, useEffect, useRef, useState } from "react";
import { analytics } from "@/lib/analytics";
import { searchUsersInLocation } from "@/lib/services/githubService";
import type { GitHubUserDetail, SortOption } from "@/types";
import { SortOption as SO } from "@/types";

const MAX_FETCH = 100;
const MAX_DISPLAY = 100;

interface UsersCache {
    location: string;
    sortBy: SortOption;
    hasApiKey: boolean;
    users: GitHubUserDetail[];
    totalCount: number;
}

const sortUsers = (
    users: GitHubUserDetail[],
    sortBy: SortOption,
): GitHubUserDetail[] => {
    return [...users].sort((a, b) => {
        switch (sortBy) {
            case SO.FOLLOWERS:
                return (b.followers || 0) - (a.followers || 0);
            case SO.REPOS:
                return (b.public_repos || 0) - (a.public_repos || 0);
            case SO.JOINED:
                return (
                    new Date(a.created_at || 0).getTime() -
                    new Date(b.created_at || 0).getTime()
                );
            case SO.CONTRIBUTIONS:
                return (
                    (b.recent_activity_count || 0) -
                    (a.recent_activity_count || 0)
                );
            default:
                return 0;
        }
    });
};

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

    const cacheRef = useRef<UsersCache | null>(null);
    const locationRef = useRef(location);
    const sortByRef = useRef(sortBy);
    const apiKeyRef = useRef(apiKey);

    locationRef.current = location;
    sortByRef.current = sortBy;
    apiKeyRef.current = apiKey;

    const fetchAllUsersPaginated = useCallback(async () => {
        setLoading(true);
        setUsers([]);
        setError(null);
        setRateLimitHit(false);
        setRateLimitResetAt(null);
        setLoadingProgress({ current: 0, total: MAX_FETCH });

        const allUsers: GitHubUserDetail[] = [];
        let cursor: string | null = null;
        let totalFetched = 0;

        try {
            while (totalFetched < MAX_FETCH) {
                const result = await searchUsersInLocation(
                    locationRef.current,
                    sortByRef.current,
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

                if (result.users.length === 0 || !result.hasNextPage) {
                    break;
                }

                cursor = result.endCursor;
                setLoadingProgress({
                    current: totalFetched,
                    total: Math.min(result.total_count, MAX_FETCH),
                });
            }

            const sortedUsers = sortUsers(allUsers, sortByRef.current);

            cacheRef.current = {
                location: locationRef.current,
                sortBy: sortByRef.current,
                hasApiKey: !!apiKeyRef.current,
                users: sortedUsers,
                totalCount: sortedUsers.length,
            };

            setUsers(sortedUsers.slice(0, MAX_DISPLAY));
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

    // biome-ignore lint/correctness/useExhaustiveDependencies: refreshTrigger intentionally triggers re-fetch
    useEffect(() => {
        setUsers([]);
        setTotalCount(0);

        const cached = cacheRef.current;

        if (
            cached &&
            cached.location === location &&
            cached.sortBy === sortBy &&
            cached.hasApiKey === !!apiKey
        ) {
            setUsers(cached.users.slice(0, MAX_DISPLAY));
            setTotalCount(cached.totalCount);
            return;
        }

        cacheRef.current = null;
        fetchAllUsersPaginated();
    }, [location, sortBy, fetchAllUsersPaginated, refreshTrigger, apiKey]);

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
